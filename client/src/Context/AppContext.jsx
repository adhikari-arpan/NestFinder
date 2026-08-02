import { createContext, useState, useEffect, useCallback } from "react";
import supabase from "../../db/supabaseClient";
import * as api from "../api/listingsapi";
import * as aiApi from "../api/aiApi";
import { haversineDistance } from "../utils/geo";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  // Database-backed state
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [tenantPreferences, setTenantPreferences] = useState({
    budget: 15000,
    preferredCity: "Lalitpur",
    sharing: "Single",
    roomType: "Room",
    essentialAmenities: ["WiFi", "Hot Water"],
    poiLocation: { name: "NCIT College", lat: 27.6644, lng: 85.3188 },
    radius: 1000,
  });

  const [savedListings, setSavedListings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const refreshListings = useCallback(async () => {
    setListingsLoading(true);
    try {
      const data = await api.fetchListings();
      setListings(data);
    } catch (err) {
      console.error("Failed to load listings:", err.message);
    } finally {
      setListingsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshListings();
  }, [refreshListings]);

  // ------------------------------------------------------------
  // Auth
  // ------------------------------------------------------------
  const loginUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, message: error.message };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, name, phone, email, is_verified, kyc_status")
      .eq("id", data.user.id)
      .single();

    setCurrentUser({ ...data.user, ...profile });
    pushNotification(
      data.user.id,
      "Logged in successfully",
      `Welcome back, ${profile.name}!`,
      "auth",
    );
    return { success: true, message: "" };
  };

  const logoutUser = () => setCurrentUser(null);

  // Re-fetch the profile row for the logged-in user, e.g. after a KYC
  // submission or admin review changes kyc_status/is_verified mid-session.
  const refreshCurrentUser = async () => {
    if (!currentUser) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .single();
    if (profile) setCurrentUser((prev) => ({ ...prev, ...profile }));
  };

  const signupUser = async (email, password, name, phone, role) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, role } },
    });
    if (error) return { success: false, message: error.message };
    return {
      success: true,
      message: "Account created successfully! Please sign in.",
    };
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) =>
            setCurrentUser({ ...session.user, ...profile }),
          );
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) setCurrentUser(null);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load saved listings + notifications once we know who's logged in
  useEffect(() => {
    if (!currentUser) {
      setSavedListings([]);
      setNotifications([]);
      return;
    }
    api
      .fetchSavedListingIds(currentUser.id)
      .then(setSavedListings)
      .catch(console.error);
    api
      .fetchNotifications(currentUser.id)
      .then(setNotifications)
      .catch(console.error);
  }, [currentUser]);

  // ------------------------------------------------------------
  // Notifications
  // ------------------------------------------------------------
  const pushNotification = async (userId, title, message, type = "info") => {
    try {
      await api.addNotification(userId, title, message, type);
      setNotifications((prev) => [
        {
          id: Date.now(),
          title,
          message,
          type,
          read: false,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      console.error("Failed to save notification:", err.message);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
    try {
      await api.markNotificationRead(notificationId);
    } catch (err) {
      console.error("Failed to mark notification as read:", err.message);
    }
  };

  const markAllNotificationsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await Promise.all(unreadIds.map((id) => api.markNotificationRead(id)));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err.message);
    }
  };

  const clearAllNotifications = async () => {
    if (!currentUser || notifications.length === 0) return;
    const previous = notifications;
    setNotifications([]);
    try {
      await api.clearAllNotifications(currentUser.id);
    } catch (err) {
      console.error("Failed to clear notifications:", err.message);
      setNotifications(previous);
    }
  };

  // ------------------------------------------------------------
  // Saved listings
  // ------------------------------------------------------------
  const toggleSaveListing = async (id) => {
    if (!currentUser) return;
    const isSaved = savedListings.includes(id);
    try {
      await api.toggleSavedListing(currentUser.id, id, isSaved);
      setSavedListings((prev) =>
        isSaved ? prev.filter((x) => x !== id) : [...prev, id],
      );
      if (!isSaved) {
        const item = listings.find((l) => l.id === id);
        pushNotification(
          currentUser.id,
          "Saved Room",
          `You saved "${item?.title}"`,
          "save",
        );
      }
    } catch (err) {
      console.error("Failed to toggle saved listing:", err.message);
    }
  };

  // ------------------------------------------------------------
  // Listings CRUD
  // ------------------------------------------------------------
  const createListing = async (formData) => {
    if (!currentUser)
      return {
        success: false,
        message: "You must be logged in to post a listing.",
      };
    if (currentUser.role === "landlord" && !currentUser.is_verified)
      return {
        success: false,
        message: "Complete KYC verification to post listings.",
      };
    try {
      const newListing = await api.createListing(formData, currentUser.id);
      setListings((prev) => [newListing, ...prev]);
      pushNotification(
        currentUser.id,
        "Room Listing Posted",
        `Your room "${newListing.title}" is pending admin moderation.`,
        "listing",
      );
      return { success: true, listing: newListing };
    } catch (err) {
      console.error("Failed to create listing:", err.message);
      return {
        success: false,
        message: err.message || "Something went wrong. Please try again.",
      };
    }
  };

  const updateListingStatus = async (id, newStatus) => {
    try {
      await api.updateListingStatus(id, newStatus);
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)),
      );
      if (currentUser) {
        pushNotification(
          currentUser.id,
          "Listing Moderated",
          `Listing ${id} was set to ${newStatus}.`,
          "admin",
        );
      }
    } catch (err) {
      console.error("Failed to update listing status:", err.message);
    }
  };

  const deleteListing = async (id) => {
    try {
      await api.deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Failed to delete listing:", err.message);
      return {
        success: false,
        message:
          err.message || "Could not delete this listing. Please try again.",
      };
    }
  };

  const updateListing = async (id, formData) => {
    try {
      const updated = await api.updateListing(id, formData);
      setListings((prev) => prev.map((l) => (l.id === id ? updated : l)));
      return { success: true, listing: updated };
    } catch (err) {
      console.error("Failed to update listing:", err.message);
      return {
        success: false,
        message:
          err.message || "Could not update this listing. Please try again.",
      };
    }
  };

  // ------------------------------------------------------------
  // Inquiries
  // ------------------------------------------------------------
  const sendInquiry = async (listingId, messageDetails) => {
    try {
      await api.sendInquiry(listingId, messageDetails, currentUser?.id || null);
      if (currentUser) {
        pushNotification(
          currentUser.id,
          "Inquiry Sent",
          "Your message was delivered to the landlord.",
          "message",
        );
      }
    } catch (err) {
      console.error("Failed to send inquiry:", err.message);
    }
  };

  const replyToInquiry = async (inquiryId, replyMsg) => {
    try {
      await api.replyToInquiry(inquiryId, replyMsg);
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === inquiryId
            ? { ...inq, status: "replied", replyText: replyMsg }
            : inq,
        ),
      );
    } catch (err) {
      console.error("Failed to reply to inquiry:", err.message);
    }
  };

  const loadLandlordInquiries = async () => {
    if (!currentUser) return;
    try {
      const data = await api.fetchInquiriesForLandlord(currentUser.id);
      setInquiries(data);
    } catch (err) {
      console.error("Failed to load inquiries:", err.message);
    }
  };

  useEffect(() => {
  if (currentUser?.role === 'landlord') {
    loadLandlordInquiries();
  }
}, [currentUser]);

  // ------------------------------------------------------------
  // Recommendation scoring — unchanged, runs client-side on
  // whatever listings are currently loaded: Rule-based score.
  // ------------------------------------------------------------
  const calculateRecommendationScore = (listing, prefs) => {
    if (!prefs) return { score: 0, proximityInfo: null };

    // Each factor is scored 0–1 first, then combined with weights.
    // This keeps things transparent and avoids one factor accidentally dominating

    // 1. Budget fit
    let budgetScore;
    if (listing.price <= prefs.budget) {
      budgetScore = 1; // fully within budget
    } else {
      const overPct = (listing.price - prefs.budget) / prefs.budget;
      budgetScore = Math.max(0, 1 - overPct * 1.5); // scales down the further over
    }

    // 2. City match
    const cityScore =
      prefs.preferredCity &&
      listing.city.toLowerCase() === prefs.preferredCity.toLowerCase()
        ? 1
        : 0;

    // 3. Sharing type match
    const sharingScore =
      prefs.sharing && listing.sharing === prefs.sharing ? 1 : 0;

    // 4. Room type match
    const roomTypeScore =
      prefs.roomType && listing.type === prefs.roomType ? 1 : 0;

    // 5. Amenity coverage (proportion matched, not flat penalty)
    let amenityScore = 1;
    if (prefs.essentialAmenities?.length) {
      const matched = prefs.essentialAmenities.filter((a) =>
        listing.amenities.includes(a),
      ).length;
      amenityScore = matched / prefs.essentialAmenities.length;
    }

    // 6. Location proximity — real distance from the chosen point
    let proximityScore = 0.5;
    let proximityInfo = null; // carries display info to the frontend

    if (prefs.poiLocation) {
      const radius = prefs.radius || 1000;

      if (listing.latitude != null && listing.longitude != null) {
        const dist = haversineDistance(
          prefs.poiLocation.lat,
          prefs.poiLocation.lng,
          listing.latitude,
          listing.longitude,
        );
        if (dist <= radius) {
          proximityScore = 1 - dist / radius; // within radius: 1 down to 0
          proximityInfo = { withinRadius: true, distance: dist, over: 0 };
        } else {
          const overBy = dist - radius;
          // still give partial credit, decaying further the more it exceeds radius
          proximityScore = Math.max(0, 0.3 - (overBy / radius) * 0.3);
          proximityInfo = { withinRadius: false, distance: dist, over: overBy };
        }
      } else {
        proximityScore = 0;
        proximityInfo = { withinRadius: false, distance: null, over: null };
      }
    }

    // Weights: how much each factor matters. These should add up to 1.
    const weights = {
      budget: 0.25,
      city: 0.15,
      sharing: 0.15,
      roomType: 0.1,
      amenity: 0.2,
      proximity: 0.15,
    };

    const finalScore =
      weights.budget * budgetScore +
      weights.city * cityScore +
      weights.sharing * sharingScore +
      weights.roomType * roomTypeScore +
      weights.amenity * amenityScore +
      weights.proximity * proximityScore;

    return { score: Math.round(finalScore * 100), proximityInfo }; // convert to 0–100 percentage
  };

  const getRecommendedListings = (prefs = tenantPreferences) => {
    return (
      listings
        // .filter((l) => l.status === "verified") // Temporarily disabled for development
        .map((listing) => {
          const { score, proximityInfo } = calculateRecommendationScore(
            listing,
            prefs,
          );
          return { ...listing, matchScore: score, proximityInfo };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
    );
  };

  // ------------------------------------------------------------
  // AI-powered recommendations via the Flask embedding service.
  // Falls back to the rule-based scoring above if the AI service
  // is unreachable, so the tenant flow never fully breaks.
  // ------------------------------------------------------------
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const getAIRecommendedListings = async (prefs = tenantPreferences) => {
    setAiLoading(true);
    setAiError("");
    try {
      const scores = await aiApi.fetchAIRecommendations({
        ...prefs,
        savedListingIds: savedListings,
      });

      // Look up full listing objects by id
      const listingMap = Object.fromEntries(listings.map((l) => [l.id, l]));

      // IMPORTANT: iterate over `scores` (Flask's response order), not
      // `listings`, and do NOT sort — the backend order IS the ranking.
      // Flask returns results already reranked by MMR (relevance +
      // diversity), and a client-side .sort() would erase that.
      return scores
        .map((s) => {
          const listing = listingMap[s.id];
          if (!listing) return null; // score for a listing we don't have loaded
          return {
            ...listing,
            matchScore: s.matchScore,
            semanticScore: s.semanticScore ?? 0,
            breakdown: s.breakdown ?? null,
          };
        })
        .filter(Boolean);
    } catch (err) {
      console.error(
        "AI recommendation failed, falling back to rule-based:",
        err.message,
      );
      setAiError(
        "AI service unavailable — showing rule-based matches instead.",
      );
      return getRecommendedListings(prefs);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        listings,
        listingsLoading,
        refreshListings,
        inquiries,
        loadLandlordInquiries,
        sendInquiry,
        replyToInquiry,
        notifications,
        markNotificationAsRead,
        markAllNotificationsRead,
        clearAllNotifications,
        tenantPreferences,
        setTenantPreferences,
        savedListings,
        toggleSaveListing,
        currentUser,
        loginUser,
        logoutUser,
        signupUser,
        refreshCurrentUser,
        theme,
        toggleTheme,
        createListing,
        updateListingStatus,
        deleteListing,
        updateListing,
        getRecommendedListings,
        getAIRecommendedListings,
        aiLoading,
        aiError,
        calculateRecommendationScore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

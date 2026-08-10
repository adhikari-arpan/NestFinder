import { createContext, useState, useEffect, useCallback } from "react";
import supabase from "../../db/supabaseClient";
import * as api from "../api/listingsapi";
import * as aiApi from "../api/aiApi";
import { fetchUserApprovedAccess } from "../api/paymentAPI";
import { getDistancePrice } from "../utils/paymentUtils";
import { haversineDistance } from "../utils/geo";

// eslint-disable-next-line react-refresh/only-export-components
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

  // User-Specific Paid Distance Access State (48 Hours Validity)
  const [paidRadiusAccess, setPaidRadiusAccess] = useState(null);
  const [savedListings, setSavedListings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Ticks on an interval so paid-radius-access countdowns (AllRooms,
  // TenantDashboard) unlock/expire live instead of freezing at whatever
  // Date.now() was on mount, without every consumer running its own timer.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const refreshUserPaidAccess = useCallback(async (user) => {
    if (!user) {
      setPaidRadiusAccess(null);
      return;
    }
    try {
      const access = await fetchUserApprovedAccess(user.id);
      setPaidRadiusAccess(access);
    } catch (err) {
      console.error("Error loading user paid access:", err);
      setPaidRadiusAccess(null);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => refreshUserPaidAccess(currentUser));
  }, [currentUser, refreshUserPaidAccess]);

  // Treats two points as "the same location" if they're within ~11m of each
  // other, which absorbs float round-tripping through JSON/the DB without
  // letting a genuinely different point pass as paid-for.
  const SAME_LOCATION_EPSILON_DEG = 0.0001;
  const isSameLocation = (a, b) =>
    !!a &&
    !!b &&
    Math.abs(a.lat - b.lat) < SAME_LOCATION_EPSILON_DEG &&
    Math.abs(a.lng - b.lng) < SAME_LOCATION_EPSILON_DEG;

  const checkDistanceAccess = (location, radius) => {
    if (!currentUser || !paidRadiusAccess) return false;
    if (paidRadiusAccess.userId && paidRadiusAccess.userId !== currentUser.id)
      return false;
    if (!paidRadiusAccess.paidUntil || paidRadiusAccess.paidUntil <= Date.now())
      return false;
    if (!isSameLocation(location, paidRadiusAccess.location)) return false;
    if (radius > paidRadiusAccess.activeRadius) return false;
    return true;
  };

  const grantRadiusAccess = (
    location,
    radius,
    pricePaid,
    targetUserId = null,
  ) => {
    const userId = targetUserId || currentUser?.id;
    const paidUntil = Date.now() + 48 * 60 * 60 * 1000;
    const accessData = {
      userId,
      activeRadius: Number(radius),
      location: location || tenantPreferences.poiLocation,
      pricePaid,
      paidUntil,
      paidAt: Date.now(),
    };

    if (currentUser && currentUser.id === userId) {
      setPaidRadiusAccess(accessData);
    }
    if (userId) {
      localStorage.setItem(
        `nestfinder_paid_access_${userId}`,
        JSON.stringify(accessData),
      );
    }
  };

  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
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
    Promise.resolve().then(() => refreshListings());
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
      .select("role, name, phone, email, is_verified, kyc_status, is_suspended")
      .eq("id", data.user.id)
      .single();

    if (profile?.is_suspended) {
      await supabase.auth.signOut();
      return {
        success: false,
        message: "Your account has been suspended. Contact support for help.",
      };
    }

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

  // Self-service "Edit Profile" — name/phone only, see api.updateOwnProfile.
  const updateOwnProfile = async ({ name, phone }) => {
    if (!currentUser) throw new Error("You must be logged in.");
    const updated = await api.updateOwnProfile(currentUser.id, { name, phone });
    setCurrentUser((prev) => ({ ...prev, ...updated }));
    return updated;
  };

  const signupUser = async (email, password, name, phone, role) => {
    const PHONE_TAKEN_MESSAGE =
      "This phone number is already registered. Please sign in or use a different number.";

    // profiles.phone has a unique constraint, but the profiles row is
    // created by a server-side trigger inside auth.signUp() below — a
    // violation there comes back as a generic GoTrue error, not one that
    // names the actual problem. Check up front so the common case gets a
    // clear message; the constraint remains the real enforcement for the
    // rare race where two signups land at the same instant.
    try {
      if (await api.checkPhoneExists(phone)) {
        return { success: false, message: PHONE_TAKEN_MESSAGE };
      }
    } catch (err) {
      console.warn("Phone uniqueness pre-check failed, proceeding with signup:", err.message);
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, role } },
    });
    if (error) {
      // The pre-check above already handles the common case by name; this
      // generic GoTrue message can also mean some other trigger failure,
      // so hedge rather than assert it's specifically the phone.
      const looksLikeTriggerFailure = /database error saving new user/i.test(
        error.message || "",
      );
      return {
        success: false,
        message: looksLikeTriggerFailure
          ? "Could not create your account — this email or phone number may already be registered. Please try again or sign in."
          : error.message,
      };
    }
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
          .then(({ data: profile }) => {
            if (profile?.is_suspended) {
              supabase.auth.signOut();
              setCurrentUser(null);
            } else {
              setCurrentUser({ ...session.user, ...profile });
            }
            setAuthLoading(false);
          });
      } else {
        setAuthLoading(false);
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
      Promise.resolve().then(() => {
        setSavedListings([]);
        setNotifications([]);
      });
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
      try {
        await api.notifyAdmins(
          "New Listing Pending Review",
          `"${newListing.title}" was submitted by ${currentUser.name} and needs moderation.`,
          "listing",
        );
      } catch (err) {
        console.error("Failed to notify admins of new listing:", err.message);
      }
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
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                status: newStatus,
                ...(newStatus === "verified"
                  ? { verifiedAt: new Date().toISOString() }
                  : {}),
              }
            : l,
        ),
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

  const loadLandlordInquiries = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await api.fetchInquiriesForLandlord(currentUser.id);
      setInquiries(data);
    } catch (err) {
      console.error("Failed to load inquiries:", err.message);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.role === "landlord") {
      Promise.resolve().then(() => loadLandlordInquiries());
    }
  }, [currentUser, loadLandlordInquiries]);

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
        pushNotification,
        markNotificationAsRead,
        markAllNotificationsRead,
        clearAllNotifications,
        tenantPreferences,
        setTenantPreferences,
        savedListings,
        toggleSaveListing,
        currentUser,
        authLoading,
        loginUser,
        logoutUser,
        signupUser,
        refreshCurrentUser,
        updateOwnProfile,
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
        paidRadiusAccess,
        now,
        getDistancePrice,
        checkDistanceAccess,
        grantRadiusAccess,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

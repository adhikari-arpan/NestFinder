import React, { createContext, useState, useEffect, useCallback } from 'react';
import supabase from '../../db/supabaseClient';
import * as api from '../api/listingsapi';
import * as aiApi from '../api/aiApi';

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
    poiCollege: "Pulchowk Engineering Campus"
  });

  const [savedListings, setSavedListings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const refreshListings = useCallback(async () => {
    setListingsLoading(true);
    try {
      const data = await api.fetchListings();
      setListings(data);
    } catch (err) {
      console.error('Failed to load listings:', err.message);
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, name, phone, email, is_verified')
      .eq('id', data.user.id)
      .single();

    setCurrentUser({ ...data.user, ...profile });
    pushNotification(data.user.id, "Logged in successfully", `Welcome back, ${profile.name}!`, 'auth');
    return { success: true, message: '' };
  };

  const logoutUser = () => setCurrentUser(null);

  const signupUser = async (email, password, name, phone, role) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, role } },
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Account created successfully! Please sign in.' };
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data: profile }) => setCurrentUser({ ...session.user, ...profile }));
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setCurrentUser(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Load saved listings + notifications once we know who's logged in
  useEffect(() => {
    if (!currentUser) {
      setSavedListings([]);
      setNotifications([]);
      return;
    }
    api.fetchSavedListingIds(currentUser.id).then(setSavedListings).catch(console.error);
    api.fetchNotifications(currentUser.id).then(setNotifications).catch(console.error);
  }, [currentUser]);

  // ------------------------------------------------------------
  // Notifications
  // ------------------------------------------------------------
  const pushNotification = async (userId, title, message, type = "info") => {
    try {
      await api.addNotification(userId, title, message, type);
      setNotifications((prev) => [
        { id: Date.now(), title, message, type, read: false, created_at: new Date().toISOString() },
        ...prev,
      ]);
    } catch (err) {
      console.error('Failed to save notification:', err.message);
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
      setSavedListings((prev) => (isSaved ? prev.filter((x) => x !== id) : [...prev, id]));
      if (!isSaved) {
        const item = listings.find((l) => l.id === id);
        pushNotification(currentUser.id, "Saved Room", `You saved "${item?.title}"`, "save");
      }
    } catch (err) {
      console.error('Failed to toggle saved listing:', err.message);
    }
  };

  // ------------------------------------------------------------
  // Listings CRUD
  // ------------------------------------------------------------
  const createListing = async (formData) => {
    if (!currentUser) return { success: false, message: 'You must be logged in to post a listing.' };
    try {
      const newListing = await api.createListing(formData, currentUser.id);
      setListings((prev) => [newListing, ...prev]);
      pushNotification(
        currentUser.id,
        "Room Listing Posted",
        `Your room "${newListing.title}" is pending admin moderation.`,
        "listing"
      );
      return { success: true, listing: newListing };
    } catch (err) {
      console.error('Failed to create listing:', err.message);
      return { success: false, message: err.message || 'Something went wrong. Please try again.' };
    }
  };

  const updateListingStatus = async (id, newStatus) => {
    try {
      await api.updateListingStatus(id, newStatus);
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
      if (currentUser) {
        pushNotification(currentUser.id, "Listing Moderated", `Listing ${id} was set to ${newStatus}.`, "admin");
      }
    } catch (err) {
      console.error('Failed to update listing status:', err.message);
    }
  };

  const deleteListing = async (id) => {
    try {
      await api.deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Failed to delete listing:', err.message);
      return { success: false, message: err.message || 'Could not delete this listing. Please try again.' };
    }
  };

  const updateListing = async (id, formData) => {
    try {
      const updated = await api.updateListing(id, formData);
      setListings((prev) => prev.map((l) => (l.id === id ? updated : l)));
      return { success: true, listing: updated };
    } catch (err) {
      console.error('Failed to update listing:', err.message);
      return { success: false, message: err.message || 'Could not update this listing. Please try again.' };
    }
  };

  // ------------------------------------------------------------
  // Inquiries
  // ------------------------------------------------------------
  const sendInquiry = async (listingId, messageDetails) => {
    try {
      await api.sendInquiry(listingId, messageDetails, currentUser?.id || null);
      if (currentUser) {
        pushNotification(currentUser.id, "Inquiry Sent", "Your message was delivered to the landlord.", "message");
      }
    } catch (err) {
      console.error('Failed to send inquiry:', err.message);
    }
  };

  const replyToInquiry = async (inquiryId, replyMsg) => {
    try {
      await api.replyToInquiry(inquiryId, replyMsg);
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === inquiryId ? { ...inq, status: "replied", replyText: replyMsg } : inq))
      );
    } catch (err) {
      console.error('Failed to reply to inquiry:', err.message);
    }
  };

  const loadLandlordInquiries = async () => {
    if (!currentUser) return;
    try {
      const data = await api.fetchInquiriesForLandlord(currentUser.id);
      setInquiries(data);
    } catch (err) {
      console.error('Failed to load inquiries:', err.message);
    }
  };

  // ------------------------------------------------------------
  // Recommendation scoring — unchanged, runs client-side on
  // whatever listings are currently loaded: Rule-based score.
  // ------------------------------------------------------------
  const calculateRecommendationScore = (listing, prefs) => {
    if (!prefs) return 0;
    let score = 100;

    if (listing.price > prefs.budget) {
      const diff = listing.price - prefs.budget;
      const pctOver = diff / prefs.budget;
      score -= Math.min(40, pctOver * 50);
    } else {
      const savings = prefs.budget - listing.price;
      score += Math.min(5, (savings / prefs.budget) * 10);
    }

    if (prefs.preferredCity && listing.city.toLowerCase() !== prefs.preferredCity.toLowerCase()) {
      score -= 15;
    }
    if (prefs.sharing && listing.sharing !== prefs.sharing) {
      score -= 10;
    }
    if (prefs.roomType && listing.type !== prefs.roomType) {
      score -= 15;
    }
    if (prefs.essentialAmenities?.length) {
      prefs.essentialAmenities.forEach((amenity) => {
        if (!listing.amenities.includes(amenity)) score -= 8;
      });
    }
    if (prefs.poiCollege) {
      const matchPOI = listing.nearbyPOIs.find(
        (poi) =>
          poi.type === "College" &&
          (poi.name.toLowerCase().includes(prefs.poiCollege.toLowerCase()) ||
            prefs.poiCollege.toLowerCase().includes(poi.name.toLowerCase()))
      );
      if (matchPOI) {
        if (matchPOI.distance <= 500) score += 15;
        else if (matchPOI.distance <= 1000) score += 10;
        else if (matchPOI.distance <= 2000) score += 5;
      } else {
        const anyCollege = listing.nearbyPOIs.find((poi) => poi.type === "College");
        if (anyCollege) {
          if (anyCollege.distance > 2000) score -= 10;
        } else {
          score -= 10;
        }
      }
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getRecommendedListings = (prefs = tenantPreferences) => {
    return listings
      // .filter((l) => l.status === "verified") // Temporarily disabled for development
      .map((listing) => ({ ...listing, matchScore: calculateRecommendationScore(listing, prefs) }))
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  // ------------------------------------------------------------
  // AI-powered recommendations via the Flask embedding service.
  // Falls back to the rule-based scoring above if the AI service
  // is unreachable, so the tenant flow never fully breaks.
  // ------------------------------------------------------------
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const getAIRecommendedListings = async (prefs = tenantPreferences) => {
    setAiLoading(true);
    setAiError('');
    try {
      const scores = await aiApi.fetchAIRecommendations(prefs);
      const scoreMap = Object.fromEntries(scores.map((s) => [s.id, s]));
      return listings
        // .filter((l) => l.status === "verified") // Temporarily disabled for development
        .map((l) => ({
          ...l,
          matchScore: scoreMap[l.id]?.matchScore ?? 0,
          semanticScore: scoreMap[l.id]?.semanticScore ?? 0,
        }))
        .sort((a, b) => b.matchScore - a.matchScore);
    } catch (err) {
      console.error('AI recommendation failed, falling back to rule-based:', err.message);
      setAiError('AI service unavailable — showing rule-based matches instead.');
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
        tenantPreferences,
        setTenantPreferences,
        savedListings,
        toggleSaveListing,
        currentUser,
        loginUser,
        logoutUser,
        signupUser,
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
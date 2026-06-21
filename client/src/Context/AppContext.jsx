import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// Mock Initial Listings in Kathmandu Valley
const initialListings = [
  {
    id: 1,
    title: "Sleek Single Room near Pulchowk Campus",
    description: "Fully furnished modern single room ideal for engineering students. Located in a quiet residential area of Lalitpur, only 5 minutes walk from Pulchowk Engineering Campus. Access to shared kitchen, washing machine, and rooftop terrace. Rent includes high-speed WiFi and water utility.",
    price: 9500,
    type: "Room",
    sharing: "Single",
    location: "Pulchowk, Lalitpur",
    city: "Lalitpur",
    latitude: 27.6812,
    longitude: 85.3182,
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["WiFi", "Hot Water", "Parking", "Furnished", "Kitchen", "Backup Electricity"],
    landlord: {
      name: "Ramesh Shrestha",
      phone: "+977-9851012345",
      email: "ramesh@nestfinder.com",
      verified: true
    },
    nearbyPOIs: [
      { name: "Pulchowk Engineering Campus", type: "College", distance: 350 },
      { name: "Alka Hospital", type: "Hospital", distance: 600 },
      { name: "Labim Mall (Market)", type: "Market", distance: 500 },
      { name: "Pulchowk Bus Stop", type: "Bus Stop", distance: 200 }
    ],
    rating: 4.8,
    reviews: [
      { author: "Sunil Thapa", rating: 5, comment: "Perfect spot for students! Very quiet and Ramesh Uncle is super helpful." }
    ],
    status: "verified",
    featured: true,
    views: 342,
    createdAt: "2026-06-15T10:00:00Z"
  },
  {
    id: 2,
    title: "Spacious 2BHK Flat in Mid-Baneshwor",
    description: "Beautiful 2BHK flat available for rent in Mid-Baneshwor. Close to colleges and banks. Features a spacious living room, two bedrooms, private kitchen, and clean bathroom. Has 24 hours water supply and security guard. Parking available for both cars and bikes.",
    price: 24000,
    type: "Flat",
    sharing: "Private",
    location: "Mid-Baneshwor, Kathmandu",
    city: "Kathmandu",
    latitude: 27.6994,
    longitude: 85.3414,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["WiFi", "Hot Water", "Parking", "Kitchen", "Balcony", "Backup Electricity"],
    landlord: {
      name: "Saraswoti Adhikari",
      phone: "+977-9841234567",
      email: "saraswoti@nestfinder.com",
      verified: true
    },
    nearbyPOIs: [
      { name: "Apex College", type: "College", distance: 400 },
      { name: "Civil Service Hospital", type: "Hospital", distance: 1200 },
      { name: "Baneshwor Plaza Market", type: "Market", distance: 300 },
      { name: "Baneshwor Chowk Bus Stop", type: "Bus Stop", distance: 350 }
    ],
    rating: 4.5,
    reviews: [
      { author: "Anjali Lama", rating: 4, comment: "Spacious flat, water issue is minimal because of boring. Landlord lives on the top floor, very polite." }
    ],
    status: "verified",
    featured: true,
    views: 521,
    createdAt: "2026-06-10T08:15:00Z"
  },
  {
    id: 3,
    title: "Affordable Shared Room for Students in Kirtipur",
    description: "Budget friendly shared room (two single beds) available for students. Highly convenient for students studying at Tribhuvan University (TU). Clean environment, separate bathroom, and utilities are shared. Peaceful study-friendly community.",
    price: 5000,
    type: "Room",
    sharing: "Shared",
    location: "Kanga, Kirtipur",
    city: "Kathmandu",
    latitude: 27.6784,
    longitude: 85.2811,
    images: [
      "https://images.unsplash.com/photo-1555854817-40e098ee7f57?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["WiFi", "Hot Water", "Parking", "Kitchen"],
    landlord: {
      name: "Hari Bahadur Thapa",
      phone: "+977-9818765432",
      email: "haribdr@nestfinder.com",
      verified: false
    },
    nearbyPOIs: [
      { name: "Tribhuvan University Central Campus", type: "College", distance: 600 },
      { name: "Kirtipur Hospital", type: "Hospital", distance: 800 },
      { name: "Naya Bazaar Market", type: "Market", distance: 900 },
      { name: "TU Gate Bus Stop", type: "Bus Stop", distance: 450 }
    ],
    rating: 4.2,
    reviews: [
      { author: "Dipesh Joshi", rating: 4, comment: "Very cheap and close to TU. Best for budget students." }
    ],
    status: "verified",
    featured: false,
    views: 189,
    createdAt: "2026-06-18T14:30:00Z"
  },
  {
    id: 4,
    title: "Luxury 3BHK Flat near TU Kathmandu",
    description: "High-end 3BHK flat in Kirtipur. Ideal for families or working professionals. Beautiful balcony views, fully furnished kitchen, large parking spaces, 24/7 solar water, back up power inverter, security fence. Walking distance to University gates.",
    price: 32000,
    type: "Flat",
    sharing: "Private",
    location: "Nayabazar, Kirtipur",
    city: "Kathmandu",
    latitude: 27.6821,
    longitude: 85.2868,
    images: [
      "https://images.unsplash.com/photo-1545464693-f1798a373343?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["WiFi", "Hot Water", "Parking", "Furnished", "Kitchen", "Balcony", "Backup Electricity"],
    landlord: {
      name: "Hari Bahadur Thapa",
      phone: "+977-9818765432",
      email: "haribdr@nestfinder.com",
      verified: false
    },
    nearbyPOIs: [
      { name: "Tribhuvan University", type: "College", distance: 400 },
      { name: "Kirtipur Hospital", type: "Hospital", distance: 500 },
      { name: "Naya Bazaar Market", type: "Market", distance: 200 }
    ],
    rating: 4.9,
    reviews: [],
    status: "pending",
    featured: false,
    views: 95,
    createdAt: "2026-06-19T11:45:00Z"
  },
  {
    id: 5,
    title: "1 BHK Flat in Kumaripati for Rent",
    description: "Cozy 1 BHK flat in the heart of Kumaripati. Ground floor unit with separate entry, small garden patch, security guard, parking space for bikes. Close to colleges like United Academy and St. Xavier's. Ideal for couple or single student.",
    price: 15000,
    type: "Flat",
    sharing: "Private",
    location: "Kumaripati, Lalitpur",
    city: "Lalitpur",
    latitude: 27.6711,
    longitude: 85.3195,
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["WiFi", "Hot Water", "Parking", "Kitchen", "Backup Electricity"],
    landlord: {
      name: "Maya Shakya",
      phone: "+977-9860432109",
      email: "maya@nestfinder.com",
      verified: true
    },
    nearbyPOIs: [
      { name: "United Academy", type: "College", distance: 300 },
      { name: "Patan Hospital", type: "Hospital", distance: 800 },
      { name: "Jawalakhel Market", type: "Market", distance: 500 },
      { name: "Kumaripati Bus Stop", type: "Bus Stop", distance: 150 }
    ],
    rating: 4.6,
    reviews: [],
    status: "verified",
    featured: false,
    views: 264,
    createdAt: "2026-06-12T09:20:00Z"
  },
  {
    id: 6,
    title: "Cosy Studio Room near Maitighar",
    description: "Excellent studio room with attached bathroom and mini kitchen setup in Maitighar. Perfect for professionals or students working/studying near Babarmahal, Maitighar, or New Baneshwor. Rent is inclusive of electricity and water.",
    price: 11000,
    type: "Room",
    sharing: "Single",
    location: "Maitighar, Kathmandu",
    city: "Kathmandu",
    latitude: 27.6938,
    longitude: 85.3235,
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: ["WiFi", "Hot Water", "Kitchen", "Backup Electricity"],
    landlord: {
      name: "Gopal Prasad Koirala",
      phone: "+977-9851087654",
      email: "gopal@nestfinder.com",
      verified: true
    },
    nearbyPOIs: [
      { name: "St. Xavier's College Maitighar", type: "College", distance: 200 },
      { name: "Norvic International Hospital", type: "Hospital", distance: 900 },
      { name: "Maitighar Bus Stop", type: "Bus Stop", distance: 100 }
    ],
    rating: 4.4,
    reviews: [
      { author: "Samyak Shrestha", rating: 4, comment: "Nice host, room is compact but well ventilated." }
    ],
    status: "flagged",
    featured: false,
    views: 112,
    createdAt: "2026-06-14T15:45:00Z"
  }
];

export const AppContextProvider = ({ children }) => {
  // Database States
  const [listings, setListings] = useState(initialListings);
  const [inquiries, setInquiries] = useState([
    {
      id: 1,
      listingId: 1,
      tenantName: "Roshan Gurung",
      tenantEmail: "roshan@gmail.com",
      tenantPhone: "9803124578",
      message: "Hi, I am interested in this room. Can I visit tomorrow afternoon around 3 PM?",
      createdAt: "2026-06-19T08:30:00Z",
      status: "unread"
    },
    {
      id: 2,
      listingId: 2,
      tenantName: "Roshan Gurung",
      tenantEmail: "roshan@gmail.com",
      tenantPhone: "9803124578",
      message: "Is the price negotiable? I am a master student at Apex College.",
      createdAt: "2026-06-18T10:00:00Z",
      status: "replied"
    }
  ]);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Match Found!",
      message: "A room matching your budget is listed near Tribhuvan University.",
      type: "match",
      read: false,
      createdAt: "2026-06-20T10:10:00Z"
    },
    {
      id: 2,
      title: "Inquiry Replied",
      message: "Landlord Saraswoti Adhikari replied to your flat inquiry.",
      type: "inquiry",
      read: true,
      createdAt: "2026-06-19T14:20:00Z"
    }
  ]);

  // User Preferences State for the AI engine
  const [tenantPreferences, setTenantPreferences] = useState({
    budget: 15000,
    preferredCity: "Lalitpur",
    sharing: "Single",
    roomType: "Room",
    essentialAmenities: ["WiFi", "Hot Water"],
    poiCollege: "Pulchowk Engineering Campus"
  });

  // Saved Listings
  const [savedListings, setSavedListings] = useState([1]);

  // Auth User State
  // Roles: 'tenant', 'landlord', 'admin', null (Guest)
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: "Roshan Gurung",
    email: "roshan@gmail.com",
    role: "tenant", // 'tenant' or 'landlord' or 'admin'
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
  });

  // App Theme Style
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Actions
  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const loginUser = (email, password, role) => {
    let mockUser = {
      id: role === 'tenant' ? 1 : (role === 'landlord' ? 2 : 3),
      name: role === 'tenant' ? "Roshan Gurung" : (role === 'landlord' ? "Ramesh Shrestha" : "System Administrator"),
      email: email,
      role: role,
      avatar: role === 'tenant' 
        ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
        : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
    };
    setCurrentUser(mockUser);
    
    // Add success notification
    addNotification(`Logged in successfully`, `Welcome back, ${mockUser.name}!`, 'auth');
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const toggleSaveListing = (id) => {
    setSavedListings(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
    const item = listings.find(l => l.id === id);
    if (!savedListings.includes(id)) {
      addNotification("Saved Room", `You saved "${item?.title}"`, "save");
    }
  };

  const addNotification = (title, message, type = "info") => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const createListing = (formData) => {
    const newListing = {
      id: listings.length + 1,
      ...formData,
      price: Number(formData.price),
      latitude: Number(formData.latitude) || 27.7,
      longitude: Number(formData.longitude) || 85.3,
      images: formData.images.length > 0 ? formData.images : ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"],
      landlord: {
        name: currentUser.name,
        phone: "+977-9851000000",
        email: currentUser.email,
        verified: true
      },
      nearbyPOIs: [
        { name: "Tribhuvan University", type: "College", distance: 1200 },
        { name: "Local Bus Stop", type: "Bus Stop", distance: 200 }
      ],
      rating: 5.0,
      reviews: [],
      status: "pending", // Newly created ones start as pending for Admin review
      featured: false,
      views: 0,
      createdAt: new Date().toISOString()
    };

    setListings(prev => [newListing, ...prev]);
    addNotification("Room Listing Posted", `Your room "${newListing.title}" is pending admin moderation.`, "listing");
  };

  const updateListingStatus = (id, newStatus) => {
    setListings(prev =>
      prev.map(listing =>
        listing.id === id ? { ...listing, status: newStatus } : listing
      )
    );
    addNotification("Listing Moderated", `Listing ID ${id} was set to ${newStatus}.`, "admin");
  };

  const sendInquiry = (listingId, messageDetails) => {
    const newInquiry = {
      id: inquiries.length + 1,
      listingId,
      tenantName: currentUser ? currentUser.name : messageDetails.name,
      tenantEmail: currentUser ? currentUser.email : messageDetails.email,
      tenantPhone: messageDetails.phone,
      message: messageDetails.message,
      createdAt: new Date().toISOString(),
      status: "unread"
    };

    setInquiries(prev => [newInquiry, ...prev]);
    addNotification("Inquiry Sent", "Your message was delivered to the landlord successfully.", "message");
  };

  const replyToInquiry = (inquiryId, replyMsg) => {
    setInquiries(prev => 
      prev.map(inq => inq.id === inquiryId ? { ...inq, status: "replied", replyText: replyMsg } : inq)
    );
    addNotification("Reply Sent", "Your response was sent to the tenant.", "message");
  };

  // Mock Recommendation Logic (AI recommendations simulation)
  const calculateRecommendationScore = (listing, prefs) => {
    if (!prefs) return 0;
    
    let score = 100;
    
    // 1. Budget checking (penalty if price is higher than preferred budget)
    if (listing.price > prefs.budget) {
      const diff = listing.price - prefs.budget;
      const pctOver = diff / prefs.budget;
      // Deduct score based on how much over budget (up to 40 points)
      score -= Math.min(40, pctOver * 50);
    } else {
      // Small bonus if it's well under budget
      const savings = prefs.budget - listing.price;
      score += Math.min(5, (savings / prefs.budget) * 10);
    }
    
    // 2. City match (penalty if in different city, 15 points)
    if (prefs.preferredCity && listing.city.toLowerCase() !== prefs.preferredCity.toLowerCase()) {
      score -= 15;
    }
    
    // 3. Sharing match (10 points penalty if mismatch)
    if (prefs.sharing && listing.sharing !== prefs.sharing) {
      score -= 10;
    }

    // 4. RoomType match (15 points penalty if mismatch)
    if (prefs.roomType && listing.type !== prefs.roomType) {
      score -= 15;
    }
    
    // 5. Essential Amenities (deduct 8 points for each missing amenity)
    if (prefs.essentialAmenities && prefs.essentialAmenities.length > 0) {
      prefs.essentialAmenities.forEach(amenity => {
        if (!listing.amenities.includes(amenity)) {
          score -= 8;
        }
      });
    }
    
    // 6. Proximity to Preferred College/POI (closer is higher score, up to 15 points)
    if (prefs.poiCollege) {
      const matchPOI = listing.nearbyPOIs.find(poi => 
        poi.type === "College" && 
        (poi.name.toLowerCase().includes(prefs.poiCollege.toLowerCase()) || 
         prefs.poiCollege.toLowerCase().includes(poi.name.toLowerCase()))
      );
      
      if (matchPOI) {
        if (matchPOI.distance <= 500) {
          score += 15; // very close
        } else if (matchPOI.distance <= 1000) {
          score += 10; // close
        } else if (matchPOI.distance <= 2000) {
          score += 5;  // manageable
        }
      } else {
        // Check general college distance
        const anyCollege = listing.nearbyPOIs.find(poi => poi.type === "College");
        if (anyCollege) {
          if (anyCollege.distance > 2000) score -= 10;
        } else {
          score -= 10; // No college nearby
        }
      }
    }
    
    // Caps between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const getRecommendedListings = (prefs = tenantPreferences) => {
    return listings
      .filter(l => l.status === "verified")
      .map(listing => ({
        ...listing,
        matchScore: calculateRecommendationScore(listing, prefs)
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  return (
    <AppContext.Provider
      value={{
        listings,
        setListings,
        inquiries,
        sendInquiry,
        replyToInquiry,
        notifications,
        setNotifications,
        tenantPreferences,
        setTenantPreferences,
        savedListings,
        toggleSaveListing,
        currentUser,
        loginUser,
        logoutUser,
        theme,
        toggleTheme,
        createListing,
        updateListingStatus,
        getRecommendedListings,
        calculateRecommendationScore
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// src/utils/paymentUtils.js
// Reusable utilities for the NestFinder Payment Module

export const PAYMENT_TYPES = {
  DISTANCE_RADIUS: "distance_radius",
  LANDLORD_LISTING: "landlord_listing",
  FEATURED_BOOST: "featured_boost",
};

export const DISTANCE_TIER_PRICING = {
  500: {
    price: 75,
    label: "Walking (500m)",
    desc: "Highest precision & prime proximity",
    icon: "🏠",
  },
  1000: {
    price: 130,
    label: "Near (1km)",
    desc: "Standard proximity tier",
    icon: "📍",
  },
  3000: {
    price: 200,
    label: "Cycling (3km)",
    desc: "Extended proximity tier",
    icon: "🚲",
  },
  5000: {
    price: 250,
    label: "Extended (5km)",
    desc: "City-wide proximity tier",
    icon: "🗺️",
  },
};

export const RADIUS_OPTIONS = [
  { val: 500, label: `${DISTANCE_TIER_PRICING[500].icon} ${DISTANCE_TIER_PRICING[500].label} — Rs. ${DISTANCE_TIER_PRICING[500].price}` },
  { val: 1000, label: `${DISTANCE_TIER_PRICING[1000].icon} ${DISTANCE_TIER_PRICING[1000].label} — Rs. ${DISTANCE_TIER_PRICING[1000].price}` },
  { val: 3000, label: `${DISTANCE_TIER_PRICING[3000].icon} ${DISTANCE_TIER_PRICING[3000].label} — Rs. ${DISTANCE_TIER_PRICING[3000].price}` },
  { val: 5000, label: `${DISTANCE_TIER_PRICING[5000].icon} ${DISTANCE_TIER_PRICING[5000].label} — Rs. ${DISTANCE_TIER_PRICING[5000].price}` },
];

export function getTier(radius) {
  return DISTANCE_TIER_PRICING[radius] || DISTANCE_TIER_PRICING[1000];
}

export function getDistancePrice(radiusMeters) {
  if (radiusMeters <= 500) return DISTANCE_TIER_PRICING[500].price;
  if (radiusMeters <= 1000) return DISTANCE_TIER_PRICING[1000].price;
  if (radiusMeters <= 3000) return DISTANCE_TIER_PRICING[3000].price;
  return DISTANCE_TIER_PRICING[5000].price;
}

// A user who already paid for a smaller radius and wants a bigger one only
// owes the difference between the two tiers' full prices — e.g. 500m -> 1km
// is Rs. 130 - Rs. 75 = Rs. 55, matching the "Upgrade From Previous" pricing.
// Only meaningful when toRadius is actually a step up from fromRadius; the
// caller (AppContext.isRadiusUpgrade) is what decides whether an upgrade
// applies in the first place — this just does the arithmetic.
export function getUpgradePrice(fromRadius, toRadius) {
  return Math.max(0, getDistancePrice(toRadius) - getDistancePrice(fromRadius));
}

// ------------------------------------------------------------
// Landlord room-listing posting fee
// 2% of monthly rent, rounded UP to the nearest Rs. 10 (e.g. 111 -> 120,
// 110 stays 110), clamped between Rs. 100 and Rs. 600
// ------------------------------------------------------------
export const LISTING_FEE_RATE = 0.02;
export const LISTING_FEE_MIN = 100;
export const LISTING_FEE_MAX = 600;
export const LISTING_FEE_ROUND_TO = 10;

export function getListingFee(monthlyRent) {
  const rent = Number(monthlyRent) || 0;
  const raw = rent * LISTING_FEE_RATE;
  const rounded = Math.ceil(raw / LISTING_FEE_ROUND_TO) * LISTING_FEE_ROUND_TO;
  return Math.min(LISTING_FEE_MAX, Math.max(LISTING_FEE_MIN, rounded));
}

export function formatNPR(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString()}`;
}

// Formats a millisecond duration as "Xh Ym" (or "Ym" once under an hour),
// for the 48h paid-access countdown. Returns "Expired" for zero/negative input.
export function formatDuration(ms) {
  if (ms <= 0) return "Expired";
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function getStatusBadge(status) {
  switch (status) {
    case "approved":
    case "completed":
      return { label: "Verified & Approved", className: "badge badge-secondary", color: "#10b981" };
    case "rejected":
    case "failed":
      return { label: "Rejected", className: "badge badge-danger", color: "#ef4444" };
    case "pending":
    default:
      return { label: "Pending Verification", className: "badge badge-accent", color: "#f59e0b" };
  }
}

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
    icon: "🚶",
  },
  1000: {
    price: 100,
    label: "Near (1km)",
    desc: "Standard proximity tier",
    icon: "🏃",
  },
  3000: {
    price: 150,
    label: "Cycling (3km)",
    desc: "Extended proximity tier",
    icon: "🚲",
  },
  5000: {
    price: 200,
    label: "Extended (5km)",
    desc: "City-wide proximity tier",
    icon: "🌐",
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

export function formatNPR(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString()}`;
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

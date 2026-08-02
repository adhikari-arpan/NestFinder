// src/payment/paymentUtils.js
// Reusable utilities for the NestFinder Payment Module

export const PAYMENT_TYPES = {
  DISTANCE_RADIUS: "distance_radius",
  LANDLORD_LISTING: "landlord_listing",
  FEATURED_BOOST: "featured_boost",
};

export const DISTANCE_TIER_PRICING = {
  500: { price: 100, label: "Walking (500m)", desc: "Highest precision & prime proximity" },
  1000: { price: 60, label: "Near (1km)", desc: "Standard proximity tier" },
  3000: { price: 30, label: "Cycling (3km)", desc: "Extended proximity tier" },
  5000: { price: 15, label: "Extended (5km)", desc: "City-wide proximity tier" },
};

export function getDistancePrice(radiusMeters) {
  if (radiusMeters <= 500) return 100;
  if (radiusMeters <= 1000) return 60;
  if (radiusMeters <= 3000) return 30;
  return 15;
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

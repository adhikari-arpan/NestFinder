// src/payment/PaymentSuccess.jsx
// Rendered after tenant submits payment proof screenshot, displaying pending admin review status

import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatNPR, getStatusBadge } from "../../utils/paymentUtils";

export const PaymentSuccess = ({ paymentDetails }) => {
  const navigate = useNavigate();
  const isListingFee = paymentDetails?.payment_type === "landlord_listing";

  const radiusLabel =
    paymentDetails?.target_radius >= 1000
      ? `${(paymentDetails.target_radius / 1000).toFixed(1)} km`
      : `${paymentDetails?.target_radius || 1000} m`;

  const locationName =
    paymentDetails?.target_location?.name ||
    (paymentDetails?.target_location
      ? `${paymentDetails.target_location.lat.toFixed(3)}, ${paymentDetails.target_location.lng.toFixed(3)}`
      : "Selected Area");

  const badge = getStatusBadge(paymentDetails?.status || "pending");

  return (
    <div
      className="card animate-fade-in shadow-xl"
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "2.5rem 2rem",
        borderRadius: "20px",
        backgroundColor: "var(--bg-card, #ffffff)",
        border: "1px solid var(--border-color, #e2e8f0)",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          color: "#10b981",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.25rem",
        }}
      >
        <CheckCircle2 size={44} />
      </div>

      <h2
        style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 0.5rem" }}
      >
        Payment Proof Submitted!
      </h2>
      <p
        style={{
          color: "var(--text-muted, #64748b)",
          fontSize: "0.95rem",
          margin: "0 0 1.5rem",
        }}
      >
        Your payment screenshot and details have been received and sent to the
        administrator for verification.
      </p>

      {/* Status Box */}
      <div
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--primary, #6366f1) 6%, transparent)",
          border:
            "1px solid color-mix(in srgb, var(--primary, #6366f1) 20%, transparent)",
          borderRadius: "14px",
          padding: "1.25rem",
          marginBottom: "2rem",
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--text-muted)",
            }}
          >
            Status:
          </span>
          <span
            className={badge.className}
            style={{ fontSize: "0.8rem", padding: "0.3rem 0.75rem" }}
          >
            <Clock
              size={12}
              style={{ marginRight: "4px", display: "inline" }}
            />
            {badge.label}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>
            {isListingFee ? "Listing:" : "Target Location:"}
          </span>
          <strong>{locationName}</strong>
        </div>

        {!isListingFee && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>Unlocked Radius:</span>
            <strong>{radiusLabel}</strong>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
            fontSize: "0.9rem",
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>Amount Paid:</span>
          <strong style={{ color: "var(--primary)" }}>
            {formatNPR(paymentDetails?.amount)}
          </strong>
        </div>

        {paymentDetails?.transaction_code && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.9rem",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>Reference Code:</span>
            <code>{paymentDetails.transaction_code}</code>
          </div>
        )}
      </div>

      {/* Info callout */}
      <div
        style={{
          fontSize: "0.82rem",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          justifyContent: "center",
          marginBottom: "2rem",
        }}
      >
        <ShieldCheck size={18} style={{ color: "#10b981", flexShrink: 0 }} />
        <span>
          {isListingFee
            ? "Once the admin approves your payment, your listing will go live for tenants to see."
            : `Once the admin approves your payment, room listings within ${radiusLabel} will unlock automatically for 48 hours.`}
        </span>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {isListingFee ? (
          <button
            onClick={() => navigate("/dashboard/landlord")}
            className="btn btn-primary"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <Home size={16} /> Back to Dashboard
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate("/rooms")}
              className="btn btn-outline"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Home size={16} /> View Rooms
            </button>
            <button
              onClick={() => navigate("/ai-recommend")}
              className="btn btn-secondary"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              AI Recommend <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// src/payment/PaymentQR.jsx
// Displays eSewa / Fonepay payment QR code, merchant account details, and payment instructions

import { ShieldCheck, Copy, Check, TrendingUp } from "lucide-react";
import { useState } from "react";
import { formatNPR } from "../../utils/paymentUtils";
import { PAYMENT_QR_IMAGE, MERCHANT_NUMBER } from "./paymentConfig";

export const PaymentQR = ({
  amount,
  targetLocation,
  radius,
  paymentType,
  isUpgrade = false,
  previousRadius = null,
}) => {
  const [copied, setCopied] = useState(false);
  const esewaNumber = MERCHANT_NUMBER;
  const isListingFee = paymentType === "landlord_listing";

  const handleCopy = () => {
    navigator.clipboard.writeText(esewaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const radiusLabel =
    radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius} m`;
  const previousRadiusLabel =
    previousRadius >= 1000
      ? `${(previousRadius / 1000).toFixed(1)} km`
      : `${previousRadius} m`;
  const locationName =
    targetLocation?.name ||
    (targetLocation
      ? `${targetLocation.lat.toFixed(3)}, ${targetLocation.lng.toFixed(3)}`
      : "Selected Area");

  // SVG QR Code graphic representation for Nepal eSewa / Fonepay
  return (
    <div
      style={{
        backgroundColor: "var(--bg-card, #ffffff)",
        border: "1px solid var(--border-color, #e2e8f0)",
        borderRadius: "16px",
        padding: "1.5rem",
        boxShadow: "var(--shadow-md, 0 10px 25px -5px rgba(0,0,0,0.05))",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      {/* Header Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "#60bb46",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.9rem",
            }}
          >
            eS
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>
              eSewa / Fonepay Direct QR
            </h4>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted, #64748b)",
              }}
            >
              Instant Merchant Transfer
            </span>
          </div>
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#10b981",
            backgroundColor: "rgba(16,185,129,0.1)",
            padding: "0.25rem 0.6rem",
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          <ShieldCheck size={14} /> Verified Merchant
        </span>
      </div>

      {/* QR Display Card */}
      <div
        style={{
          background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
          borderRadius: "14px",
          padding: "1.5rem",
          color: "white",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "0.8rem",
            borderRadius: "12px",
            boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
            marginBottom: "0.75rem",
          }}
        >
          <img
            src={PAYMENT_QR_IMAGE}
            alt="eSewa / Fonepay payment QR code"
            width={180}
            height={180}
            style={{ display: "block", objectFit: "contain" }}
          />
        </div>

        <span
          style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.2rem" }}
        >
          Scan to Pay
        </span>
        <strong style={{ fontSize: "1.5rem", fontWeight: 800 }}>
          {formatNPR(amount)}
        </strong>

        <div
          style={{
            marginTop: "0.75rem",
            fontSize: "0.78rem",
            backgroundColor: "rgba(255,255,255,0.15)",
            padding: "0.4rem 0.8rem",
            borderRadius: "20px",
          }}
        >
          Purpose:{" "}
          {isListingFee ? (
            <strong>Room Listing Fee</strong>
          ) : (
            <strong>{radiusLabel} Radius Access</strong>
          )}{" "}
          ({locationName})
        </div>

        {isUpgrade && (
          <div
            style={{
              marginTop: "0.6rem",
              fontSize: "0.75rem",
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              padding: "0.4rem 0.8rem",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <TrendingUp size={12} />
            Upgrade from {previousRadiusLabel} — you're only paying the
            difference
          </div>
        )}
      </div>

      {/* Account Info Box */}
      <div
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--primary, #6366f1) 6%, transparent)",
          border:
            "1px solid color-mix(in srgb, var(--primary, #6366f1) 20%, transparent)",
          borderRadius: "12px",
          padding: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
          }}
        >
          <span
            style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)" }}
          >
            Merchant Name:
          </span>
          <strong style={{ fontSize: "0.85rem" }}>NestFinder Pvt. Ltd.</strong>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)" }}
          >
            eSewa ID / Number:
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <strong
              style={{ fontSize: "0.95rem", color: "var(--primary, #6366f1)" }}
            >
              {esewaNumber}
            </strong>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--primary, #6366f1)",
                padding: "2px",
                display: "flex",
              }}
              title="Copy eSewa number"
            >
              {copied ? (
                <Check size={16} style={{ color: "#10b981" }} />
              ) : (
                <Copy size={16} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions list */}
      <div
        style={{
          fontSize: "0.82rem",
          color: "var(--text-muted, #64748b)",
          lineHeight: 1.6,
        }}
      >
        <strong
          style={{
            display: "block",
            color: "var(--text-main)",
            marginBottom: "0.4rem",
          }}
        >
          How to Pay:
        </strong>
        <ol style={{ margin: 0, paddingLeft: "1.2rem" }}>
          <li>Open eSewa or your Mobile Banking app.</li>
          <li>
            Scan the QR code above or transfer to <strong>{esewaNumber}</strong>
            .
          </li>
          <li>
            Enter exact amount: <strong>{formatNPR(amount)}</strong>.
          </li>
          <li>Take a screenshot of the completed payment receipt.</li>
          <li>Upload the screenshot in the verification form on the right.</li>
        </ol>
      </div>
    </div>
  );
};

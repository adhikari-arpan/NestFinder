// src/payment/PaymentQR.jsx
// Displays eSewa / Fonepay payment QR code, merchant account details, and payment instructions

import React from "react";
import { QrCode, ShieldCheck, Copy, Check } from "lucide-react";
import { useState } from "react";
import { formatNPR } from "../../utils/paymentUtils";

export const PaymentQR = ({ amount, targetLocation, radius, paymentType }) => {
  const [copied, setCopied] = useState(false);
  const esewaNumber = "9841000000";
  const isListingFee = paymentType === "landlord_listing";

  const handleCopy = () => {
    navigator.clipboard.writeText(esewaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const radiusLabel = radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius} m`;
  const locationName = targetLocation?.name || (targetLocation ? `${targetLocation.lat.toFixed(3)}, ${targetLocation.lng.toFixed(3)}` : "Selected Area");

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
            <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>eSewa / Fonepay Direct QR</h4>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)" }}>Instant Merchant Transfer</span>
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
          {/* Simulated HD Payment QR SVG */}
          <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="white" />
            <path d="M20 20H80V80H20V20ZM35 35V65H65V35H35Z" fill="#15803d" />
            <path d="M45 45H55V55H45V45Z" fill="#15803d" />
            <path d="M120 20H180V80H120V20ZM135 35V65H165V35H135Z" fill="#15803d" />
            <path d="M145 45H155V55H145V45Z" fill="#15803d" />
            <path d="M20 120H80V180H20V120ZM35 135V165H65V135H35Z" fill="#15803d" />
            <path d="M45 145H55V155H45V145Z" fill="#15803d" />
            <path d="M90 20H110V50H90V20Z" fill="#60bb46" />
            <path d="M90 70H110V110H90V70Z" fill="#15803d" />
            <path d="M120 90H180V110H120V90Z" fill="#15803d" />
            <path d="M120 120H140V150H120V120Z" fill="#60bb46" />
            <path d="M150 120H180V180H150V120ZM162 135V165H168V135H162Z" fill="#15803d" />
            <path d="M90 130H110V180H90V130Z" fill="#15803d" />
            <circle cx="100" cy="100" r="16" fill="#60bb46" />
            <text x="100" y="104" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle">eSewa</text>
          </svg>
        </div>

        <span style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.2rem" }}>
          Scan to Pay
        </span>
        <strong style={{ fontSize: "1.5rem", fontWeight: 800 }}>{formatNPR(amount)}</strong>

        <div
          style={{
            marginTop: "0.75rem",
            fontSize: "0.78rem",
            backgroundColor: "rgba(255,255,255,0.15)",
            padding: "0.4rem 0.8rem",
            borderRadius: "20px",
          }}
        >
          Purpose: {isListingFee ? (
            <strong>Room Listing Fee</strong>
          ) : (
            <strong>{radiusLabel} Radius Access</strong>
          )} ({locationName})
        </div>
      </div>

      {/* Account Info Box */}
      <div
        style={{
          backgroundColor: "color-mix(in srgb, var(--primary, #6366f1) 6%, transparent)",
          border: "1px solid color-mix(in srgb, var(--primary, #6366f1) 20%, transparent)",
          borderRadius: "12px",
          padding: "1rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)" }}>Merchant Name:</span>
          <strong style={{ fontSize: "0.85rem" }}>NestFinder Pvt. Ltd.</strong>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)" }}>eSewa ID / Number:</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <strong style={{ fontSize: "0.95rem", color: "var(--primary, #6366f1)" }}>{esewaNumber}</strong>
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
              {copied ? <Check size={16} style={{ color: "#10b981" }} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions list */}
      <div style={{ fontSize: "0.82rem", color: "var(--text-muted, #64748b)", lineHeight: 1.6 }}>
        <strong style={{ display: "block", color: "var(--text-main)", marginBottom: "0.4rem" }}>
          How to Pay:
        </strong>
        <ol style={{ margin: 0, paddingLeft: "1.2rem" }}>
          <li>Open eSewa or your Mobile Banking app.</li>
          <li>Scan the QR code above or transfer to <strong>{esewaNumber}</strong>.</li>
          <li>Enter exact amount: <strong>{formatNPR(amount)}</strong>.</li>
          <li>Take a screenshot of the completed payment receipt.</li>
          <li>Upload the screenshot in the verification form on the right.</li>
        </ol>
      </div>
    </div>
  );
};

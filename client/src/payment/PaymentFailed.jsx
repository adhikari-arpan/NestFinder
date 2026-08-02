// src/payment/PaymentFailed.jsx
// View displayed when a payment or verification submission encounters an error

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PaymentFailed = ({ errorMsg, onRetry }) => {
  const navigate = useNavigate();

  return (
    <div
      className="card animate-fade-in shadow-xl"
      style={{
        maxWidth: "540px",
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
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "rgba(239, 68, 68, 0.12)",
          color: "#ef4444",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.25rem",
        }}
      >
        <AlertTriangle size={36} />
      </div>

      <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
        Submission Error
      </h2>
      <p style={{ color: "var(--text-muted, #64748b)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
        {errorMsg || "We could not submit your payment verification proof. Please try again."}
      </p>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button onClick={onRetry} className="btn btn-primary flex gap-2 items-center">
          <RefreshCw size={16} /> Try Again
        </button>
        <button onClick={() => navigate("/rooms")} className="btn btn-outline flex gap-2 items-center">
          <Home size={16} /> Back to Rooms
        </button>
      </div>
    </div>
  );
};

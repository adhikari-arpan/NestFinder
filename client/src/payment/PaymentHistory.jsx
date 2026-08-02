// src/payment/PaymentHistory.jsx
// User's payment history list showing status, target radius, screenshot proof, and approval date

import React, { useEffect, useState } from "react";
import { fetchUserPayments } from "./paymentAPI";
import { formatNPR, getStatusBadge } from "./paymentUtils";
import { Clock, CheckCircle, AlertCircle, Image as ImageIcon, Loader2 } from "lucide-react";

export const PaymentHistory = ({ userId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchUserPayments(userId)
      .then(setPayments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
        <Loader2 size={24} className="animate-spin mx-auto mb-2" />
        Loading payment history...
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div
        style={{
          padding: "3rem 1.5rem",
          textAlign: "center",
          borderRadius: "12px",
          border: "1px dashed var(--border-color)",
          color: "var(--text-muted)",
        }}
      >
        <Clock size={36} style={{ margin: "0 auto 0.5rem", opacity: 0.5 }} />
        <p style={{ margin: 0 }}>No payment history recorded yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
        Your Payment History ({payments.length})
      </h3>

      {payments.map((p) => {
        const badge = getStatusBadge(p.status);
        const radiusLabel =
          p.target_radius >= 1000
            ? `${(p.target_radius / 1000).toFixed(1)} km`
            : `${p.target_radius} m`;
        const locationName = p.target_location?.name || "Selected Point";

        return (
          <div
            key={p.id}
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              padding: "1rem 1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {p.proof_image_url ? (
                <img
                  src={p.proof_image_url}
                  alt="Proof preview"
                  onClick={() => setPreviewImage(p.proof_image_url)}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "8px",
                    objectFit: "cover",
                    cursor: "pointer",
                    border: "1px solid var(--border-color)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "8px",
                    backgroundColor: "var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ImageIcon size={20} style={{ color: "var(--text-muted)" }} />
                </div>
              )}

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <strong style={{ fontSize: "0.95rem" }}>{radiusLabel} Radius Access</strong>
                  <span className={badge.className} style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem" }}>
                    {badge.label}
                  </span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                  Location: {locationName} • {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--primary)" }}>
                {formatNPR(p.amount)}
              </div>
              {p.transaction_code && (
                <div style={{ fontSize: "0.72rem", color: "var(--text-light)" }}>
                  Ref: {p.transaction_code}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Image Modal Preview */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <img
            src={previewImage}
            alt="Payment receipt proof"
            style={{ maxHeight: "85vh", maxWidth: "90vw", borderRadius: "12px" }}
          />
        </div>
      )}
    </div>
  );
};

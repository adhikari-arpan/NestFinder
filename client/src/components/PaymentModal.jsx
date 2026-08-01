import React, { useState } from "react";
import { CreditCard, ShieldCheck, X, Sparkles, CheckCircle2, Clock } from "lucide-react";

export const PaymentModal = ({
  isOpen,
  onClose,
  location,
  radius,
  price,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState("esewa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const locationName = location?.name || (location ? `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}` : "Selected Point");
  const radiusLabel = radius >= 1000 ? `${(radius / 1000).toFixed(1)} km` : `${radius} m`;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onPaymentSuccess();
      }, 1200);
    }, 1500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        padding: "1rem",
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "var(--bg-card, #ffffff)",
          border: "1px solid var(--border-color, #e2e8f0)",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          position: "relative",
          color: "var(--text-main, #0f172a)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            background: "linear-gradient(135deg, var(--primary, #6366f1) 0%, #4f46e5 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={20} style={{ color: "#fbbf24", fill: "#fbbf24" }} />
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, color: "white" }}>
              Unlock Distance Tier Access
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "50%",
              display: "flex",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "1.5rem" }}>
          {isSuccess ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
              <CheckCircle2 size={56} style={{ color: "#10b981", margin: "0 auto 1rem" }} />
              <h4 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
                Payment Successful!
              </h4>
              <p style={{ color: "var(--text-muted, #64748b)", fontSize: "0.9rem" }}>
                You have unlocked <strong>{radiusLabel}</strong> room access around <strong>{locationName}</strong> for <strong>48 Hours</strong>.
              </p>
            </div>
          ) : (
            <>
              {/* Order Summary Box */}
              <div
                style={{
                  backgroundColor: "color-mix(in srgb, var(--primary, #6366f1) 8%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--primary, #6366f1) 25%, transparent)",
                  borderRadius: "12px",
                  padding: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)" }}>Target Location:</span>
                  <strong style={{ fontSize: "0.85rem", maxWidth: "200px", textAlign: "right" }}>{locationName}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)" }}>Distance Radius:</span>
                  <strong style={{ fontSize: "0.85rem" }}>{radiusLabel}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted, #64748b)" }}>Access Validity:</span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#10b981", display: "flex", alignItems: "center", gap: "3px" }}>
                    <Clock size={14} /> 48 Hours
                  </span>
                </div>
                <hr style={{ border: "none", borderTop: "1px dashed var(--border-color, #cbd5e1)", margin: "0.75rem 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: "1rem" }}>Total Payable:</span>
                  <span style={{ fontWeight: 800, fontSize: "1.35rem", color: "var(--primary, #6366f1)" }}>
                    Rs. {price}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Select Payment Gateway:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                  {[
                    { id: "esewa", label: "eSewa", icon: "🟢" },
                    { id: "khalti", label: "Khalti", icon: "🟣" },
                    { id: "card", label: "Card/Test", icon: "💳" },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      style={{
                        padding: "0.6rem 0.4rem",
                        borderRadius: "8px",
                        border: paymentMethod === method.id ? "2px solid var(--primary, #6366f1)" : "1px solid var(--border-color, #cbd5e1)",
                        backgroundColor: paymentMethod === method.id ? "color-mix(in srgb, var(--primary, #6366f1) 12%, transparent)" : "transparent",
                        fontWeight: paymentMethod === method.id ? 700 : 500,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.2rem",
                        color: "var(--text-main, #0f172a)",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>{method.icon}</span>
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info notice */}
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted, #64748b)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginBottom: "1.5rem",
                }}
              >
                <ShieldCheck size={16} style={{ color: "#10b981", flexShrink: 0 }} />
                <span>Instant activation for 48 hours. Secure test payment mode enabled.</span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color, #cbd5e1)",
                    backgroundColor: "transparent",
                    color: "var(--text-muted, #64748b)",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={isProcessing}
                  style={{
                    flex: 2,
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, var(--primary, #6366f1) 0%, #4f46e5 100%)",
                    color: "white",
                    fontWeight: 700,
                    cursor: isProcessing ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.35)",
                  }}
                >
                  {isProcessing ? (
                    <>Processing Payment...</>
                  ) : (
                    <>
                      <CreditCard size={18} /> Pay Rs. {price} Now
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// src/payment/PaymentPage.jsx
// Main reusable Payment Page container orchestrating QR payment, screenshot proof submission, and success screens

import { useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import { PaymentQR } from "../components/payment/PaymentQR";
import { PaymentForm } from "../components/payment/PaymentForm";
import { PaymentSuccess } from "../components/payment/PaymentSuccess";
import { PaymentFailed } from "../components/payment/PaymentFailed";
import { submitPaymentProof } from "../api/paymentAPI";
import { getDistancePrice } from "../utils/paymentUtils";
import { ArrowLeft, Sparkles } from "lucide-react";

export const PaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AppContext);

  // Extract payment metadata from query parameters or state defaults
  const paymentType = searchParams.get("type") || "distance_radius";
  const radius = Number(searchParams.get("radius") || 1000);
  const lat = Number(searchParams.get("lat") || 27.6644);
  const lng = Number(searchParams.get("lng") || 85.3188);
  const locationName = searchParams.get("name") || "NCIT College";

  const targetLocation = { name: locationName, lat, lng };
  const amount = searchParams.get("amount")
    ? Number(searchParams.get("amount"))
    : getDistancePrice(radius);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedPayment, setSubmittedPayment] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleFormSubmit = async ({ proofFile, transactionCode }) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await submitPaymentProof({
        userId: currentUser?.id || null,
        userName: currentUser?.name || "Tenant User",
        userEmail: currentUser?.email || "",
        userPhone: currentUser?.phone || "",
        paymentType,
        amount,
        targetLocation,
        targetRadius: radius,
        proofFile,
        transactionCode,
      });

      setSubmittedPayment(result);
    } catch (err) {
      console.error("Failed to submit payment proof:", err);
      setErrorMsg(
        err.message ||
          "Could not upload payment proof. Please check your internet connection.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="animate-fade-in container"
      style={{
        padding: "2.5rem 1.5rem 5rem",
        maxWidth: "1100px",
        margin: "0 auto",
      }}
    >
      {/* Top Header Navigation */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            marginBottom: "1rem",
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={26} style={{ fill: "white" }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                margin: 0,
                color: "var(--primary)",
              }}
            >
              NestFinder Payment Portal
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "0.9rem",
                color: "var(--text-muted)",
              }}
            >
              Complete your transfer via eSewa / Fonepay QR code and submit your
              receipt screenshot.
            </p>
          </div>
        </div>
      </div>

      {/* Main View rendering: Success, Error, or Two-Column Payment Flow */}
      {submittedPayment ? (
        <PaymentSuccess paymentDetails={submittedPayment} />
      ) : errorMsg ? (
        <PaymentFailed errorMsg={errorMsg} onRetry={() => setErrorMsg(null)} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Left Column: eSewa / Fonepay QR Card & Info */}
          <PaymentQR
            amount={amount}
            targetLocation={targetLocation}
            radius={radius}
            paymentType={paymentType}
          />

          {/* Right Column: Screenshot Proof Upload Form */}
          <PaymentForm
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      )}
    </div>
  );
};

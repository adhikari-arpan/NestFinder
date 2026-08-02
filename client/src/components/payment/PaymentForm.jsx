// src/payment/PaymentForm.jsx
// Form to upload payment proof screenshot, enter transaction code, and submit for admin verification

import React, { useState } from "react";
import { Upload, Image as ImageIcon, X, Send, ShieldAlert, CheckCircle2 } from "lucide-react";
import { formatNPR } from "../../utils/paymentUtils";

export const PaymentForm = ({
  amount,
  targetLocation,
  radius,
  onSubmit,
  isSubmitting,
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [transactionCode, setTransactionCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 5MB limit.");
      return;
    }

    setErrorMsg("");
    setFile(selected);

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(selected);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Payment proof screenshot is required.");
      return;
    }
    setErrorMsg("");
    onSubmit({ proofFile: file, transactionCode });
  };

  return (
    <form
      onSubmit={handleSubmit}
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
      <div>
        <h3 style={{ margin: "0 0 0.3rem", fontSize: "1.2rem", fontWeight: 700 }}>
          Submit Payment Verification Proof
        </h3>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted, #64748b)" }}>
          Upload a screenshot of your eSewa / Fonepay transaction receipt so our admin team can verify your payment.
        </p>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <ShieldAlert size={16} />
          {errorMsg}
        </div>
      )}

      {/* File Upload Dropzone */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            color: "var(--text-main)",
          }}
        >
          Payment Receipt Screenshot <span style={{ color: "#ef4444" }}>*</span>
        </label>

        {preview ? (
          <div
            style={{
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
              border: "2px solid var(--primary, #6366f1)",
              backgroundColor: "color-mix(in srgb, var(--primary) 5%, transparent)",
              padding: "0.5rem",
              textAlign: "center",
            }}
          >
            <img
              src={preview}
              alt="Payment proof preview"
              style={{
                maxHeight: "220px",
                width: "auto",
                maxWidth: "100%",
                margin: "0 auto",
                borderRadius: "8px",
                objectFit: "contain",
              }}
            />
            <button
              type="button"
              onClick={handleRemoveFile}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                padding: "6px",
                cursor: "pointer",
                display: "flex",
              }}
              title="Remove image"
            >
              <X size={16} />
            </button>
            <div style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: "#10b981", fontWeight: 600 }}>
              ✓ Screenshot Attached ({file.name})
            </div>
          </div>
        ) : (
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem 1rem",
              borderRadius: "12px",
              border: "2px dashed var(--border-color, #cbd5e1)",
              backgroundColor: "color-mix(in srgb, var(--bg-app, #f8fafc) 80%, transparent)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Upload size={36} style={{ color: "var(--primary, #6366f1)", marginBottom: "0.5rem" }} />
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>
              Click or drag to upload screenshot
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted, #64748b)", marginTop: "0.2rem" }}>
              PNG, JPG, WEBP up to 5MB
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
        )}
      </div>

      {/* Transaction ID / Remarks Input */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "0.85rem",
            fontWeight: 700,
            marginBottom: "0.4rem",
            color: "var(--text-main)",
          }}
        >
          Transaction Code / Reference ID (Optional):
        </label>
        <input
          type="text"
          value={transactionCode}
          onChange={(e) => setTransactionCode(e.target.value)}
          placeholder="e.g. 02194857321"
          className="form-input"
          style={{ width: "100%", padding: "0.75rem" }}
        />
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem", display: "block" }}>
          Found in your eSewa statement description / reference code.
        </span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !file}
        style={{
          width: "100%",
          padding: "1rem",
          borderRadius: "12px",
          border: "none",
          background: isSubmitting || !file
            ? "var(--border-color, #cbd5e1)"
            : "linear-gradient(135deg, var(--primary, #6366f1) 0%, #4f46e5 100%)",
          color: "white",
          fontWeight: 800,
          fontSize: "1rem",
          cursor: isSubmitting || !file ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.6rem",
          boxShadow: isSubmitting || !file ? "none" : "0 8px 20px rgba(99, 102, 241, 0.35)",
        }}
      >
        {isSubmitting ? (
          <>Uploading & Submitting...</>
        ) : (
          <>
            <Send size={18} /> Send Proof for Admin Verification
          </>
        )}
      </button>
    </form>
  );
};

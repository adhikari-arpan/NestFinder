import { useState, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import { AppContext } from "../../Context/AppContext";
import * as kycApi from "../../api/kycApi";
import { MapContainer as LeafletMap, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  X,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  IdCard,
} from "lucide-react";

const isPdf = (path) => !!path && path.toLowerCase().endsWith(".pdf");

const DocPreview = ({ label, path, signedUrl }) => {
  if (!signedUrl) return null;
  return (
    <div className="form-group" style={{ marginBottom: 0 }}>
      <label className="form-label">{label}</label>
      {isPdf(path) ? (
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm flex w-fit items-center gap-1"
        >
          <FileText size={14} /> View PDF
        </a>
      ) : (
        <a href={signedUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={signedUrl}
            alt={label}
            style={{
              width: "100%",
              maxHeight: "180px",
              objectFit: "cover",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
            }}
          />
        </a>
      )}
    </div>
  );
};

// userId: the landlord being reviewed
// onClose(): close the modal
// onReviewed(userId, newStatus): let the caller update its local list + toast
export const KycReviewModal = ({ userId, userName, onClose, onReviewed }) => {
  const { currentUser, pushNotification } = useContext(AppContext);

  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reason, setReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    kycApi
      .fetchKYCByUserId(userId)
      .then(setKyc)
      .catch((err) => {
        console.error("Failed to load KYC record:", err.message);
        setLoadError("Could not load this user's KYC submission.");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const decide = async (decision) => {
    if (decision === "rejected" && !reason.trim()) {
      setShowRejectForm(true);
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      await kycApi.reviewKYC(kyc.id, decision, reason.trim(), currentUser.id);
      await pushNotification(
        userId,
        decision === "approved" ? "KYC Verification Approved" : "KYC Verification Rejected",
        decision === "approved"
          ? "Your KYC submission has been approved. You can now post room listings."
          : `Your KYC submission was rejected: "${reason.trim()}". Please update and resubmit.`,
        "info",
      );
      onReviewed(userId, decision);
    } catch (err) {
      console.error("Failed to review KYC:", err.message);
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2001,
          width: "100%",
          maxWidth: "680px",
          maxHeight: "88vh",
          overflowY: "auto",
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
            <IdCard size={22} style={{ color: "var(--primary)" }} /> KYC Submission — {userName}
          </h2>
          <button onClick={onClose} className="btn btn-outline btn-sm" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-(--text-light)">
            <Loader2 size={32} className="mx-auto mb-2 animate-spin text-(--primary)" />
            <p>Loading submission...</p>
          </div>
        ) : loadError ? (
          <p style={{ color: "var(--danger, #dc2626)" }}>{loadError}</p>
        ) : !kyc ? (
          <p style={{ color: "var(--text-light)" }}>This user hasn't submitted a KYC form yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 text-[0.88rem] sm:grid-cols-2">
              <div><strong>Name:</strong> {kyc.first_name} {kyc.last_name}</div>
              <div><strong>Phone:</strong> {kyc.phone}</div>
              <div><strong>Email:</strong> {kyc.email}</div>
              <div>
                <strong>Document:</strong>{" "}
                {kyc.document_type === "citizenship" ? "Citizenship" : "NID"} — {kyc.document_number}
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <strong>Address:</strong> {kyc.tole}, {kyc.municipality}, {kyc.district}, {kyc.province}
              </div>
              <div>
                <strong>Utility Bill:</strong> {kyc.utility_bill_type === "electricity" ? "Electricity" : "Water"}
              </div>
              <div>
                <strong>Submitted:</strong> {new Date(kyc.submitted_at).toLocaleString()}
              </div>
            </div>

            <div style={{ height: "200px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-color)" }}>
              <LeafletMap
                center={[kyc.latitude, kyc.longitude]}
                zoom={14}
                style={{ height: "100%", width: "100%" }}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                zoomControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                <Marker position={[kyc.latitude, kyc.longitude]} />
              </LeafletMap>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DocPreview label="Document — Front" path={kyc.document_front_url} signedUrl={kyc.document_front_signed_url} />
              <DocPreview label="Document — Back" path={kyc.document_back_url} signedUrl={kyc.document_back_signed_url} />
              <DocPreview label="Utility Bill" path={kyc.utility_bill_url} signedUrl={kyc.utility_bill_signed_url} />
              <DocPreview label="Selfie" path={kyc.selfie_url} signedUrl={kyc.selfie_signed_url} />
            </div>

            {kyc.status !== "pending" && (
              <p style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>
                Current status: <strong>{kyc.status}</strong>
                {kyc.rejection_reason ? ` — "${kyc.rejection_reason}"` : ""}
              </p>
            )}

            {showRejectForm && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Rejection reason *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Explain what's wrong so the landlord can fix it..."
                  className="form-input"
                  style={{ resize: "vertical" }}
                />
              </div>
            )}

            {submitError && (
              <p style={{ color: "var(--danger, #dc2626)", fontSize: "0.85rem" }}>{submitError}</p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                onClick={() => decide("rejected")}
                disabled={submitting || (showRejectForm && !reason.trim())}
                className="btn btn-outline btn-sm flex gap-1"
                style={{ color: "var(--danger, #dc2626)", borderColor: "var(--danger, #dc2626)" }}
              >
                <XCircle size={14} /> {showRejectForm ? "Confirm Reject" : "Reject"}
              </button>
              <button
                onClick={() => decide("approved")}
                disabled={submitting}
                className="btn btn-secondary btn-sm flex gap-1"
              >
                <CheckCircle size={14} /> Approve
              </button>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
};

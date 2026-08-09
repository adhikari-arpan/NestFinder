import { useState, useEffect, useContext } from "react";
import { createPortal } from "react-dom";
import { AppContext } from "../../Context/AppContext";
import * as kycApi from "../../api/kycApi";
import { MapContainer as LeafletMap, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LoadingScreen } from "../LoadingScreen";
import {
  X,
  CheckCircle,
  XCircle,
  FileText,
  IdCard,
  User,
  MapPin,
  Camera,
  History,
  MessageSquare,
} from "lucide-react";

const STATUS_BADGE = {
  pending: { label: "Pending Review", className: "badge badge-accent" },
  approved: { label: "Approved", className: "badge badge-secondary" },
  rejected: { label: "Rejected", className: "badge badge-danger" },
};

const isPdf = (path) => !!path && path.toLowerCase().endsWith(".pdf");

// Section wrapper: icon + title + generous spacing, divided by a rule.
const Section = ({ icon: Icon, title, children }) => (
  <section className="border-b border-(--border-color) pb-7 last:border-b-0 last:pb-0">
    <h3 className="mb-4 flex items-center gap-2 text-[1rem] font-bold text-(--text-main)">
      <Icon size={18} className="text-(--primary)" /> {title}
    </h3>
    {children}
  </section>
);

// Read-only label/value pair, matches the form field it was collected from.
const Field = ({ label, value }) => (
  <div>
    <div className="text-[0.7rem] font-semibold tracking-wide text-(--text-light) uppercase">
      {label}
    </div>
    <div className="mt-1 text-[0.95rem] text-(--text-main)">{value || "—"}</div>
  </div>
);

const DocPreview = ({ label, path, signedUrl }) => {
  if (!signedUrl) {
    return (
      <div>
        <div className="text-[0.7rem] font-semibold tracking-wide text-(--text-light) uppercase">
          {label}
        </div>
        <div className="mt-1 text-[0.85rem] text-(--text-light) italic">
          Not provided
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-1.5 text-[0.7rem] font-semibold tracking-wide text-(--text-light) uppercase">
        {label}
      </div>
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
              height: "200px",
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
    if (decision === "rejected" && !reason.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await kycApi.reviewKYC(kyc.id, decision, reason.trim(), currentUser.id);
      await pushNotification(
        userId,
        decision === "approved"
          ? "KYC Verification Approved"
          : "KYC Verification Rejected",
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

  const statusBadge = kyc ? STATUS_BADGE[kyc.status] : null;

  return createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2001,
          width: "100%",
          maxWidth: "min(860px, 94vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "2.25rem 2.5rem",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h2 className="m-0 flex items-center gap-2 text-[1.4rem] font-extrabold">
              <IdCard size={24} className="text-(--primary)" /> KYC Submission
            </h2>
            <p className="mt-1 text-[0.9rem] text-(--text-light)">{userName}</p>
          </div>
          <div className="flex items-center gap-3">
            {statusBadge && (
              <span className={`${statusBadge.className} text-[0.75rem]`}>
                {statusBadge.label}
              </span>
            )}
            <button
              onClick={onClose}
              className="btn btn-outline btn-sm"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingScreen label="Loading submission..." fullScreen={false} />
        ) : loadError ? (
          <p style={{ color: "var(--danger, #dc2626)" }}>{loadError}</p>
        ) : !kyc ? (
          <p style={{ color: "var(--text-light)" }}>
            This user hasn't submitted a KYC form yet.
          </p>
        ) : (
          <div className="flex flex-col gap-7">
            <Section icon={User} title="Personal Information">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                <Field label="First Name" value={kyc.first_name} />
                <Field label="Last Name" value={kyc.last_name} />
                <Field label="Phone" value={kyc.phone} />
                <Field label="Email" value={kyc.email} />
              </div>
            </Section>

            <Section icon={MapPin} title="Permanent Address">
              <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                <Field label="Province" value={kyc.province} />
                <Field label="District" value={kyc.district} />
                <Field label="Local Level" value={kyc.municipality} />
                <Field label="Tole / Street" value={kyc.tole} />
              </div>
              <div
                style={{
                  height: "240px",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  border: "1px solid var(--border-color)",
                }}
              >
                <LeafletMap
                  center={[kyc.latitude, kyc.longitude]}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
                  dragging={false}
                  scrollWheelZoom={false}
                  doubleClickZoom={false}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <Marker position={[kyc.latitude, kyc.longitude]} />
                </LeafletMap>
              </div>
              <p className="mt-2 text-[0.78rem] text-(--text-light)">
                Pin: {kyc.latitude}, {kyc.longitude} &middot; Posting radius:{" "}
                {kyc.allowed_radius_meters}m
              </p>
            </Section>

            <Section icon={IdCard} title="Identity Document">
              <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                <Field
                  label="Document Type"
                  value={
                    kyc.document_type === "citizenship"
                      ? "Citizenship Certificate"
                      : "National ID (NID)"
                  }
                />
                <Field label="Document Number" value={kyc.document_number} />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <DocPreview
                  label="Front Side"
                  path={kyc.document_front_url}
                  signedUrl={kyc.document_front_signed_url}
                />
                {kyc.document_type === "citizenship" && (
                  <DocPreview
                    label="Back Side"
                    path={kyc.document_back_url}
                    signedUrl={kyc.document_back_signed_url}
                  />
                )}
              </div>
            </Section>

            <Section icon={FileText} title="Utility Bill">
              <div className="mb-5">
                <Field
                  label="Bill Type"
                  value={
                    kyc.utility_bill_type === "electricity"
                      ? "Electricity"
                      : "Water"
                  }
                />
              </div>
              <div className="max-w-sm">
                <DocPreview
                  label="Uploaded Bill"
                  path={kyc.utility_bill_url}
                  signedUrl={kyc.utility_bill_signed_url}
                />
              </div>
            </Section>

            {kyc.selfie_signed_url && (
              <Section icon={Camera} title="Selfie Verification">
                <div className="max-w-sm">
                  <DocPreview
                    label="Selfie Holding Document"
                    path={kyc.selfie_url}
                    signedUrl={kyc.selfie_signed_url}
                  />
                </div>
              </Section>
            )}

            <Section icon={History} title="Submission History">
              <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                <Field
                  label="Submitted"
                  value={new Date(kyc.submitted_at).toLocaleString()}
                />
                {kyc.reviewed_at && (
                  <Field
                    label="Last Reviewed"
                    value={new Date(kyc.reviewed_at).toLocaleString()}
                  />
                )}
                {statusBadge && (
                  <Field label="Current Status" value={statusBadge.label} />
                )}
              </div>
              {kyc.rejection_reason && (
                <p
                  className="mt-4 text-[0.85rem]"
                  style={{ color: "var(--danger, #dc2626)" }}
                >
                  Rejection reason: "{kyc.rejection_reason}"
                </p>
              )}
            </Section>

            {kyc.status === "pending" && (
              <>
                <Section icon={MessageSquare} title="Rejection Remarks">
                  <p className="mb-3 text-[0.82rem] text-(--text-light)">
                    Only required if you're rejecting this submission — the
                    landlord sees this exact text.
                  </p>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. Document photo is blurry, please re-upload a clearer scan of the front side."
                    className="form-input"
                    style={{ resize: "vertical", width: "100%" }}
                  />
                </Section>

                {submitError && (
                  <p
                    style={{
                      color: "var(--danger, #dc2626)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {submitError}
                  </p>
                )}

                <div className="flex justify-end gap-2 border-t border-(--border-color) pt-6">
                  <button
                    onClick={() => decide("rejected")}
                    disabled={submitting || !reason.trim()}
                    className="btn btn-outline btn-sm flex gap-1"
                    style={{
                      color: "var(--danger, #dc2626)",
                      borderColor: "var(--danger, #dc2626)",
                    }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    onClick={() => decide("approved")}
                    disabled={submitting}
                    className="btn btn-secondary btn-sm flex gap-1"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>,
    document.body,
  );
};

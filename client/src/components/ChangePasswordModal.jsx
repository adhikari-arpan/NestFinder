import { useState, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { AppContext } from "../Context/AppContext";
import { LoadingScreen } from "./ui/LoadingScreen";
import { ModalLogo } from "./ui/ModalLogo";
import { Lock, X, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";

const MIN_PASSWORD_LENGTH = 6;

// Two-step "Change Password": re-verify identity with the current password
// (equivalent to a re-login) before the new-password form is even shown.
export const ChangePasswordModal = ({ onClose }) => {
  const { verifyPassword, changePassword } = useContext(AppContext);

  const [step, setStep] = useState("verify"); // 'verify' | 'change'
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await verifyPassword(currentPassword);
      setStep("change");
    } catch (err) {
      setError(err.message || "Incorrect password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("New password must be different from your current password.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await changePassword(newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Could not change your password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <>
      <div
        onClick={submitting ? undefined : onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
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
          maxWidth: "420px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        }}
      >
        <ModalLogo />

        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[1.2rem] font-extrabold">
            <Lock size={20} className="text-primary" />{" "}
            {success
              ? "Password Changed"
              : step === "verify"
                ? "Verify Your Identity"
                : "Set a New Password"}
          </h3>
          <button
            className="btn btn-ghost p-2"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {submitting ? (
          <LoadingScreen
            label={step === "verify" ? "Verifying..." : "Updating your password..."}
            fullScreen={false}
          />
        ) : success ? (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <CheckCircle2 size={40} className="text-primary" />
            <p className="text-[0.9rem]">
              Your password has been updated successfully.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary mt-2 w-full"
            >
              Done
            </button>
          </div>
        ) : step === "verify" ? (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <p className="text-text-muted text-[0.85rem]">
              For your security, confirm your current password before you can
              set a new one.
            </p>

            {error && (
              <p style={{ color: "var(--danger, #dc2626)", fontSize: "0.85rem", margin: 0 }}>
                {error}
              </p>
            )}

            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Your current password"
                  className="form-input w-full pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((p) => !p)}
                  className="text-text-muted absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0 hover:opacity-70"
                  aria-label={showCurrent ? "Hide password" : "Show password"}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="mt-2 flex gap-3">
              <button type="button" onClick={onClose} className="btn btn-outline flex-1">
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex flex-1 items-center justify-center gap-2"
              >
                <ShieldCheck size={16} /> Verify
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChange} className="flex flex-col gap-4">
            {error && (
              <p style={{ color: "var(--danger, #dc2626)", fontSize: "0.85rem", margin: 0 }}>
                {error}
              </p>
            )}

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                  className="form-input w-full pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  className="text-text-muted absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent p-0 hover:opacity-70"
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type={showNew ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="form-input w-full"
              />
            </div>

            <div className="mt-2 flex gap-3">
              <button type="button" onClick={onClose} className="btn btn-outline flex-1">
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex flex-1 items-center justify-center gap-2"
              >
                <Lock size={16} /> Change Password
              </button>
            </div>
          </form>
        )}
      </div>
    </>,
    document.body,
  );
};

import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { AppContext } from "../Context/AppContext";
import { LoadingScreen } from "./LoadingScreen";
import { User, X, Save } from "lucide-react";

// Lets a signed-in user change their own display name and phone number.
// Deliberately doesn't touch role/verification/KYC/suspension — those stay
// admin/server-controlled (see api.updateOwnProfile).
export const EditProfileModal = ({ onClose }) => {
  const { currentUser, updateOwnProfile } = useContext(AppContext);
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Display name is required.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await updateOwnProfile({ name: name.trim(), phone: phone.trim() });
      onClose();
    } catch (err) {
      console.error("Failed to update profile:", err.message);
      setError(
        err.message || "Could not update your profile. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <>
      <div
        onClick={onClose}
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
        <div className="mb-6 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[1.2rem] font-extrabold">
            <User size={20} className="text-primary" /> Edit Profile
          </h3>
          <button
            className="btn btn-ghost p-2"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {submitting ? (
          <LoadingScreen label="Saving your profile..." fullScreen={false} />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <p
                style={{
                  color: "var(--danger, #dc2626)",
                  fontSize: "0.85rem",
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}

            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="form-input w-full"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+977 98XXXXXXXX"
                className="form-input w-full"
              />
            </div>

            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex flex-1 items-center justify-center gap-2"
              >
                <Save size={16} /> Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </>,
    document.body,
  );
};

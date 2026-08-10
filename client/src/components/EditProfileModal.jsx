import { useState, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { AppContext } from "../Context/AppContext";
import { LoadingScreen } from "./ui/LoadingScreen";
import { CountryCodeSelect } from "./ui/CountryCodeSelect";
import { ModalLogo } from "./ui/ModalLogo";
import { splitPhoneNumber, validatePhoneNumber } from "../utils/countryCodes";
import { User, X, Save } from "lucide-react";

// Lets a signed-in user change their own display name and phone number.
// Deliberately doesn't touch role/verification/KYC/suspension — those stay
// admin/server-controlled (see api.updateOwnProfile).
export const EditProfileModal = ({ onClose }) => {
  const { currentUser, updateOwnProfile } = useContext(AppContext);
  const [name, setName] = useState(currentUser?.name || "");
  const initialPhone = splitPhoneNumber(currentUser?.phone);
  const [countryDial, setCountryDial] = useState(initialPhone.dial);
  const [phone, setPhone] = useState(initialPhone.number);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Display name is required.");
      return;
    }
    const phoneError = validatePhoneNumber(countryDial, phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await updateOwnProfile({
        name: name.trim(),
        phone: `+${countryDial}${phone.trim()}`,
      });
      onClose();
    } catch (err) {
      console.error("Failed to update profile:", err.message);
      // Postgres unique_violation on the phone column (see the SQL migration
      // for profiles.phone) — give a message that names the actual problem
      // instead of a raw constraint-name error.
      const isDuplicatePhone =
        err.code === "23505" || /duplicate key.*phone/i.test(err.message || "");
      setError(
        isDuplicatePhone
          ? "That phone number is already registered to another account."
          : err.message || "Could not update your profile. Please try again.",
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
        <ModalLogo />

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
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={currentUser?.email || ""}
                readOnly
                disabled
                className="form-input w-full cursor-not-allowed opacity-60"
              />
              <span className="mt-1 block text-[0.75rem] text-(--text-light)">
                Your email is tied to your account and can't be changed here.
              </span>
            </div>

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
              <div className="flex w-full items-start gap-2">
                <CountryCodeSelect value={countryDial} onChange={setCountryDial} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder={countryDial === "977" ? "98XXXXXXXX" : "Phone number"}
                  className="form-input w-full"
                />
              </div>
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

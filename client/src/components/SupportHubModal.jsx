import { createPortal } from "react-dom";
import { ModalLogo } from "./ui/ModalLogo";
import { Mail, X } from "lucide-react";

const SUPPORT_EMAIL = "adhikariarpan2063@gmail.com";
const SUBJECT = "Support for NestFinder";
const BODY = "Hi NestFinder team,\n\nI want support. My message:\n>> ";

const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;

// Confirms before handing off to the user's mail client, since a mailto:
// redirect is a jarring, silent app-switch otherwise.
export const SupportHubModal = ({ onClose }) => {
  const handleContinue = () => {
    window.location.href = mailtoHref;
    onClose();
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
          maxWidth: "380px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "2rem 2rem 1.75rem",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}
      >
        <div className="mb-2 flex justify-end">
          <button
            className="btn btn-ghost p-2"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <ModalLogo />

        <h3
          style={{
            fontSize: "1.2rem",
            fontWeight: 800,
            marginBottom: "0.5rem",
            color: "var(--text-main)",
          }}
        >
          Contact Tech Support
        </h3>
        <p
          style={{
            fontSize: "0.88rem",
            color: "var(--text-muted)",
            marginBottom: "1.75rem",
            lineHeight: 1.6,
          }}
        >
          You'll be redirected to your email app to reach our support team at{" "}
          <strong>{SUPPORT_EMAIL}</strong>, with a message already drafted for
          you.
        </p>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ flex: 1, fontWeight: 700 }}
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            style={{
              flex: 1,
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.9rem",
              color: "white",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
            }}
          >
            <Mail size={15} /> Open Mail App
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
};

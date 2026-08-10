import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import {
  User,
  Image as ImageIcon,
  Trash2,
  LogOut,
  X,
  IdCard,
} from "lucide-react";
import { VerifiedBadge } from "./ui/VerifiedBadge";
import { EditProfileModal } from "./EditProfileModal";
import { AvatarPictureModal } from "./AvatarPictureModal";

// Shared dashboard header: renders whatever left-side content is passed as
// children, plus the profile trigger, profile overlay menu, and logout
// confirmation popup that are identical across Tenant/Landlord/Admin dashboards.
export const DashboardHeader = ({ children, className = "", style = {} }) => {
  const { currentUser, logoutUser, removeAvatar } = useContext(AppContext);
  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);

  const handleDeleteAvatar = async () => {
    if (deletingAvatar || !currentUser?.avatar_url) return;
    setDeletingAvatar(true);
    try {
      await removeAvatar();
    } catch (err) {
      console.error("Failed to delete profile picture:", err.message);
    } finally {
      setDeletingAvatar(false);
    }
  };

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logoutUser();
    navigate("/");
  };

  const cancelLogout = () => setShowLogoutConfirm(false);

  return (
    <>
      <div className={className} style={style}>
        {children}

        {/* Right: Profile trigger */}
        <div className="relative z-5 flex flex-col items-center gap-2">
          <div
            className="profile-circle"
            onClick={() => setProfileMenuOpen(true)}
            title="Click to view profile menu"
          >
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt="Profile" />
            ) : (
              <User size={40} className="text-primary" />
            )}
          </div>
          <span className="text-text-muted text-[0.75rem] font-bold">
            Your Profile
          </span>
          {currentUser?.role === "landlord" && (
            <VerifiedBadge isVerified={currentUser.is_verified} />
          )}
        </div>
      </div>

      {/* Profile Overlay Panel */}
      {createPortal(
        <>
          <div
            className={`profile-overlay-backdrop ${profileMenuOpen ? "open" : ""}`}
            onClick={() => setProfileMenuOpen(false)}
          />
          <div className={`profile-overlay ${profileMenuOpen ? "open" : ""}`}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-[1.2rem] font-extrabold">
                <User size={20} className="text-primary" /> Profile Menu
              </h3>
              <button
                className="btn btn-ghost p-2"
                onClick={() => setProfileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-8 flex flex-col gap-3">
              <div
                className="profile-menu-item"
                onClick={() => {
                  setProfileMenuOpen(false);
                  setEditProfileOpen(true);
                }}
              >
                <User size={18} /> Edit Profile
              </div>
              <div
                className="profile-menu-item"
                onClick={() => {
                  setProfileMenuOpen(false);
                  setAvatarModalOpen(true);
                }}
              >
                <ImageIcon size={18} /> Update Profile Picture
              </div>
              {currentUser?.role === "landlord" && (
                <div
                  className="profile-menu-item"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate("/kyc");
                  }}
                >
                  <IdCard size={18} /> Update KYC
                </div>
              )}
              <div
                className={`profile-menu-item text-danger hover:bg-danger-light hover:border-danger hover:text-danger border-[rgba(239,68,68,0.2)] ${
                  deletingAvatar || !currentUser?.avatar_url
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                onClick={handleDeleteAvatar}
              >
                <Trash2 size={18} />{" "}
                {deletingAvatar ? "Deleting..." : "Delete Profile Picture"}
              </div>
            </div>

            <div className="border-border-color mt-auto border-t pt-4">
              <button
                className="btn btn-primary flex w-full items-center justify-center gap-2"
                onClick={handleLogout}
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </>,
        document.body,
      )}

      {editProfileOpen && (
        <EditProfileModal onClose={() => setEditProfileOpen(false)} />
      )}

      {avatarModalOpen && (
        <AvatarPictureModal onClose={() => setAvatarModalOpen(false)} />
      )}

      {/* Logout Confirmation Popup - portaled to body, project-wide overlay pattern */}
      {showLogoutConfirm &&
        createPortal(
          <>
            <div
              onClick={cancelLogout}
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
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "50%",
                  background: "var(--primary-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.25rem",
                }}
              >
                <LogOut size={22} style={{ color: "var(--primary)" }} />
              </div>

              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  marginBottom: "0.5rem",
                  color: "var(--text-main)",
                }}
              >
                Are you sure you want to Logout from NestFinder?
              </h3>
              <p
                style={{
                  fontSize: "0.88rem",
                  color: "var(--text-muted)",
                  marginBottom: "1.75rem",
                  lineHeight: 1.6,
                }}
              >
                You can sign back in anytime.
              </p>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={cancelLogout}
                  className="btn btn-outline"
                  style={{ flex: 1, fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
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
                  <LogOut size={15} /> Yes, Logout
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
};

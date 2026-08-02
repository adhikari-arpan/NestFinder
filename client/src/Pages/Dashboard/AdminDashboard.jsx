import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import * as api from "../../api/listingsapi";
import { fetchAllPayments, updatePaymentStatus as apiUpdatePaymentStatus } from "../../api/paymentAPI";
import { formatNPR, getStatusBadge } from "../../utils/paymentUtils";
import whiteLogo from "../../assets/White_NestFinderLogo.png";
import darkLogo from "../../assets/Dark_NestFinderLogo.png";
import { DashboardHeader } from "../../components/DashboardHeader";
import { StatTile } from "../../components/admin/StatTile";
import { BarChartPanel } from "../../components/admin/BarChartPanel";
import { SectionHeading } from "../../components/admin/SectionHeading";
import { KycReviewModal } from "../../components/admin/KycReviewModal";
import { LoadingScreen } from "../../components/LoadingScreen";

import {
  ShieldAlert,
  CheckCircle,
  Trash2,
  UserMinus,
  Flag,
  AlertTriangle,
  Users,
  Building2,
  User,
  Search,
  IdCard,
  CreditCard,
  Eye,
  Check,
  XCircle,
  X,
  Image as ImageIcon,
} from "lucide-react";

const KYC_BADGE = {
  not_submitted: {
    label: "No KYC Submitted",
    className: "badge badge-primary",
  },
  pending: { label: "KYC Pending Review", className: "badge badge-accent" },
  approved: { label: "KYC Verified", className: "badge badge-secondary" },
  rejected: { label: "KYC Rejected", className: "badge badge-danger" },
};

export const AdminDashboard = () => {
  const { listings, updateListingStatus, currentUser, authLoading, grantRadiusAccess, theme } = useContext(AppContext);
  const logo = theme === 'dark' ? darkLogo : whiteLogo;

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("payments"); // Default to payments tab so admin sees payment queue

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [previewProof, setPreviewProof] = useState(null);

  const [actionMessage, setActionMessage] = useState(null); // { text, type: 'success' | 'error' | 'info' }
  const [reviewingUser, setReviewingUser] = useState(null); // { id, name } | null

  const handleKycReviewed = (userId, decision) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, kyc_status: decision, is_verified: decision === "approved" }
          : u,
      ),
    );
    setActionMessage({
      text:
        decision === "approved"
          ? "Landlord's KYC approved."
          : "Landlord's KYC rejected.",
      type: "success",
    });
    setReviewingUser(null);
  };

  const handleUserSuspend = () => {
    setActionMessage({
      text: "Suspend isn't wired up yet — add a banned-status column to profiles in Supabase to enable it.",
      type: "info",
    });
  };

  // Not logged in or not an admin: bounce to the auth page. Wait for the
  // initial session check first, otherwise this fires on every reload
  // before currentUser has loaded and bounces straight to /auth.
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/auth");
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    api
      .fetchAllUsers()
      .then(setUsers)
      .catch((err) => {
        console.error("Failed to load users:", err.message);
        setActionMessage({
          text: "Failed to load platform users.",
          type: "error",
        });
      })
      .finally(() => setUsersLoading(false));
  }, []);

  // paymentsLoading already starts true, so the mount effect below doesn't
  // need to (and shouldn't) set it synchronously — only the fetch's own
  // async callbacks touch state.
  const loadPayments = () => {
    fetchAllPayments()
      .then(setPayments)
      .catch((err) => console.error("Failed to load payments:", err))
      .finally(() => setPaymentsLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handlePaymentVerification = async (paymentId, decision) => {
    try {
      const updated = await apiUpdatePaymentStatus(paymentId, decision);
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: decision } : p))
      );

      if (decision === "approved" && updated) {
        const isListingFee = updated.payment_type === "landlord_listing";
        if (!isListingFee && updated.target_location && updated.target_radius) {
          grantRadiusAccess(updated.target_location, updated.target_radius, updated.amount, updated.user_id);
        }
        setActionMessage({
          text: isListingFee
            ? `Listing fee of Rs. ${updated.amount} verified & approved!`
            : `Payment of Rs. ${updated.amount} verified & approved! 48-Hour radius access granted.`,
          type: "success",
        });
      } else {
        setActionMessage({
          text: `Payment verification rejected.`,
          type: "info",
        });
      }
    } catch (err) {
      console.error("Payment status update failed:", err);
    }
  };

  useEffect(() => {
    if (!actionMessage) return;
    const timer = setTimeout(() => setActionMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  if (authLoading) return <LoadingScreen />;
  if (!currentUser || currentUser.role !== "admin") return null;

  const totalListings = listings.length;
  const verifiedCount = listings.filter((l) => l.status === "verified").length;
  const pendingCount = listings.filter((l) => l.status === "pending").length;
  const flaggedCount = listings.filter((l) => l.status === "flagged").length;

  const pendingListings = listings.filter((l) => l.status === "pending");
  const flaggedListings = listings.filter((l) => l.status === "flagged");

  const verifiedLandlordCount = users.filter(
    (u) => u.role === "landlord" && u.is_verified,
  ).length;

  const statusChartData = [
    { label: "Verified", value: verifiedCount, colorVar: "--secondary" },
    { label: "Pending", value: pendingCount, colorVar: "--accent" },
    { label: "Flagged", value: flaggedCount, colorVar: "--danger" },
  ];

  const roleChartData = [
    {
      label: "Tenants",
      value: users.filter((u) => u.role === "tenant").length,
      colorVar: "--primary",
    },
    {
      label: "Landlords",
      value: users.filter((u) => u.role === "landlord").length,
      colorVar: "--secondary",
    },
    {
      label: "Admins",
      value: users.filter((u) => u.role === "admin").length,
      colorVar: "--accent",
    },
  ];

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  });

  const roleLabel = (role) =>
    role ? role.charAt(0).toUpperCase() + role.slice(1) : "Unknown";

  const tabClass = (tab) =>
    `flex items-center gap-1.5 px-0.5 py-3 text-[0.95rem] font-bold border-b-[3px] bg-transparent border-x-0 border-t-0 cursor-pointer transition-colors ${
      activeTab === tab
        ? "text-[var(--primary)] border-b-[var(--primary)]"
        : "text-[var(--text-light)] border-b-transparent"
    }`;

  return (
    <div className="animate-fade-in container pt-10 pb-20 text-left">
      {/* Header */}

      <DashboardHeader className="welcome-banner-redesign animate-fade-in mb-8">
        <div>
          <img
            src={logo}
            alt="NestFinder"
            style={{ height: "70px", width: "auto", marginBottom: "0.75rem" }}
          />
          <p className="text-[0.95rem] font-semibold text-(--primary)">
            Hey, {currentUser?.name} 👋
          </p>
          <h1 className="mt-0.5 flex items-center gap-2 text-[1.6rem] font-extrabold">
            <ShieldAlert size={28} className="text-(--primary)" />
            Administrative Moderation Board
          </h1>
          <p className="mt-1 text-[0.85rem] text-(--text-light)">
            Moderate housing listings, manage registered users, and audit
            platform activity. Check notifications for new tasks that require
            your review.
          </p>
        </div>
      </DashboardHeader>

      {/* Overview */}
      <section className="border-b border-(--border-color) pb-6">
        <SectionHeading>Overview</SectionHeading>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          <StatTile label="Total Properties" value={totalListings} />
          <StatTile
            label="Verified Rooms"
            value={verifiedCount}
            colorVar="--secondary"
          />
          <StatTile
            label="Pending Review"
            value={pendingCount}
            colorVar="--accent"
          />
          <StatTile
            label="Flagged / Spam"
            value={flaggedCount}
            colorVar="--danger"
          />
          <StatTile
            label="Total Users"
            value={usersLoading ? "—" : users.length}
          />
          <StatTile
            label="Verified Landlords"
            value={usersLoading ? "—" : verifiedLandlordCount}
            colorVar="--primary"
          />
        </div>
      </section>

      {/* Analytics */}
      <section className="border-b border-(--border-color) py-6">
        <SectionHeading>Analytics</SectionHeading>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BarChartPanel
            title="Listings by Status"
            icon={ShieldAlert}
            data={statusChartData}
          />
          <BarChartPanel
            title="Users by Role"
            icon={Users}
            data={roleChartData}
            emptyLabel={usersLoading ? "Loading users..." : "No users yet."}
          />
        </div>
      </section>

      {/* Management */}
      <section className="pt-6">
        <SectionHeading>Management</SectionHeading>
        <div className="mb-8 flex flex-wrap gap-6 border-b border-(--border-color)">
          <button
            onClick={() => setActiveTab("payments")}
            className={tabClass("payments")}
          >
            <CreditCard size={16} /> Payment Verifications ({payments.filter((p) => p.status === "pending").length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={tabClass("pending")}
          >
            <CheckCircle size={16} /> Room Approvals ({pendingListings.length})
          </button>
          <button
            onClick={() => setActiveTab("flagged")}
            className={tabClass("flagged")}
          >
            <Flag size={16} /> Flagged / Spam ({flaggedListings.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={tabClass("users")}
          >
            <Users size={16} /> Platform Users ({users.length})
          </button>
        </div>

        {/* 0. Payment Verifications Queue */}
        {activeTab === "payments" && (
          <div className="flex flex-col gap-4">
            {paymentsLoading ? (
              <div className="card p-6">
                <LoadingScreen label="Loading payment verifications..." fullScreen={false} />
              </div>
            ) : payments.length === 0 ? (
              <div className="card p-12 text-center text-(--text-light)">
                <CreditCard size={40} className="mx-auto mb-2 text-(--secondary)" />
                <p>No payment proof submissions in queue.</p>
              </div>
            ) : (
              payments.map((p) => {
                const badge = getStatusBadge(p.status);
                const isListingFee = p.payment_type === "landlord_listing";
                const radiusLabel =
                  p.target_radius >= 1000
                    ? `${(p.target_radius / 1000).toFixed(1)} km`
                    : `${p.target_radius} m`;
                const locationName = p.target_location?.name || "Selected Area";

                return (
                  <div
                    key={p.id}
                    className="card grid grid-cols-1 gap-6 p-5 shadow-sm md:grid-cols-[1.3fr_0.7fr]"
                  >
                    {/* Left: User & Payment Details */}
                    <div className="flex items-start gap-4 text-left">
                      {p.proof_image_url ? (
                        <div className="group relative cursor-pointer" onClick={() => setPreviewProof(p.proof_image_url)}>
                          <img
                            src={p.proof_image_url}
                            className="h-20 w-24 rounded-md border border-(--border-color) object-cover"
                            alt="Payment screenshot proof"
                          />
                          <div className="color-white absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <Eye size={18} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-(--border-color)">
                          <ImageIcon size={24} className="text-(--text-muted)" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={badge.className}>{badge.label}</span>
                          <span className="text-[0.75rem] font-bold text-(--primary)">
                            {formatNPR(p.amount)}
                          </span>
                        </div>

                        <h3 className="mt-1 mb-0.5 text-[1.05rem] font-bold">
                          {isListingFee ? "Room Listing Fee" : `${radiusLabel} Distance Tier Access`}
                        </h3>
                        <div className="text-[0.8rem] text-(--text-muted)">
                          {isListingFee ? "Listing" : "Target Area"}: <strong>{locationName}</strong> • Submitted: {new Date(p.created_at).toLocaleString()}
                        </div>
                        <div className="mt-2 text-[0.8rem] text-(--text-light)">
                          User: <strong>{p.user_name}</strong> ({p.user_email || p.user_phone || "No contact info"})
                        </div>
                        {p.transaction_code && (
                          <div className="mt-1 text-[0.75rem] text-(--text-muted)">
                            Ref/Txn Code: <code className="rounded bg-(--bg-app) px-1.5 py-0.5 font-mono">{p.transaction_code}</code>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Verification Action buttons */}
                    <div className="flex flex-col items-end justify-center gap-2 sm:flex-row">
                      {p.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handlePaymentVerification(p.id, "approved")}
                            className="btn btn-secondary btn-sm flex w-full gap-1 sm:w-auto"
                          >
                            <Check size={16} /> {isListingFee ? "Approve Payment" : "Approve & Grant Access"}
                          </button>
                          <button
                            onClick={() => handlePaymentVerification(p.id, "rejected")}
                            className="btn btn-outline btn-sm flex w-full gap-1 text-(--danger) sm:w-auto"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[0.8rem] font-semibold text-(--text-muted)">
                          {p.status === "approved"
                            ? (isListingFee ? "✓ Payment Approved" : "✓ Granted 48h Access")
                            : "✕ Rejected"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 1. Pending Approvals */}
        {activeTab === "pending" && (
          <div className="flex flex-col gap-4">
            {pendingListings.length === 0 ? (
              <div className="card p-12 text-center text-(--text-light)">
                <CheckCircle
                  size={40}
                  className="mx-auto mb-2 text-(--secondary)"
                />
                <p>All room submissions have been reviewed. Clean queue!</p>
              </div>
            ) : (
              pendingListings.map((item) => (
                <div
                  key={item.id}
                  className="card grid grid-cols-1 gap-8 p-5 shadow-sm md:grid-cols-[1.2fr_0.8fr]"
                >
                  {/* Details */}
                  <div className="flex items-start gap-4 text-left">
                    <img
                      src={item.images[0]}
                      className="h-15 w-20 rounded-sm object-cover"
                      alt="preview"
                    />
                    <div>
                      <span className="badge badge-accent text-[0.65rem]">
                        PENDING REVIEW
                      </span>
                      <h3 className="mt-1 mb-0.5 text-[1.05rem]">
                        <Link
                          to={`/room/${item.id}`}
                          className="text-(--text-main)"
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <div className="text-[0.8rem] text-(--text-muted)">
                        📍 {item.location} • Rs. {item.price.toLocaleString()}{" "}
                        /mo
                      </div>
                      <div className="mt-2 text-[0.78rem] text-(--text-light)">
                        Landlord: <strong>{item.landlord.name}</strong> (
                        {item.landlord.email})
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => updateListingStatus(item.id, "verified")}
                      className="btn btn-secondary btn-sm flex gap-1"
                    >
                      <CheckCircle size={14} /> Approve listing
                    </button>
                    <button
                      onClick={() => updateListingStatus(item.id, "flagged")}
                      className="btn btn-outline btn-sm flex gap-1 text-(--danger)"
                    >
                      <AlertTriangle size={14} /> Reject / Flag
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. Flagged Listings */}
        {activeTab === "flagged" && (
          <div className="flex flex-col gap-4">
            {flaggedListings.length === 0 ? (
              <div className="card p-12 text-center text-(--text-light)">
                <Flag size={40} className="mx-auto mb-2 text-(--secondary)" />
                <p>No listings are currently flagged as spam or fraudulent.</p>
              </div>
            ) : (
              flaggedListings.map((item) => (
                <div
                  key={item.id}
                  className="card grid grid-cols-1 gap-8 p-5 shadow-sm md:grid-cols-[1.2fr_0.8fr]"
                >
                  {/* Details */}
                  <div className="flex items-start gap-4 text-left">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--danger-light) text-(--danger)">
                      <Flag size={20} />
                    </div>
                    <div>
                      <span className="badge badge-danger text-[0.65rem]">
                        FLAGGED AS SPAM
                      </span>
                      <h3 className="mt-1 mb-0.5 text-[1.05rem]">
                        <Link
                          to={`/room/${item.id}`}
                          className="text-(--text-main)"
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <div className="text-[0.8rem] text-(--text-muted)">
                        📍 {item.location} • Owner: {item.landlord.name}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => updateListingStatus(item.id, "verified")}
                      className="btn btn-outline btn-sm flex gap-1"
                    >
                      <CheckCircle size={14} /> Clear Flag (Approve)
                    </button>
                    <button
                      onClick={() => updateListingStatus(item.id, "pending")}
                      className="btn btn-primary btn-sm flex gap-1 bg-(--danger)"
                    >
                      <Trash2 size={14} /> Ban & Delete Listing
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. Platform Users */}
        {activeTab === "users" && (
          <div className="flex flex-col gap-4">
            {actionMessage && (
              <div
                className={`rounded-md border px-4 py-3 text-[0.85rem] font-medium ${
                  actionMessage.type === "success"
                    ? "border-(--secondary) bg-(--secondary-light) text-(--secondary)"
                    : actionMessage.type === "error"
                      ? "border-(--danger) bg-(--danger-light) text-(--danger)"
                      : "border-(--border-color) bg-(--bg-app) text-(--text-muted)"
                }`}
              >
                {actionMessage.text}
              </div>
            )}

            <div className="relative">
              <Search
                size={16}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-(--text-light)"
              />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="form-input w-full text-[0.9rem]"
                style={{ paddingLeft: "2.5rem" }}
              />
            </div>

            {usersLoading ? (
              <div className="card p-6">
                <LoadingScreen label="Loading platform users..." fullScreen={false} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="card p-12 text-center text-(--text-light)">
                <Users size={40} className="mx-auto mb-2 text-(--secondary)" />
                <p>
                  {users.length === 0
                    ? "No registered users found."
                    : "No users match your search."}
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="card flex flex-col gap-4 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Identity */}
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-(--primary-light) text-[1rem] font-bold text-(--primary)">
                      {(user.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-[1rem] font-semibold text-(--text-main)">
                          {user.name || "Unnamed user"}
                        </h3>
                        {user.role === "admin" && (
                          <ShieldAlert size={14} className="text-(--primary)" />
                        )}
                      </div>
                      <div className="text-[0.8rem] text-(--text-muted)">
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="text-[0.75rem] text-(--text-light)">
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges + Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge badge-primary flex items-center gap-1 text-[0.7rem]">
                      {user.role === "landlord" ? (
                        <Building2 size={12} />
                      ) : (
                        <User size={12} />
                      )}
                      {roleLabel(user.role)}
                    </span>
                    {user.role === "landlord" && (
                      <span
                        className={`${KYC_BADGE[user.kyc_status || "not_submitted"].className} text-[0.7rem]`}
                      >
                        {KYC_BADGE[user.kyc_status || "not_submitted"].label}
                      </span>
                    )}

                    <div className="ml-1 flex gap-1.5">
                      {user.role === "landlord" &&
                        user.kyc_status &&
                        user.kyc_status !== "not_submitted" && (
                          <button
                            onClick={() =>
                              setReviewingUser({
                                id: user.id,
                                name: user.name || "Unnamed user",
                              })
                            }
                            className="btn btn-outline btn-sm px-2 py-1 text-[0.75rem]"
                          >
                            <IdCard size={12} /> Review KYC
                          </button>
                        )}
                      <button
                        onClick={handleUserSuspend}
                        className="btn btn-outline btn-sm px-2 py-1 text-[0.75rem] text-(--danger)"
                      >
                        <UserMinus size={12} /> Suspend
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {reviewingUser && (
        <KycReviewModal
          userId={reviewingUser.id}
          userName={reviewingUser.name}
          onClose={() => setReviewingUser(null)}
          onReviewed={handleKycReviewed}
        />
      )}

      {/* Payment Proof Modal Preview */}
      {previewProof && (
        <div
          onClick={() => setPreviewProof(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <button
              onClick={() => setPreviewProof(null)}
              style={{
                position: "absolute",
                top: "-15px",
                right: "-15px",
                backgroundColor: "white",
                color: "black",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              <X size={18} />
            </button>
            <img
              src={previewProof}
              alt="Payment screenshot proof"
              style={{ maxHeight: "85vh", maxWidth: "85vw", borderRadius: "12px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

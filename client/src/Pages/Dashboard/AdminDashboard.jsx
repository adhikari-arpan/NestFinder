import { useState, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import * as api from "../../api/listingsapi";
import {
  fetchAllPayments,
  updatePaymentStatus as apiUpdatePaymentStatus,
} from "../../api/paymentAPI";
import { formatNPR, getStatusBadge } from "../../utils/paymentUtils";
import { isListingLive, daysRemaining } from "../../utils/listingLifecycle";
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
  UserCheck,
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
  Clock,
  TrendingUp,
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
  const {
    listings,
    updateListingStatus,
    currentUser,
    authLoading,
    grantRadiusAccess,
    theme,
  } = useContext(AppContext);
  const logo = theme === "dark" ? darkLogo : whiteLogo;

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("payments"); // Default to payments tab so admin sees payment queue

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("pending");
  const [listingStatusFilter, setListingStatusFilter] = useState("pending");
  const [previewProof, setPreviewProof] = useState(null);

  const [actionMessage, setActionMessage] = useState(null); // { text, type: 'success' | 'error' | 'info' }
  const [reviewingUser, setReviewingUser] = useState(null); // { id, name } | null
  const [suspendingId, setSuspendingId] = useState(null);
  // Shown as a blocking overlay for any admin action that waits on a
  // network round-trip (listing status changes, payment verification, user
  // suspension) — previously these buttons gave zero visual feedback while
  // in flight, which read as the page having frozen.
  const [busyLabel, setBusyLabel] = useState(null);

  const handleListingAction = async (id, status, label) => {
    setBusyLabel(label);
    try {
      await updateListingStatus(id, status);
    } finally {
      setBusyLabel(null);
    }
  };

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

  const handleUserSuspend = async (user) => {
    const nextSuspended = !user.is_suspended;
    const confirmed = window.confirm(
      nextSuspended
        ? `Suspend ${user.name || "this user"}? They won't be able to sign in until reactivated.`
        : `Reactivate ${user.name || "this user"}?`,
    );
    if (!confirmed) return;

    setSuspendingId(user.id);
    setBusyLabel(nextSuspended ? "Suspending user..." : "Reactivating user...");
    try {
      await api.setUserSuspended(user.id, nextSuspended);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_suspended: nextSuspended } : u,
        ),
      );
      setActionMessage({
        text: nextSuspended
          ? `${user.name || "User"} has been suspended.`
          : `${user.name || "User"} has been reactivated.`,
        type: "success",
      });
    } catch (err) {
      console.error("Failed to update suspension status:", err.message);
      setActionMessage({
        text: "Couldn't update the user's suspension status.",
        type: "error",
      });
    } finally {
      setSuspendingId(null);
      setBusyLabel(null);
    }
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
    setPaymentsError(null);
    fetchAllPayments()
      .then(setPayments)
      .catch((err) => {
        console.error("Failed to load payments:", err);
        setPaymentsError(
          err.message ||
            "Could not load payments. Check your connection or Supabase permissions.",
        );
      })
      .finally(() => setPaymentsLoading(false));
  };

  useEffect(() => {
    Promise.resolve().then(() => loadPayments());
  }, []);

  const handlePaymentVerification = async (paymentId, decision) => {
    setBusyLabel(
      decision === "approved" ? "Approving payment..." : "Rejecting payment...",
    );
    try {
      const updated = await apiUpdatePaymentStatus(paymentId, decision);
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? updated : p)),
      );

      if (decision === "approved") {
        const isListingFee = updated.payment_type === "landlord_listing";
        if (!isListingFee && updated.target_location && updated.target_radius) {
          grantRadiusAccess(
            updated.target_location,
            updated.target_radius,
            updated.amount,
            updated.user_id,
          );
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
      setActionMessage({
        text: err.message || "Couldn't update this payment. Please try again.",
        type: "error",
      });
    } finally {
      setBusyLabel(null);
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
  // "Active" = verified and still within the 7-day post-verification
  // visibility window; "Expired" = verified but that window has passed —
  // the row/status is untouched, it's just dropped from tenant-facing
  // search until re-verified (see utils/listingLifecycle.js).
  const activeListings = listings.filter(
    (l) => l.status === "verified" && isListingLive(l),
  );
  const expiredListings = listings.filter(
    (l) => l.status === "verified" && !isListingLive(l),
  );

  const LISTING_FILTERS = [
    { key: "pending", label: "Pending Review", list: pendingListings },
    { key: "active", label: "Active", list: activeListings },
    { key: "expired", label: "Expired", list: expiredListings },
    { key: "flagged", label: "Flagged", list: flaggedListings },
    { key: "all", label: "All", list: listings },
  ];
  const filteredListings =
    LISTING_FILTERS.find((f) => f.key === listingStatusFilter)?.list ||
    listings;

  const listingBadge = (item) => {
    if (item.status === "pending")
      return { label: "PENDING REVIEW", className: "badge badge-accent" };
    if (item.status === "flagged")
      return { label: "FLAGGED", className: "badge badge-danger" };
    if (item.status === "verified" && isListingLive(item))
      return { label: "ACTIVE", className: "badge badge-secondary" };
    if (item.status === "verified")
      return { label: "EXPIRED", className: "badge badge-primary" };
    return {
      label: (item.status || "unknown").toUpperCase(),
      className: "badge",
    };
  };

  const verifiedLandlordCount = users.filter(
    (u) => u.role === "landlord" && u.is_verified,
  ).length;

  const statusChartData = [
    { label: "Verified", value: verifiedCount, colorVar: "--secondary" },
    { label: "Pending", value: pendingCount, colorVar: "--accent" },
    { label: "Flagged", value: flaggedCount, colorVar: "--danger" },
  ];

  // ------------------------------------------------------------
  // Revenue analytics (approved payments only — pending/rejected amounts
  // aren't real revenue yet)
  // ------------------------------------------------------------
  const approvedPayments = payments.filter((p) => p.status === "approved");
  const pendingPayments = payments.filter((p) => p.status === "pending");
  const rejectedPayments = payments.filter((p) => p.status === "rejected");
  const sumAmount = (list) =>
    list.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalRevenue = sumAmount(approvedPayments);
  const pendingRevenue = sumAmount(pendingPayments);
  const radiusRevenue = sumAmount(
    approvedPayments.filter((p) => p.payment_type !== "landlord_listing"),
  );
  const listingRevenue = sumAmount(
    approvedPayments.filter((p) => p.payment_type === "landlord_listing"),
  );

  const revenueByTypeChartData = [
    {
      label: `Tenant Fees (${formatNPR(radiusRevenue)})`,
      value: radiusRevenue,
      colorVar: "--primary",
    },
    {
      label: `Landlord Fees (${formatNPR(listingRevenue)})`,
      value: listingRevenue,
      colorVar: "--secondary",
    },
  ];

  const PAYMENT_FILTERS = [
    { key: "pending", label: "Pending Review", list: pendingPayments },
    { key: "approved", label: "Approved History", list: approvedPayments },
    { key: "rejected", label: "Rejected", list: rejectedPayments },
    { key: "all", label: "All", list: payments },
  ];
  const filteredPayments =
    PAYMENT_FILTERS.find((f) => f.key === paymentStatusFilter)?.list ||
    payments;

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

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            label="Total Revenue"
            value={paymentsLoading ? "—" : formatNPR(totalRevenue)}
            colorVar="--secondary"
            icon={TrendingUp}
          />
          <StatTile
            label="Pending Verification"
            value={paymentsLoading ? "—" : formatNPR(pendingRevenue)}
            colorVar="--accent"
            icon={Clock}
          />
          <StatTile
            label="Approved Payments"
            value={paymentsLoading ? "—" : approvedPayments.length}
            colorVar="--primary"
          />
          <StatTile
            label="Rejected Payments"
            value={paymentsLoading ? "—" : rejectedPayments.length}
            colorVar="--danger"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
          <BarChartPanel
            title="Revenue by Payment Type"
            icon={CreditCard}
            data={revenueByTypeChartData}
            emptyLabel={
              paymentsLoading
                ? "Loading payments..."
                : "No approved payments yet."
            }
          />
        </div>
      </section>

      {/* Management */}
      <section className="pt-6">
        <SectionHeading>Management</SectionHeading>

        {actionMessage && (
          <div
            className={`mb-4 rounded-md border px-4 py-3 text-[0.85rem] font-medium ${
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

        <div className="mb-8 flex flex-wrap gap-6 border-b border-(--border-color)">
          <button
            onClick={() => setActiveTab("payments")}
            className={tabClass("payments")}
          >
            <CreditCard size={16} /> Payment Verifications (
            {pendingPayments.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={tabClass("pending")}
          >
            <CheckCircle size={16} /> Room Listings ({pendingListings.length}{" "}
            pending)
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
            {/* Status filter chips */}
            <div className="flex flex-wrap gap-2">
              {PAYMENT_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setPaymentStatusFilter(f.key)}
                  className="cursor-pointer rounded-full border px-3 py-1.5 text-[0.78rem] font-semibold transition-colors"
                  style={
                    paymentStatusFilter === f.key
                      ? {
                          background: "var(--primary)",
                          color: "white",
                          border: "1px solid var(--primary)",
                        }
                      : {
                          background: "transparent",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border-color)",
                        }
                  }
                >
                  {f.label} ({f.list.length})
                </button>
              ))}
            </div>

            {paymentsLoading ? (
              <div className="card p-6">
                <LoadingScreen
                  label="Loading payment verifications..."
                  fullScreen={false}
                />
              </div>
            ) : paymentsError ? (
              <div className="card border-(--danger) p-12 text-center text-(--danger)">
                <ShieldAlert size={40} className="mx-auto mb-2" />
                <p className="font-semibold">{paymentsError}</p>
                <button
                  onClick={loadPayments}
                  className="btn btn-outline btn-sm mt-4"
                >
                  Retry
                </button>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="card p-12 text-center text-(--text-light)">
                <CreditCard
                  size={40}
                  className="mx-auto mb-2 text-(--secondary)"
                />
                <p>
                  {paymentStatusFilter === "pending"
                    ? "No payment proof submissions in queue."
                    : `No ${paymentStatusFilter} payments yet.`}
                </p>
              </div>
            ) : (
              filteredPayments.map((p) => {
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
                        <div
                          className="group relative cursor-pointer"
                          onClick={() => setPreviewProof(p.proof_image_url)}
                        >
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
                          <ImageIcon
                            size={24}
                            className="text-(--text-muted)"
                          />
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
                          {isListingFee
                            ? "Room Listing Fee"
                            : `${radiusLabel} Distance Tier Access`}
                        </h3>
                        <div className="text-[0.8rem] text-(--text-muted)">
                          {isListingFee ? "Listing" : "Target Area"}:{" "}
                          <strong>{locationName}</strong> • Submitted:{" "}
                          {new Date(p.created_at).toLocaleString()}
                        </div>
                        <div className="mt-2 text-[0.8rem] text-(--text-light)">
                          User: <strong>{p.user_name}</strong> (
                          {p.user_email || p.user_phone || "No contact info"})
                        </div>
                        {p.transaction_code && (
                          <div className="mt-1 text-[0.75rem] text-(--text-muted)">
                            Ref/Txn Code:{" "}
                            <code className="rounded bg-(--bg-app) px-1.5 py-0.5 font-mono">
                              {p.transaction_code}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Verification Action buttons */}
                    <div className="flex flex-col items-end justify-center gap-2 sm:flex-row">
                      {p.status === "pending" ? (
                        <>
                          <button
                            onClick={() =>
                              handlePaymentVerification(p.id, "approved")
                            }
                            className="btn btn-secondary btn-sm flex w-full gap-1 sm:w-auto"
                          >
                            <Check size={16} />{" "}
                            {isListingFee
                              ? "Approve Payment"
                              : "Approve & Grant Access"}
                          </button>
                          <button
                            onClick={() =>
                              handlePaymentVerification(p.id, "rejected")
                            }
                            className="btn btn-outline btn-sm flex w-full gap-1 text-(--danger) sm:w-auto"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[0.8rem] font-semibold text-(--text-muted)">
                          {p.status === "approved"
                            ? isListingFee
                              ? "✓ Payment Approved"
                              : "✓ Granted 48h Access"
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

        {/* 1. Room Listings — every room that's ever been submitted, filterable
            by pending / active / expired / flagged / all */}
        {activeTab === "pending" && (
          <div className="flex flex-col gap-4">
            {/* Status filter chips */}
            <div className="flex flex-wrap gap-2">
              {LISTING_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setListingStatusFilter(f.key)}
                  className="cursor-pointer rounded-full border px-3 py-1.5 text-[0.78rem] font-semibold transition-colors"
                  style={
                    listingStatusFilter === f.key
                      ? {
                          background: "var(--primary)",
                          color: "white",
                          border: "1px solid var(--primary)",
                        }
                      : {
                          background: "transparent",
                          color: "var(--text-muted)",
                          border: "1px solid var(--border-color)",
                        }
                  }
                >
                  {f.label} ({f.list.length})
                </button>
              ))}
            </div>

            {filteredListings.length === 0 ? (
              <div className="card p-12 text-center text-(--text-light)">
                <CheckCircle
                  size={40}
                  className="mx-auto mb-2 text-(--secondary)"
                />
                <p>
                  {listingStatusFilter === "pending"
                    ? "All room submissions have been reviewed. Clean queue!"
                    : `No ${listingStatusFilter} listings.`}
                </p>
              </div>
            ) : (
              filteredListings.map((item) => {
                const badge = listingBadge(item);
                const isLive =
                  item.status === "verified" && isListingLive(item);
                const isExpired = item.status === "verified" && !isLive;
                const remaining = isLive ? daysRemaining(item) : null;
                const expiredOn =
                  isExpired && item.verifiedAt
                    ? new Date(
                        new Date(item.verifiedAt).getTime() +
                          7 * 24 * 60 * 60 * 1000,
                      ).toLocaleDateString()
                    : null;

                return (
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
                        <span className={`${badge.className} text-[0.65rem]`}>
                          {badge.label}
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
                        <div className="mt-1 text-[0.75rem] text-(--text-light)">
                          {item.createdAt &&
                            `Posted ${new Date(item.createdAt).toLocaleDateString()}`}
                          {isLive &&
                            remaining !== null &&
                            ` • Expires in ${remaining} day${remaining === 1 ? "" : "s"}`}
                          {isExpired &&
                            expiredOn &&
                            ` • Expired on ${expiredOn}`}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2">
                      {item.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleListingAction(
                                item.id,
                                "verified",
                                "Approving listing...",
                              )
                            }
                            className="btn btn-secondary btn-sm flex gap-1"
                          >
                            <CheckCircle size={14} /> Approve listing
                          </button>
                          <button
                            onClick={() =>
                              handleListingAction(
                                item.id,
                                "flagged",
                                "Flagging listing...",
                              )
                            }
                            className="btn btn-outline btn-sm flex gap-1 text-(--danger)"
                          >
                            <AlertTriangle size={14} /> Reject / Flag
                          </button>
                        </>
                      )}
                      {isLive && (
                        <button
                          onClick={() =>
                            handleListingAction(
                              item.id,
                              "flagged",
                              "Flagging listing...",
                            )
                          }
                          className="btn btn-outline btn-sm flex gap-1 text-(--danger)"
                        >
                          <AlertTriangle size={14} /> Flag
                        </button>
                      )}
                      {isExpired && (
                        <button
                          onClick={() =>
                            handleListingAction(
                              item.id,
                              "verified",
                              "Renewing listing...",
                            )
                          }
                          className="btn btn-secondary btn-sm flex gap-1"
                          title="Re-verify to restart the 7-day visibility window"
                        >
                          <CheckCircle size={14} /> Renew Listing
                        </button>
                      )}
                      {item.status === "flagged" && (
                        <Link
                          to={`/room/${item.id}`}
                          className="btn btn-outline btn-sm flex gap-1"
                        >
                          <Eye size={14} /> View Listing
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
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
                      onClick={() =>
                        handleListingAction(
                          item.id,
                          "verified",
                          "Clearing flag...",
                        )
                      }
                      className="btn btn-outline btn-sm flex gap-1"
                    >
                      <CheckCircle size={14} /> Clear Flag (Approve)
                    </button>
                    <button
                      onClick={() =>
                        handleListingAction(
                          item.id,
                          "pending",
                          "Updating listing...",
                        )
                      }
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
                <LoadingScreen
                  label="Loading platform users..."
                  fullScreen={false}
                />
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
                    {user.is_suspended && (
                      <span className="badge badge-danger text-[0.7rem]">
                        Suspended
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
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => handleUserSuspend(user)}
                          disabled={suspendingId === user.id}
                          className="btn btn-outline btn-sm px-2 py-1 text-[0.75rem] text-(--danger) disabled:opacity-60"
                        >
                          {user.is_suspended ? (
                            <>
                              <UserCheck size={12} /> Reactivate
                            </>
                          ) : (
                            <>
                              <UserMinus size={12} /> Suspend
                            </>
                          )}
                        </button>
                      )}
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

      {/* Blocking overlay for any in-flight admin action — portaled to
          document.body like KycReviewModal, since position: fixed inside
          the page's .animate-fade-in container is broken by the transform
          its fadeIn keyframes leave behind (translateY(0) still creates a
          containing block), which otherwise traps "fixed" overlays inside
          the page instead of covering the viewport. */}
      {busyLabel &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100000,
              backgroundColor: "rgba(15, 23, 42, 0.35)",
              backdropFilter: "blur(2px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LoadingScreen label={busyLabel} fullScreen={false} />
          </div>,
          document.body,
        )}

      {/* Payment Proof Modal Preview — also portaled, for the same reason */}
      {previewProof &&
        createPortal(
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
            <div
              style={{
                position: "relative",
                maxWidth: "90vw",
                maxHeight: "90vh",
              }}
            >
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
                style={{
                  maxHeight: "85vh",
                  maxWidth: "85vw",
                  borderRadius: "12px",
                }}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

import { useState, useContext } from "react";
import { createPortal } from "react-dom";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import logo from "../../assets/NestFinder Logo.png";

import {
  ShieldAlert,
  CheckCircle,
  Trash2,
  UserMinus,
  UserCheck,
  Flag,
  AlertTriangle,
  Users,
  User,
  Image as ImageIcon,
  LogOut,
  X,
} from "lucide-react";

export const AdminDashboard = () => {
  const { listings, updateListingStatus, currentUser, logoutUser } =
    useContext(AppContext);

  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logoutUser();
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  //id=f not loggedin or not admin, redirect to auth page
  // useEffect(() => {
  //   if (!currentUser || currentUser.role !== 'admin') {
  //     navigate('/auth');
  //   }
  // }, [currentUser]);

  // if (!currentUser || currentUser.role !== 'admin') return null;
  const adminListings = listings.filter(
    (l) =>
      // l.landlord.email.toLowerCase() === currentUser?.email.toLowerCase()   // blocks the dashboard changing from the url

      l.admin?.email?.toLowerCase() === currentUser?.email?.toLowerCase(),
  );

  const [activeTab, setActiveTab] = useState("pending");

  const totalListings = listings.length;
  const verifiedCount = listings.filter((l) => l.status === "verified").length;
  const pendingCount = listings.filter((l) => l.status === "pending").length;
  const flaggedCount = listings.filter((l) => l.status === "flagged").length;

  const pendingListings = listings.filter((l) => l.status === "pending");
  const flaggedListings = listings.filter((l) => l.status === "flagged");

  //mock users data for demonstration purposes

  const [mockUsers, setMockUsers] = useState([
    {
      id: 1,
      name: "Roshan Gurung",
      email: "roshan@gmail.com",
      role: "Tenant",
      status: "active",
    },
    {
      id: 2,
      name: "Ramesh Shrestha",
      email: "ramesh@nestfinder.com",
      role: "Landlord",
      status: "verified",
    },
    {
      id: 3,
      name: "Hari Bahadur Thapa",
      email: "haribdr@nestfinder.com",
      role: "Landlord",
      status: "pending",
    },
    {
      id: 4,
      name: "Maya Shakya",
      email: "maya@nestfinder.com",
      role: "Landlord",
      status: "verified",
    },
    {
      id: 5,
      name: "Saraswoti Adhikari",
      email: "saraswoti@nestfinder.com",
      role: "Landlord",
      status: "verified",
    },
  ]);

  const handleUserVerify = (userId) => {
    setMockUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "verified" } : u)),
    );
    alert(`Landlord verification status updated for User ID ${userId}`);
  };

  const handleUserBan = (userId) => {
    setMockUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: "banned" } : u)),
    );
    alert(`User ID ${userId} has been suspended.`);
  };

  const tabClass = (tab) =>
    `flex items-center gap-1.5 px-0.5 py-3 text-[0.95rem] font-bold border-b-[3px] bg-transparent border-x-0 border-t-0 cursor-pointer transition-colors ${
      activeTab === tab
        ? "text-[var(--primary)] border-b-[var(--primary)]"
        : "text-[var(--text-light)] border-b-transparent"
    }`;

  return (
    <div className="animate-fade-in container px-6 pt-12 pb-20 text-left">
      {/* Header */}

      <DashboardHeader className="flex justify-between items-start border-b border-(--border-color) pb-6 mb-8">
        <div>
          <img
            src={logo}
            alt="NestFinder"
            style={{ height: "70px", width: "auto" }}
          />
          <h1 className="flex items-center gap-2 text-[1.6rem] font-extrabold">
            <ShieldAlert size={28} className="text-(--primary)" />
            Administrative Moderation Board
          </h1>
          <p className="mt-1 text-[0.85rem] text-(--text-light)">
            Moderate housing listings, manage registered users, and audit
            platform activity.
          </p>
        </div>
      </DashboardHeader>

      {/* Stats Grid */}
      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="card border border-(--border-color) p-5 text-center">
          <span className="text-[0.75rem] font-bold tracking-wide text-(--text-light) uppercase">
            Total Properties
          </span>
          <strong className="mt-1 block text-[1.8rem] text-(--text-main)">
            {totalListings}
          </strong>
        </div>
        <div className="card border border-(--border-color) p-5 text-center">
          <span className="text-[0.75rem] font-bold tracking-wide text-(--secondary) uppercase">
            Verified Rooms
          </span>
          <strong className="mt-1 block text-[1.8rem] text-(--secondary)">
            {verifiedCount}
          </strong>
        </div>
        <div className="card border border-(--border-color) p-5 text-center">
          <span className="text-[0.75rem] font-bold tracking-wide text-(--accent) uppercase">
            Pending Review
          </span>
          <strong className="mt-1 block text-[1.8rem] text-(--accent)">
            {pendingCount}
          </strong>
        </div>
        <div className="card border border-(--border-color) p-5 text-center">
          <span className="text-[0.75rem] font-bold tracking-wide text-(--danger) uppercase">
            Flagged / Spam
          </span>
          <strong className="mt-1 block text-[1.8rem] text-(--danger)">
            {flaggedCount}
          </strong>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-6 border-b border-(--border-color)">
        <button
          onClick={() => setActiveTab("pending")}
          className={tabClass("pending")}
        >
          <CheckCircle size={16} /> Approvals Queue ({pendingListings.length})
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
          <Users size={16} /> Platform Users ({mockUsers.length})
        </button>
      </div>

      {/* 1. Pending Approvals */}
      {activeTab === "pending" && (
        <div className="flex flex-col gap-4">
          {pendingListings.length === 0 ? (
            <div className="card border border-(--border-color) p-12 text-center text-(--text-light)">
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
                className="card grid grid-cols-1 gap-8 border border-(--border-color) p-5 shadow-sm md:grid-cols-[1.2fr_0.8fr]"
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
                      📍 {item.location} • Rs. {item.price.toLocaleString()} /mo
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
                    className="btn btn-outline btn-sm flex gap-1 border-(--border-color) text-(--danger)"
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
            <div className="card border border-(--border-color) p-12 text-center text-(--text-light)">
              <Flag size={40} className="mx-auto mb-2 text-(--secondary)" />
              <p>No listings are currently flagged as spam or fraudulent.</p>
            </div>
          ) : (
            flaggedListings.map((item) => (
              <div
                key={item.id}
                className="card grid grid-cols-1 gap-8 border border-(--border-color) p-5 shadow-sm md:grid-cols-[1.2fr_0.8fr]"
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
                    className="btn btn-outline btn-sm flex gap-1 border-(--border-color)"
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

      {/* 3. Users Table */}
      {activeTab === "users" && (
        <div className="card overflow-hidden border border-(--border-color) p-0">
          <table className="poi-table w-full border-collapse text-[0.9rem]">
            <thead>
              <tr className="border-b border-(--border-color) bg-(--bg-app) text-left">
                <th className="px-4 py-3">User details</th>
                <th className="px-4 py-3">Email ID</th>
                <th className="px-4 py-3">Account Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id} className="border-b border-(--border-color)">
                  <td className="px-4 py-3 font-semibold">{user.name}</td>
                  <td className="px-4 py-3 text-(--text-light)">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 font-bold text-(--primary)">
                    {user.role}
                  </td>
                  <td className="px-4 py-3">
                    {user.status === "verified" && (
                      <span className="badge badge-secondary">
                        Verified Host
                      </span>
                    )}
                    {user.status === "pending" && (
                      <span className="badge badge-accent">
                        Verification Pending
                      </span>
                    )}
                    {user.status === "active" && (
                      <span className="badge badge-primary">Active</span>
                    )}
                    {user.status === "banned" && (
                      <span className="badge badge-danger">Suspended</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {user.role === "Landlord" &&
                        user.status === "pending" && (
                          <button
                            onClick={() => handleUserVerify(user.id)}
                            className="btn btn-outline btn-sm px-2 py-1 text-[0.75rem]"
                          >
                            <UserCheck size={12} /> Verify
                          </button>
                        )}
                      {user.status !== "banned" && (
                        <button
                          onClick={() => handleUserBan(user.id)}
                          className="btn btn-outline btn-sm border-(--border-color) px-2 py-1 text-[0.75rem] text-(--danger)"
                        >
                          <UserMinus size={12} /> Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

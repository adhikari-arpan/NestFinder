import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from "../../Context/AppContext";
import logo from '../../assets/NestFinder Logo.png';

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
} from 'lucide-react';

export const AdminDashboard = () => {
  const {
    listings,
    updateListingStatus,
    currentUser,
    logoutUser
  } = useContext(AppContext);

  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logoutUser();
    navigate('/');
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
  const adminListings = listings.filter(l =>
    // l.landlord.email.toLowerCase() === currentUser?.email.toLowerCase()   // blocks the dashboard changing from the url

    l.admin?.email?.toLowerCase() === currentUser?.email?.toLowerCase()
  );


  const [activeTab, setActiveTab] = useState('pending');

  const totalListings = listings.length;
  const verifiedCount = listings.filter(l => l.status === 'verified').length;
  const pendingCount = listings.filter(l => l.status === 'pending').length;
  const flaggedCount = listings.filter(l => l.status === 'flagged').length;

  const pendingListings = listings.filter(l => l.status === 'pending');
  const flaggedListings = listings.filter(l => l.status === 'flagged');

  //mock users data for demonstration purposes

  const [mockUsers, setMockUsers] = useState([
    { id: 1, name: "Roshan Gurung", email: "roshan@gmail.com", role: "Tenant", status: "active" },
    { id: 2, name: "Ramesh Shrestha", email: "ramesh@nestfinder.com", role: "Landlord", status: "verified" },
    { id: 3, name: "Hari Bahadur Thapa", email: "haribdr@nestfinder.com", role: "Landlord", status: "pending" },
    { id: 4, name: "Maya Shakya", email: "maya@nestfinder.com", role: "Landlord", status: "verified" },
    { id: 5, name: "Saraswoti Adhikari", email: "saraswoti@nestfinder.com", role: "Landlord", status: "verified" }
  ]);

  const handleUserVerify = (userId) => {
    setMockUsers(prev =>
      prev.map(u => u.id === userId ? { ...u, status: 'verified' } : u)
    );
    alert(`Landlord verification status updated for User ID ${userId}`);
  };

  const handleUserBan = (userId) => {
    setMockUsers(prev =>
      prev.map(u => u.id === userId ? { ...u, status: 'banned' } : u)
    );
    alert(`User ID ${userId} has been suspended.`);
  };

  const tabClass = (tab) =>
    `flex items-center gap-1.5 px-0.5 py-3 text-[0.95rem] font-bold border-b-[3px] bg-transparent border-x-0 border-t-0 cursor-pointer transition-colors ${activeTab === tab
      ? 'text-[var(--primary)] border-b-[var(--primary)]'
      : 'text-[var(--text-light)] border-b-transparent'
    }`;

  return (
    <div className="container animate-fade-in px-6 pt-12 pb-20 text-left">

      {/* Header */}

      <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-6 mb-8">
        <div>
          <img src={logo} alt="NestFinder" style={{ height: '70px', width: 'auto' }} />
          <h1 className="text-[1.6rem] font-extrabold flex items-center gap-2">
            <ShieldAlert size={28} className="text-[var(--primary)]" />
            Administrative Moderation Board
          </h1>
          <p className="text-[var(--text-light)] text-[0.85rem] mt-1">
            Moderate housing listings, manage registered users, and audit platform activity.
          </p>
        </div>

        {/* Right: Profile trigger */}
        <div className="flex flex-col items-center gap-2 relative z-[5]">
          <div
            className="profile-circle"
            onClick={() => setProfileMenuOpen(true)}
            title="Click to view profile menu"
          >
            {currentUser?.profilePicture ? (
              <img src={currentUser.profilePicture} alt="Profile" />
            ) : (
              <User size={40} className="text-primary" />
            )}
          </div>
          <span className="text-[0.75rem] font-bold text-text-muted">Your Profile</span>
        </div>
      </div>

      {/* Profile Overlay Panel */}
      <div
        className={`profile-overlay-backdrop ${profileMenuOpen ? 'open' : ''}`}
        onClick={() => setProfileMenuOpen(false)}
      />
      <div className={`profile-overlay ${profileMenuOpen ? 'open' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[1.2rem] font-extrabold flex items-center gap-2">
            <User size={20} className="text-primary" /> Profile Menu
          </h3>
          <button className="btn btn-ghost p-2" onClick={() => setProfileMenuOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          <div className="profile-menu-item" onClick={() => alert('Edit Profile functionality coming soon!')}>
            <User size={18} /> Edit Profile
          </div>
          <div className="profile-menu-item" onClick={() => alert('Change Profile Picture functionality coming soon!')}>
            <ImageIcon size={18} /> Change Profile Picture
          </div>
          <div
            className="profile-menu-item text-danger border-[rgba(239,68,68,0.2)] hover:bg-danger-light hover:border-danger hover:text-danger"
            onClick={() => alert('Delete Profile Picture functionality coming soon!')}
          >
            <Trash2 size={18} /> Delete Profile Picture
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-border-color">
          <button className="btn btn-primary w-full flex justify-center items-center gap-2" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Logout Confirmation Popup - portaled to body, project-wide overlay pattern */}
      {showLogoutConfirm && createPortal(
        <>
          <div
            onClick={cancelLogout}
            style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 2001, width: '100%', maxWidth: '380px',
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)', padding: '2rem 2rem 1.75rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)', textAlign: 'center',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%', background: 'var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem',
            }}>
              <LogOut size={22} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Are you sure you want to Logout from NestFinder?
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              You can sign back in anytime.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={cancelLogout} className="btn btn-outline" style={{ flex: 1, fontWeight: 700 }}>
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                style={{
                  flex: 1, border: 'none', borderRadius: 'var(--radius-md)', padding: '0.75rem',
                  cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', color: 'white',
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}
              >
                <LogOut size={15} /> Yes, Logout
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="card text-center p-5 border border-[var(--border-color)]">
          <span className="text-[0.75rem] font-bold text-[var(--text-light)] uppercase tracking-wide">Total Properties</span>
          <strong className="block text-[1.8rem] text-[var(--text-main)] mt-1">{totalListings}</strong>
        </div>
        <div className="card text-center p-5 border border-[var(--border-color)]">
          <span className="text-[0.75rem] font-bold text-[var(--secondary)] uppercase tracking-wide">Verified Rooms</span>
          <strong className="block text-[1.8rem] text-[var(--secondary)] mt-1">{verifiedCount}</strong>
        </div>
        <div className="card text-center p-5 border border-[var(--border-color)]">
          <span className="text-[0.75rem] font-bold text-[var(--accent)] uppercase tracking-wide">Pending Review</span>
          <strong className="block text-[1.8rem] text-[var(--accent)] mt-1">{pendingCount}</strong>
        </div>
        <div className="card text-center p-5 border border-[var(--border-color)]">
          <span className="text-[0.75rem] font-bold text-[var(--danger)] uppercase tracking-wide">Flagged / Spam</span>
          <strong className="block text-[1.8rem] text-[var(--danger)] mt-1">{flaggedCount}</strong>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[var(--border-color)] mb-8 flex-wrap">
        <button onClick={() => setActiveTab('pending')} className={tabClass('pending')}>
          <CheckCircle size={16} /> Approvals Queue ({pendingListings.length})
        </button>
        <button onClick={() => setActiveTab('flagged')} className={tabClass('flagged')}>
          <Flag size={16} /> Flagged / Spam ({flaggedListings.length})
        </button>
        <button onClick={() => setActiveTab('users')} className={tabClass('users')}>
          <Users size={16} /> Platform Users ({mockUsers.length})
        </button>
      </div>

      {/* 1. Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="flex flex-col gap-4">
          {pendingListings.length === 0 ? (
            <div className="card text-center p-12 text-[var(--text-light)] border border-[var(--border-color)]">
              <CheckCircle size={40} className="text-[var(--secondary)] mb-2 mx-auto" />
              <p>All room submissions have been reviewed. Clean queue!</p>
            </div>
          ) : (
            pendingListings.map(item => (
              <div
                key={item.id}
                className="card shadow-sm border border-[var(--border-color)] p-5 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-8"
              >
                {/* Details */}
                <div className="flex gap-4 items-start text-left">
                  <img
                    src={item.images[0]}
                    className="w-20 h-[60px] object-cover rounded-[var(--radius-sm)]"
                    alt="preview"
                  />
                  <div>
                    <span className="badge badge-accent text-[0.65rem]">PENDING REVIEW</span>
                    <h3 className="text-[1.05rem] mt-1 mb-0.5">
                      <Link to={`/room/${item.id}`} className="text-[var(--text-main)]">{item.title}</Link>
                    </h3>
                    <div className="text-[0.8rem] text-[var(--text-muted)]">
                      📍 {item.location} • Rs. {item.price.toLocaleString()} /mo
                    </div>
                    <div className="text-[0.78rem] text-[var(--text-light)] mt-2">
                      Landlord: <strong>{item.landlord.name}</strong> ({item.landlord.email})
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 items-center justify-end">
                  <button
                    onClick={() => updateListingStatus(item.id, 'verified')}
                    className="btn btn-secondary btn-sm flex gap-1"
                  >
                    <CheckCircle size={14} /> Approve listing
                  </button>
                  <button
                    onClick={() => updateListingStatus(item.id, 'flagged')}
                    className="btn btn-outline btn-sm flex gap-1 text-[var(--danger)] border-[var(--border-color)]"
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
      {activeTab === 'flagged' && (
        <div className="flex flex-col gap-4">
          {flaggedListings.length === 0 ? (
            <div className="card text-center p-12 text-[var(--text-light)] border border-[var(--border-color)]">
              <Flag size={40} className="text-[var(--secondary)] mb-2 mx-auto" />
              <p>No listings are currently flagged as spam or fraudulent.</p>
            </div>
          ) : (
            flaggedListings.map(item => (
              <div
                key={item.id}
                className="card shadow-sm border border-[var(--border-color)] p-5 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-8"
              >
                {/* Details */}
                <div className="flex gap-4 items-start text-left">
                  <div className="w-10 h-10 rounded-full bg-[var(--danger-light)] text-[var(--danger)] flex items-center justify-center shrink-0">
                    <Flag size={20} />
                  </div>
                  <div>
                    <span className="badge badge-danger text-[0.65rem]">FLAGGED AS SPAM</span>
                    <h3 className="text-[1.05rem] mt-1 mb-0.5">
                      <Link to={`/room/${item.id}`} className="text-[var(--text-main)]">{item.title}</Link>
                    </h3>
                    <div className="text-[0.8rem] text-[var(--text-muted)]">
                      📍 {item.location} • Owner: {item.landlord.name}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 items-center justify-end">
                  <button
                    onClick={() => updateListingStatus(item.id, 'verified')}
                    className="btn btn-outline btn-sm flex gap-1 border-[var(--border-color)]"
                  >
                    <CheckCircle size={14} /> Clear Flag (Approve)
                  </button>
                  <button
                    onClick={() => updateListingStatus(item.id, 'pending')}
                    className="btn btn-primary btn-sm flex gap-1 bg-[var(--danger)]"
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
      {activeTab === 'users' && (
        <div className="card overflow-hidden border border-[var(--border-color)] p-0">
          <table className="w-full border-collapse text-[0.9rem] poi-table">
            <thead>
              <tr className="bg-[var(--bg-app)] border-b border-[var(--border-color)] text-left">
                <th className="px-4 py-3">User details</th>
                <th className="px-4 py-3">Email ID</th>
                <th className="px-4 py-3">Account Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map(user => (
                <tr key={user.id} className="border-b border-[var(--border-color)]">
                  <td className="px-4 py-3 font-semibold">{user.name}</td>
                  <td className="px-4 py-3 text-[var(--text-light)]">{user.email}</td>
                  <td className="px-4 py-3 font-bold text-[var(--primary)]">{user.role}</td>
                  <td className="px-4 py-3">
                    {user.status === 'verified' && <span className="badge badge-secondary">Verified Host</span>}
                    {user.status === 'pending' && <span className="badge badge-accent">Verification Pending</span>}
                    {user.status === 'active' && <span className="badge badge-primary">Active</span>}
                    {user.status === 'banned' && <span className="badge badge-danger">Suspended</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {user.role === 'Landlord' && user.status === 'pending' && (
                        <button
                          onClick={() => handleUserVerify(user.id)}
                          className="btn btn-outline btn-sm px-2 py-1 text-[0.75rem]"
                        >
                          <UserCheck size={12} /> Verify
                        </button>
                      )}
                      {user.status !== 'banned' && (
                        <button
                          onClick={() => handleUserBan(user.id)}
                          className="btn btn-outline btn-sm px-2 py-1 text-[0.75rem] text-[var(--danger)] border-[var(--border-color)]"
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
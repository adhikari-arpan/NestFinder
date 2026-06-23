import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
import { 
  Home, 
  Map, 
  Sparkles, 
  Bell, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  PlusCircle, 
  Menu, 
  X, 
  ShieldAlert,
  ChevronDown,
  Plus
} from 'lucide-react';

export const Navbar = () => {
  const { 
    currentUser, 
    loginUser, 
    logoutUser, 
    theme, 
    toggleTheme, 
    notifications,
    setNotifications
  } = useContext(AppContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();

  const unreadNotifs = notifications.filter(n => !n.read);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const isActive = (path) => location.pathname === path;

  // ── Determine if the current user is a guest ──
  const isGuest = !currentUser;
  const isAdmin = currentUser?.role === 'admin';
  const isLandlord = currentUser?.role === 'landlord';
  const isTenant = currentUser?.role === 'tenant';

  return (
    <nav className="glass sticky-nav" style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000, 
      borderBottom: '1px solid var(--border-color)',
      padding: '0.75rem 0',
      transition: 'background var(--transition-normal)'
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'relative'
      }}>
        {/* ── Logo ── */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.4rem', fontFamily: 'var(--font-display)', color: 'var(--primary)' }}>
          <Home style={{ fill: 'var(--primary)', color: '#ffffff' }} size={24} />
          <span>Nest<span style={{ color: 'var(--text-main)' }}>Finder</span></span>
        </Link>

        {/* ── Desktop Navigation Links ── */}
        <div style={{ display: 'none', md: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`}>Find Rooms</Link>

          {/* AI Recommendations — only for tenants (not admin) */}
          {isTenant && (
            <Link to="/ai-recommend" className={`nav-link ${isActive('/ai-recommend') ? 'active' : ''}`}>
              <Sparkles size={16} style={{ marginRight: '4px', verticalAlign: 'middle', display: 'inline', color: 'var(--accent)' }} />
              AI Recommendations
            </Link>
          )}

          {/* My Dashboard — tenant only */}
          {isTenant && (
            <Link to="/dashboard/tenant" className={`nav-link ${isActive('/dashboard/tenant') ? 'active' : ''}`}>My Dashboard</Link>
          )}

          {/* Landlord Hub — landlord only */}
          {isLandlord && (
            <Link to="/dashboard/landlord" className={`nav-link ${isActive('/dashboard/landlord') ? 'active' : ''}`}>Landlord Hub</Link>
          )}

          {/* Admin link */}
          {isAdmin && (
            <Link to="/dashboard/admin" className={`nav-link ${isActive('/dashboard/admin') ? 'active' : ''}`}>
              <ShieldAlert size={16} style={{ display: 'inline', marginRight: '4px' }} />
              Admin
            </Link>
          )}
        </div>

        {/* ── Right Action Area ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          {/* ── Theme toggle — always visible ── */}
          <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* ── Notifications Bell — only for logged-in users (not guests) ── */}
          {!isGuest && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(!notifOpen)} className="icon-btn" aria-label="Notifications">
                <Bell size={20} />
                {/* Unread badge */}
                {unreadNotifs.length > 0 && (
                  <span className="notif-badge">{unreadNotifs.length}</span>
                )}
              </button>

              {notifOpen && (
                <div className="card shadow-xl notification-dropdown">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: '0.95rem' }}>Notifications</h4>
                    {unreadNotifs.length > 0 && (
                      <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <p style={{ textAlign: 'center', fontSize: '0.85rem', padding: '1rem' }}>No notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.message}</div>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-light)' }}>
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Authenticated user UI ── */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Welcome text for all logged-in users */}
              <span className="welcome-nav-text" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                Welcome, <strong style={{ color: 'var(--primary)' }}>{currentUser.name}</strong>
              </span>

              {/* Landlord: eye-catching Add Room Listing button */}
              {isLandlord && (
                <Link 
                  to="/dashboard/landlord?action=post" 
                  className="add-listing-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                    color: '#ffffff',
                    padding: '0.5rem 1.1rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-sans)',
                    textDecoration: 'none',
                    boxShadow: '0 3px 15px rgba(99,102,241,0.35), 0 0 0 0 rgba(16,185,129,0.3)',
                    transition: 'all 0.25s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span className="btn-text">Add Room Listing</span>
                </Link>
              )}

              {/* Avatar link to dashboard */}
              <Link to={
                isTenant ? '/dashboard/tenant' 
                : isLandlord ? '/dashboard/landlord' 
                : '/dashboard/admin'
              }>
                <img 
                  src={currentUser.avatar} 
                  alt="avatar" 
                  style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }} 
                />
              </Link>
            </div>
          ) : (
            /* ── Guest: Sign In CTA ── */
            <Link to="/auth" className="btn btn-primary btn-sm">Sign In</Link>
          )}

          {/* ── Mobile Menu Toggle ── */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-toggle icon-btn">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* ── Mobile Navigation Dropdown ── */}
        {mobileMenuOpen && (
          <div className="mobile-menu glass animate-fade-in">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/search" onClick={() => setMobileMenuOpen(false)}>Find Rooms</Link>
            {isTenant && <Link to="/ai-recommend" onClick={() => setMobileMenuOpen(false)}>AI Match Finder</Link>}
            {isTenant && <Link to="/dashboard/tenant" onClick={() => setMobileMenuOpen(false)}>My Dashboard</Link>}
            {isLandlord && <Link to="/dashboard/landlord" onClick={() => setMobileMenuOpen(false)}>Landlord Hub</Link>}
            {isAdmin && <Link to="/dashboard/admin" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>}
            {isGuest && <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>}
          </div>
        )}
      </div>

      {/* ── Component Styles ── */}
      <style>{`
        .desktop-links {
          display: flex;
        }
        .nav-link {
          font-weight: 500;
          font-size: 0.95rem;
          color: var(--text-muted);
          position: relative;
          padding: 0.25rem 0;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--primary);
        }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--primary);
          border-radius: var(--radius-full);
        }
        .icon-btn {
          background: none;
          border: none;
          color: var(--text-main);
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }
        .icon-btn:hover {
          background-color: var(--border-color);
          color: var(--primary);
        }
        .notif-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background-color: var(--danger);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-card);
        }
        .notification-dropdown {
          position: absolute;
          top: 130%;
          right: -50px;
          width: 320px;
          max-height: 400px;
          overflow-y: auto;
          z-index: 1010;
          padding: 1rem;
          border-color: var(--border-color);
        }
        .notif-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .notif-item {
          padding: 0.6rem;
          border-radius: var(--radius-md);
          border-left: 3px solid transparent;
          transition: background-color var(--transition-fast);
        }
        .notif-item.unread {
          background-color: var(--primary-light);
          border-left-color: var(--primary);
        }
        .notif-item.read {
          background-color: transparent;
          border-left-color: var(--border-color);
        }
        .notif-item:hover {
          background-color: var(--bg-app);
        }
        .mobile-toggle {
          display: none;
        }
        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background-color: var(--bg-card);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          margin-top: 0.5rem;
          border: 1px solid var(--border-color);
        }
        .mobile-menu a {
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          font-weight: 500;
        }
        .mobile-menu a:hover {
          background-color: var(--primary-light);
          color: var(--primary);
        }
        .add-listing-btn:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 6px 25px rgba(99,102,241,0.5), 0 0 0 0 rgba(16,185,129,0.4);
        }
        .add-listing-btn:active {
          transform: translateY(0) scale(1);
        }
        @media (max-width: 968px) {
          .desktop-links {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
          .btn-text {
            display: none;
          }
          .welcome-nav-text {
            display: none !important;
          }
          .add-listing-btn {
            padding: 0.5rem !important;
            border-radius: 50% !important;
          }
        }
      `}</style>
    </nav>
  );
};

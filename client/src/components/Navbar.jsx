import React, { useContext, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
import logo from '../assets/NestFinder Logo.png';
import { VerifiedBadge } from './VerifiedBadge';
import {
  Home,
  Sparkles,
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Plus,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

const NOTIF_ICONS = {
  success: { icon: CheckCircle2, className: 'text-emerald-500' },
  warning: { icon: AlertTriangle, className: 'text-amber-500' },
  error: { icon: AlertCircle, className: 'text-[var(--danger)]' },
  info: { icon: Info, className: 'text-[var(--primary)]' },
};

const formatNotifTime = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const Navbar = () => {
  const {
    currentUser,
    loginUser,
    logoutUser,
    theme,
    toggleTheme,
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    clearAllNotifications
  } = useContext(AppContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMounted, setNotifMounted] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifPos, setNotifPos] = useState({ top: 0, right: 0, maxHeight: 400 });
  const bellBtnRef = useRef(null);
  const notifListRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const unreadNotifs = notifications.filter(n => !n.read);

  const isActive = (path) => location.pathname === path;

  const isGuest = !currentUser;
  const isAdmin = currentUser?.role === 'admin';
  const isLandlord = currentUser?.role === 'landlord';
  const isTenant = currentUser?.role === 'tenant';

  const navLinkClass = (path) =>
    `font-medium text-[0.95rem] relative py-1 transition-colors ${isActive(path)
      ? 'text-[var(--primary)] after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[var(--primary)] after:rounded-full'
      : 'text-[var(--text-muted)] hover:text-[var(--primary)]'
    }`;

  const iconBtnClass =
    'bg-transparent border-none text-[var(--text-main)] w-[38px] h-[38px] rounded-[var(--radius-md)] cursor-pointer flex items-center justify-center transition-all hover:bg-[var(--border-color)] hover:text-[var(--primary)]';

  // Compute the bell button's position each time the dropdown opens,
  // so the portal can be placed with fixed coordinates instead of
  // being laid out as a flex sibling inside the navbar. The height is
  // clamped to the space actually left below the bell so the dropdown's
  // own scroll area stays fully on-screen instead of running off the
  // bottom of the viewport.
  const NOTIF_MAX_HEIGHT = 400;
  const NOTIF_VIEWPORT_MARGIN = 16;

  const computeNotifPos = () => {
    if (!bellBtnRef.current) return;
    const rect = bellBtnRef.current.getBoundingClientRect();
    const top = rect.bottom + 8; // 8px gap below the bell, like top-[130%] did
    setNotifPos({
      top,
      right: window.innerWidth - rect.right,
      maxHeight: Math.min(NOTIF_MAX_HEIGHT, window.innerHeight - top - NOTIF_VIEWPORT_MARGIN),
    });
  };

  const openNotifs = () => {
    computeNotifPos();
    setNotifOpen(prev => !prev);
  };

  // Keep the dropdown aligned to the bell on resize/scroll while open,
  // since it's now positioned with fixed coordinates rather than
  // inheriting position from a relative parent.

  // Logout confirmation
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


  useEffect(() => {
    if (!notifOpen) return;
    window.addEventListener('resize', computeNotifPos);
    return () => window.removeEventListener('resize', computeNotifPos);
  }, [notifOpen]);

  // Lock page scroll while the dropdown is open so scrolling always acts on
  // the notification list (via the backdrop's wheel handler below) instead
  // of the page underneath. Restored the moment the dropdown is closed.
  useEffect(() => {
    if (!notifOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [notifOpen]);

  // Keep the dropdown mounted for a moment after close so it can play a
  // fade/scale-out transition instead of vanishing instantly.
  useEffect(() => {
    if (notifOpen) {
      setNotifMounted(true);
      const raf = requestAnimationFrame(() => setNotifVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setNotifVisible(false);
    const timeout = setTimeout(() => setNotifMounted(false), 150);
    return () => clearTimeout(timeout);
  }, [notifOpen]);

  return (
    <nav
      className="glass sticky-nav sticky top-0 z-1000 border-b border-(--border-color) py-3 transition-[background] duration-(--transition-normal)"
    >
      <div className="relative container flex flex-nowrap items-center justify-between">

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src={logo} alt="NestFinder" style={{ height: '40px', width: 'auto' }} />
          <span>Nest<span className="text-(--text-main)">Finder</span></span>
        </Link>

        {/* Desktop Nav Links */}
        {currentUser && (
          <div className="hidden items-center gap-6 md:flex">
            {currentUser.role === 'tenant' && (
              <Link to="/dashboard/tenant" className={navLinkClass('/dashboard/tenant')}>Tenant Hub</Link>
            )}
            {currentUser.role === 'landlord' && (
              <Link to="/dashboard/landlord" className={navLinkClass('/dashboard/landlord')}>Landlord Hub</Link>
            )}
            {currentUser.role === 'admin' && (
              <Link to="/dashboard/admin" className={navLinkClass('/dashboard/admin')}>
                <ShieldAlert size={16} className="mr-1 inline" />
                Admin
              </Link>
            )}
          </div>
        )}

        {/* Right Action Area */}
        <div className="flex items-center gap-3">

          {/* Landlord: Add Room Listing CTA */}
          {isLandlord && (
            <button
              onClick={() => navigate('/dashboard/landlord?action=post')}
              className="btn btn-primary btn-sm hidden items-center gap-1 md:flex"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                color: 'white',
                fontWeight: 700,
                border: 'none',
                padding: '0.85rem 1.6rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 15px rgba(99,102,241,0.35)',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}>
              <Plus size={18} /> Add Room Listing
            </button>
          )}

          {/* Theme Toggle */}
          <button onClick={toggleTheme} className={iconBtnClass} aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* Notifications */}
          {currentUser && (
            <div className="relative">
              <button
                ref={bellBtnRef}
                onClick={openNotifs}
                className={iconBtnClass}
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-(--bg-card) bg-(--danger) text-[0.65rem] font-bold text-white">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {notifMounted && createPortal(
                <>
                  {/* Invisible backdrop: closes on outside click, and
                      redirects scrolling anywhere on screen to the
                      notification list while the dropdown is open */}
                  <div
                    onClick={() => setNotifOpen(false)}
                    onWheel={(e) => {
                      if (notifListRef.current) {
                        notifListRef.current.scrollTop += e.deltaY;
                      }
                    }}
                    style={{ position: 'fixed', inset: 0, zIndex: 1005 }}
                  />

                  <div
                    className={`card flex w-[320px] flex-col overflow-hidden border border-(--border-color) p-0 shadow-xl transition-all duration-150 ease-out ${notifVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                      }`}
                    style={{
                      position: 'fixed',
                      top: notifPos.top,
                      right: notifPos.right,
                      maxHeight: notifPos.maxHeight,
                      zIndex: 1010,
                      transformOrigin: 'top right',
                    }}
                  >
                    <div className="flex shrink-0 items-center justify-between border-b border-(--border-color) p-4 pb-2">
                      <h4 className="text-[0.95rem]">Notifications</h4>
                      <div className="flex items-center gap-3">
                        {unreadNotifs.length > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="cursor-pointer border-none bg-transparent text-[0.75rem] font-semibold text-(--primary) hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="cursor-pointer border-none bg-transparent text-[0.75rem] font-semibold text-(--danger) hover:underline"
                          >
                            Clear all
                          </button>
                        )}
                        <button
                          onClick={() => setNotifOpen(false)}
                          className="flex cursor-pointer items-center justify-center border-none bg-transparent text-(--text-light) hover:text-(--primary)"
                          aria-label="Close notifications"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div ref={notifListRef} className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto p-4 pt-2">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-[0.85rem] text-(--text-muted)">No notifications</p>
                      ) : (
                        notifications.map(n => {
                          const { icon: TypeIcon, className: iconClass } =
                            NOTIF_ICONS[n.type] || NOTIF_ICONS.info;
                          return (
                            <div
                              key={n.id}
                              onClick={() => !n.read && markNotificationAsRead(n.id)}
                              className={`flex items-start gap-2.5 rounded md) border-l-[3px] p-3 transition-colors hover:bg-(--bg-app) ${n.read
                                ? 'cursor-default border-l-(--border-color) bg-transparent'
                                : 'cursor-pointer border-l-(--primary) bg-(--primary-light)'
                                }`}
                            >
                              <TypeIcon size={16} className={`mt-0.5 shrink-0 ${iconClass}`} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="truncate text-[0.85rem] font-semibold">{n.title}</div>
                                  {!n.read && (
                                    <span className="mt-1 size-2 shrink-0 rounded-full bg-(--primary)" />
                                  )}
                                </div>
                                <div className="line-clamp-2 text-[0.75rem] leading-snug text-(--text-muted)">
                                  {n.message}
                                </div>
                                <span className="text-[0.65rem] text-(--text-light)">
                                  {formatNotifTime(n.created_at)}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>,
                document.body
              )}
            </div>
          )}

          {/* User Area */}
          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 text-[0.85rem] font-semibold text-(--text-main) md:inline-flex">
                Welcome, <span className="text-(--primary)">{currentUser.name}</span>
                {isLandlord && <VerifiedBadge isVerified={currentUser.is_verified} />}
              </span>

              {currentUser.role === 'tenant' && (
                <Link
                  to="/ai-recommend"
                  className="btn btn-secondary btn-sm hidden items-center gap-1 md:flex"
                >
                  <Sparkles size={16} />
                  <span>Find Your Match With AI</span>
                </Link>
              )}

              <Link
                to={
                  currentUser.role === 'tenant'
                    ? '/dashboard/tenant'
                    : currentUser.role === 'landlord'
                      ? '/dashboard/landlord'
                      : '/dashboard/admin'
                }
              >

              </Link>

              {/* logout button */}
              {/* <button
                onClick={handleLogout}
                className="hidden md:flex items-center justify-center gap-2 border-none cursor-pointer font-bold text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
                  padding: '0.6rem 1.4rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  minWidth: '110px',
                  paddingLeft: '1rem',
                }}
              >
                <LogOut size={17} style={{ marginLeft: '2px', flexShrink: 0 }} />
                Logout
              </button> */}
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary btn-sm">Sign In</Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`${iconBtnClass} flex md:hidden`}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="glass animate-fade-in absolute inset-x-0 top-full z-50 mt-2 flex flex-col gap-3 rounded-md) border border-(--border-color) bg-(--bg-card) p-4 shadow-(--shadow-lg)">
            {currentUser?.role === 'tenant' && (
              <Link to="/dashboard/tenant" onClick={() => setMobileMenuOpen(false)} className="rounded-sm) px-2 py-1.5 font-medium hover:bg-(--primary-light) hover:text-(--primary)">My Dashboard</Link>
            )}
            {currentUser?.role === 'landlord' && (
              <>
                <Link to="/dashboard/landlord" onClick={() => setMobileMenuOpen(false)} className="rounded-sm) px-2 py-1.5 font-medium hover:bg-(--primary-light) hover:text-(--primary)">Landlord Hub</Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/dashboard/landlord?action=post'); }}
                  className="btn btn-primary btn-sm flex w-fit items-center gap-1"
                >
                  <Plus size={16} /> Add Room Listing
                </button>
              </>
            )}
            {currentUser?.role === 'admin' && (
              <Link to="/dashboard/admin" onClick={() => setMobileMenuOpen(false)} className="rounded-sm)] px-2 py-1.5 font-medium hover:bg-(--primary-light) hover:text-(--primary)">Admin Dashboard</Link>
            )}
            {!currentUser && (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="rounded-sm) px-2 py-1.5 font-medium hover:bg-(--primary-light) hover:text-(--primary)">Sign In</Link>
            )}
          </div>
        )}
      </div>
      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={cancelLogout}
            style={{
              position: 'fixed', inset: 0, zIndex: 2000,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Popup Card */}
          <div style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2001,
            width: '100%', maxWidth: '380px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 2rem 1.75rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
            textAlign: 'center',
          }}>
            {/* Icon */}
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <LogOut size={22} style={{ color: 'var(--primary)' }} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Are you sure you want to Logout from NestFinder?
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              You can sign back in anytime.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
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
                  flex: 1, border: 'none', borderRadius: 'var(--radius-md)',
                  padding: '0.75rem', cursor: 'pointer', fontWeight: 700,
                  fontSize: '0.9rem', color: 'white',
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
    </nav>
  );
};
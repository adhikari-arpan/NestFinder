import React, { useContext, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
import logo from '../assets/NestFinder Logo.png';
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifPos, setNotifPos] = useState({ top: 0, right: 0 });
  const bellBtnRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const unreadNotifs = notifications.filter(n => !n.read);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

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
  // being laid out as a flex sibling inside the navbar.
  const openNotifs = () => {
    if (bellBtnRef.current) {
      const rect = bellBtnRef.current.getBoundingClientRect();
      setNotifPos({
        top: rect.bottom + 8, // 8px gap below the bell, like top-[130%] did
        right: window.innerWidth - rect.right,
      });
    }
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
    const updatePos = () => {
      if (bellBtnRef.current) {
        const rect = bellBtnRef.current.getBoundingClientRect();
        setNotifPos({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
    };
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [notifOpen]);

  return (
    <nav
      className="glass sticky-nav sticky top-0 z-[1000] border-b border-[var(--border-color)] py-3 transition-[background] duration-[var(--transition-normal)]"
    >
      <div className="container flex justify-between items-center relative flex-nowrap">

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src={logo} alt="NestFinder" style={{ height: '38px', width: 'auto' }} />
          <span>Nest<span className="text-[var(--text-main)]">Finder</span></span>
        </Link>

        {/* Desktop Nav Links */}
        {currentUser && (
          <div className="hidden md:flex items-center gap-6">
            {currentUser.role === 'tenant' && (
              <Link to="/dashboard/tenant" className={navLinkClass('/dashboard/tenant')}>Tenant Hub</Link>
            )}
            {currentUser.role === 'landlord' && (
              <Link to="/dashboard/landlord" className={navLinkClass('/dashboard/landlord')}>Landlord Hub</Link>
            )}
            {currentUser.role === 'admin' && (
              <Link to="/dashboard/admin" className={navLinkClass('/dashboard/admin')}>
                <ShieldAlert size={16} className="inline mr-1" />
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
              className="btn btn-primary btn-sm hidden md:flex items-center gap-1"
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
                  <span className="absolute top-1 right-1 bg-[var(--danger)] text-white text-[0.65rem] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center border-2 border-[var(--bg-card)]">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {notifOpen && createPortal(
                <>
                  {/* Invisible backdrop to close on outside click */}
                  <div
                    onClick={() => setNotifOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 1005 }}
                  />

                  <div
                    className="card shadow-xl w-[320px] max-h-[400px] overflow-y-auto p-4 border border-[var(--border-color)]"
                    style={{
                      position: 'fixed',
                      top: notifPos.top,
                      right: notifPos.right,
                      zIndex: 1010,
                    }}
                  >
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--border-color)]">
                      <h4 className="text-[0.95rem]">Notifications</h4>
                      <div className="flex items-center gap-3">
                        {unreadNotifs.length > 0 && (
                          <button
                            onClick={markAllRead}
                            className="bg-transparent border-none text-[var(--primary)] text-[0.75rem] cursor-pointer font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                        <button
                          onClick={() => setNotifOpen(false)}
                          className="bg-transparent border-none text-[var(--text-light)] cursor-pointer flex items-center justify-center hover:text-[var(--primary)]"
                          aria-label="Close notifications"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {notifications.length === 0 ? (
                        <p className="text-center text-[0.85rem] p-4">No notifications</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-[var(--radius-md)] border-l-[3px] transition-colors hover:bg-[var(--bg-app)] ${n.read
                                ? 'bg-transparent border-l-[var(--border-color)]'
                                : 'bg-[var(--primary-light)] border-l-[var(--primary)]'
                              }`}
                          >
                            <div className="font-semibold text-[0.85rem]">{n.title}</div>
                            <div className="text-[0.75rem] text-[var(--text-muted)]">{n.message}</div>
                            <span className="text-[0.65rem] text-[var(--text-light)]">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
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
              <span className="hidden md:inline text-[0.85rem] font-semibold text-[var(--text-main)]">
                Welcome, <span className="text-[var(--primary)]">{currentUser.name}</span>
              </span>

              {currentUser.role === 'tenant' && (
                <Link
                  to="/ai-recommend"
                  className="btn btn-secondary btn-sm hidden md:flex items-center gap-1"
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
              <button
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
              </button>
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
          <div className="glass animate-fade-in absolute top-full left-0 right-0 bg-[var(--bg-card)] p-4 flex flex-col gap-3 rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] mt-2 border border-[var(--border-color)] z-50">
            {currentUser?.role === 'tenant' && (
              <Link to="/dashboard/tenant" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 rounded-[var(--radius-sm)] font-medium hover:bg-[var(--primary-light)] hover:text-[var(--primary)]">My Dashboard</Link>
            )}
            {currentUser?.role === 'landlord' && (
              <>
                <Link to="/dashboard/landlord" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 rounded-[var(--radius-sm)] font-medium hover:bg-[var(--primary-light)] hover:text-[var(--primary)]">Landlord Hub</Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/dashboard/landlord?action=post'); }}
                  className="btn btn-primary btn-sm flex items-center gap-1 w-fit"
                >
                  <Plus size={16} /> Add Room Listing
                </button>
              </>
            )}
            {currentUser?.role === 'admin' && (
              <Link to="/dashboard/admin" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 rounded-[var(--radius-sm)] font-medium hover:bg-[var(--primary-light)] hover:text-[var(--primary)]">Admin Dashboard</Link>
            )}
            {!currentUser && (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="px-2 py-1.5 rounded-[var(--radius-sm)] font-medium hover:bg-[var(--primary-light)] hover:text-[var(--primary)]">Sign In</Link>
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
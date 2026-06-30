import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
import logo from '../assests/NestFinder Logo.png';
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
    `font-medium text-[0.95rem] relative py-1 transition-colors ${
      isActive(path)
        ? 'text-[var(--primary)] after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-[var(--primary)] after:rounded-full'
        : 'text-[var(--text-muted)] hover:text-[var(--primary)]'
    }`;

  const iconBtnClass =
    'bg-transparent border-none text-[var(--text-main)] w-[38px] h-[38px] rounded-[var(--radius-md)] cursor-pointer flex items-center justify-center transition-all hover:bg-[var(--border-color)] hover:text-[var(--primary)]';

  return (
    <nav
      className="glass sticky-nav sticky top-0 z-[1000] border-b border-[var(--border-color)] py-3 transition-[background] duration-[var(--transition-normal)]"
    >
      <div className="container flex justify-between items-center relative">

        {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src={logo} alt="NestFinder" style={{ height: '38px', width: 'auto' }} />
          <span>Nest<span className="text-[var(--text-main)]">Finder</span></span>
        </Link>

        {/* Desktop Nav Links */}
        {currentUser && (
          <div className="hidden md:flex items-center gap-6">
            {!isLandlord && (
              <>
                <Link to="/" className={navLinkClass('/')}>Home</Link>
                <Link to="/search" className={navLinkClass('/search')}>Find Rooms</Link>
                <Link to="/ai-recommend" className={navLinkClass('/ai-recommend')}>
                  <Sparkles size={16} className="inline mr-1 align-middle text-[var(--accent)]" />
                  AI Recommendations
                </Link>
              </>
            )}
            {currentUser.role === 'tenant' && (
              <Link to="/dashboard/tenant" className={navLinkClass('/dashboard/tenant')}>My Dashboard</Link>
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
              <button onClick={() => setNotifOpen(!notifOpen)} className={iconBtnClass} aria-label="Notifications">
                <Bell size={20} />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 bg-[var(--danger)] text-white text-[0.65rem] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center border-2 border-[var(--bg-card)]">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="card shadow-xl absolute top-[130%] right-[-50px] w-[320px] max-h-[400px] overflow-y-auto z-[1010] p-4 border border-[var(--border-color)]">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--border-color)]">
                    <h4 className="text-[0.95rem]">Notifications</h4>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={markAllRead}
                        className="bg-transparent border-none text-[var(--primary)] text-[0.75rem] cursor-pointer font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {notifications.length === 0 ? (
                      <p className="text-center text-[0.85rem] p-4">No notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-[var(--radius-md)] border-l-[3px] transition-colors hover:bg-[var(--bg-app)] ${
                            n.read
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
                  <span>Find Match</span>
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
                <img
                  src={currentUser.avatar}
                  alt="avatar"
                  className="w-9 h-9 rounded-full border-2 border-[var(--primary)] object-cover"
                />
              </Link>
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
            {!isLandlord && [
              { to: '/', label: 'Home' },
              { to: '/search', label: 'Find Rooms' },
              { to: '/ai-recommend', label: 'AI Match Finder' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-1.5 rounded-[var(--radius-sm)] font-medium hover:bg-[var(--primary-light)] hover:text-[var(--primary)]"
              >
                {label}
              </Link>
            ))}
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
    </nav>
  );
};
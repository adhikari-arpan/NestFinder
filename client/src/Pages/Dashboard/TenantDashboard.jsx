import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from "../../Context/AppContext";
import { RoomCard } from '../../components/RoomCard';
import { MapContainer } from '../../components/MapContainer';
import logo from '../../assets/NestFinder Logo.png';
import {
  Heart, Sparkles, MessageSquare, CheckCircle, Clock,
  ArrowRight, User, Image as ImageIcon, Trash2, LogOut, X
} from 'lucide-react';

const RoomCarousel = ({ listings }) => {
  const [current, setCurrent] = useState(0);

  const images = listings
    .filter(l => l.images?.length > 0)
    .flatMap(l => l.images.map(img => ({ url: img, title: l.title, location: l.location, price: l.price })));

  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  const img = images[current];

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '220px',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      <img
        key={current}
        src={img.url}
        alt={img.title}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          animation: 'carouselFade 0.6s ease-in-out',
        }}
      />

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '1rem 1.25rem',
        background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
        color: 'white',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      }}>
        <div>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {img.title}
          </p>
          <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.85 }}>📍 {img.location}</p>
        </div>
        <span style={{
          fontSize: '0.8rem', fontWeight: 800,
          background: 'rgba(99,102,241,0.9)',
          padding: '0.2rem 0.6rem', borderRadius: '6px',
        }}>
          Rs. {img.price?.toLocaleString()}/mo
        </span>
      </div>

      <div style={{
        position: 'absolute', top: '10px', right: '12px',
        display: 'flex', gap: '5px',
      }}>
        {images.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{
            width: i === current ? '18px' : '6px',
            height: '6px',
            borderRadius: '999px',
            background: i === current ? 'white' : 'rgba(255,255,255,0.45)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      <style>{`
        @keyframes carouselFade {
          from { opacity: 0; transform: scale(1.02); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export const TenantDashboard = () => {
  const {
    currentUser,
    logoutUser,
    savedListings,
    inquiries,
    listings,
    tenantPreferences,
    calculateRecommendationScore
  } = useContext(AppContext);

  const navigate = useNavigate();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeListingId, setActiveListingId] = useState(null);
  const [highlightListingId, setHighlightListingId] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // was missing

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else if (currentUser.role !== 'tenant') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const bookmarkedRooms = listings.filter(l => savedListings.includes(l.id));

  const tenantInquiries = inquiries.filter(inq =>
    inq.tenantEmail?.toLowerCase() === currentUser?.email?.toLowerCase()
  );

  const handleMarkerClick = (listingId) => {
    setActiveListingId(listingId);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logoutUser();
    navigate('/'); // redirect to home page after logout
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  if (!currentUser) return null;

  return (
    <div className="container animate-fade-in py-8 px-6 pb-20 tenant-dashboard">

      {/* 1. Welcome Banner with Profile */}
      <div className="welcome-banner-redesign animate-fade-in">
        <div>
          <img src={logo} alt="NestFinder" style={{ height: '70px', width: 'auto', marginBottom: '1rem' }} />
          <h2 className="text-[1.8rem] font-extrabold text-primary mb-2">
            Welcome, {currentUser?.name}!
          </h2>
          <p className="text-[1.1rem] font-bold text-text-main m-0">
            Let your search begin
          </p>
        </div>

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
          <button
            className="btn btn-ghost p-2"
            onClick={() => setProfileMenuOpen(false)}
            aria-label="Close menu"
          >
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
          <div className="profile-menu-item text-danger border-[rgba(239,68,68,0.2)] hover:bg-danger-light hover:border-danger hover:text-danger" onClick={() => alert('Delete Profile Picture functionality coming soon!')}>
            <Trash2 size={18} /> Delete Profile Picture
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-border-color">
          <button
            className="btn btn-primary w-full flex justify-center items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Logout Confirmation Popup - portaled to body, project-wide overlay pattern */}
      {showLogoutConfirm && createPortal(
        <>
          <div
            onClick={cancelLogout}
            style={{
              position: 'fixed', inset: 0, zIndex: 2000,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(4px)',
            }}
          />
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

      {/* 2. AI Match Horizontal CTA */}
      <div className="ai-cta-horizontal">
        <Sparkles size={48} className="text-primary" />
        <div>
          <h3 className="text-[1.8rem] font-extrabold text-text-main m-0 leading-tight">
            Let's refine your room search with the help of our AI
          </h3>
          <p className="text-[1rem] text-text-muted mt-2 mb-0">
            Find the perfect room tailored exactly to your preferences.
          </p>
        </div>
        <button
          className="glow-btn btn-lg mt-2 rounded-[var(--radius-full)] px-8 font-bold text-[1.1rem]"
          onClick={() => navigate('/ai-recommend')}
        >
          Find Your Match with AI
        </button>
      </div>

      {/* 3. Favorites Section (Full Width) */}
      <div className="favorites-panel w-full">
        <h3 className="text-[1.4rem] font-bold flex items-center gap-2 mb-2">
          <Heart size={24} className="text-danger fill-danger" /> Your Favourites
        </h3>

        {bookmarkedRooms.length > 0 ? (
          <div className="favorites-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {bookmarkedRooms.map(room => (
              <RoomCard key={room.id} room={room} score={calculateRecommendationScore(room, tenantPreferences)} />
            ))}
          </div>
        ) : (
          <div className="empty-favorites">
            <Heart size={48} className="text-border-color mb-3" />
            <p className="font-medium text-[1.1rem]">No favourites yet</p>
            <p className="text-[0.9rem] max-w-[250px] mt-2 text-center">
              Your favourite rooms will be visible here once you save them.
            </p>
          </div>
        )}
      </div>

      {/* 4. Your Inquiries Section */}
      <div className="favorites-panel w-full">
        <h3 className="text-[1.4rem] font-bold flex items-center gap-2 mb-2">
          <MessageSquare size={24} className="text-primary" /> Your Inquiries
        </h3>

        {tenantInquiries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
            {tenantInquiries.map(inq => (
              <div key={inq.id} className="inquiry-card">
                <div className="flex justify-between items-start">
                  <strong className="text-[1rem] text-primary">{inq.listings?.title || 'Unknown Room'}</strong>
                  <span className="text-[0.8rem] text-text-light">{new Date(inq.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-[0.9rem] text-text-main m-0 mt-2">"{inq.message}"</p>

                {inq.status === 'replied' ? (
                  <div className="inquiry-reply mt-3">
                    <strong className="block text-[0.8rem] text-primary mb-1">Landlord Reply:</strong>
                    {inq.reply_text}
                  </div>
                ) : (
                  <div className="text-[0.8rem] text-accent mt-3 flex items-center gap-1">
                    <Clock size={14} /> Pending landlord response
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-favorites" style={{ padding: '3rem 2rem' }}>
            <MessageSquare size={48} className="text-border-color mb-3" />
            <p className="font-medium text-[1.1rem]">No inquiries yet</p>
            <p className="text-[0.9rem] max-w-[250px] mt-2 text-center">
              You haven't made any inquiries yet.
            </p>
          </div>
        )}
      </div>

      {/* 5. Full-width Map Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[1.4rem] font-bold flex items-center gap-2">
            🗺️ All Available Rooms in Map View
          </h3>
          <span className="badge badge-secondary" style={{ textTransform: 'none' }}>
            Click pins to review
          </span>
        </div>

        <div className="map-section-full relative">
          <div className="map-badge-helper absolute top-[15px] right-[15px] z-[999]">
            🗺️ Map Discovery Mode
          </div>

          <MapContainer
            listings={listings}
            activeListingId={activeListingId}
            highlightListingId={highlightListingId}
            onMarkerClick={handleMarkerClick}
            currentCenter={mapCenter}
          />
        </div>
      </div>

      {/* 6. All Available Rooms (Carousel Section) */}
      <div className="mt-8">
        <div className="carousel-section" style={{ marginTop: 0 }}>
          <div className="carousel-container">
            <div className="flex-1">
              <RoomCarousel listings={listings} />
            </div>
            <div className="glowing-arrow" onClick={() => navigate('/rooms')}>
              <ArrowRight size={24} />
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/rooms')}
            style={{ whiteSpace: 'nowrap' }}
          >
            View All Rooms →
          </button>
        </div>
      </div>

    </div>
  );
};
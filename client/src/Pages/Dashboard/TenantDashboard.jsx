import React, { useState, useEffect, useContext } from 'react';
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

  // Collect all room images from listings
  const images = listings
    .filter(l => l.images?.length > 0)
    .flatMap(l => l.images.map(img => ({ url: img, title: l.title, location: l.location, price: l.price })));

  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000); // changes every 3 seconds
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
      {/* Sliding image */}
      <img
        key={current}
        src={img.url}
        alt={img.title}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          animation: 'carouselFade 0.6s ease-in-out',
        }}
      />

      {/* Blur overlay at bottom with room info */}
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

      {/* Dot indicators */}
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

  // if not logged in or not a tenant, redirect to auth page
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else if (currentUser.role !== 'tenant') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const bookmarkedRooms = listings.filter(l => savedListings.includes(l.id));
  
  // Filter inquiries for this tenant
  const tenantInquiries = inquiries.filter(inq =>
    inq.tenantEmail?.toLowerCase() === currentUser?.email?.toLowerCase()
  );

  const handleMarkerClick = (listingId) => {
    setActiveListingId(listingId);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
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
              <User size={32} className="text-primary" />
            )}
          </div>
          <span className="text-[0.75rem] font-bold text-text-muted">Your Profile</span>
        </div>
      </div>

      {/* Profile Overlay Panel */}
      {profileMenuOpen && (
        <div className="profile-overlay-backdrop" onClick={() => setProfileMenuOpen(false)} />
      )}
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

        <div className="mb-6">
          <h4 className="text-[1rem] font-bold mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-primary" /> Your Inquiries
          </h4>
          
          <div className="flex flex-col gap-3">
            {tenantInquiries.length === 0 ? (
              <div className="text-center p-4 text-[0.85rem] text-text-muted border border-border-color rounded-[var(--radius-md)] bg-bg-app">
                You haven't made any inquiries yet.
              </div>
            ) : (
              tenantInquiries.map(inq => (
                <div key={inq.id} className="inquiry-card">
                  <div className="flex justify-between items-start">
                    <strong className="text-[0.9rem] text-primary">{inq.listings?.title || 'Unknown Room'}</strong>
                    <span className="text-[0.7rem] text-text-light">{new Date(inq.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[0.85rem] text-text-main m-0 mt-1">"{inq.message}"</p>
                  
                  {inq.status === 'replied' ? (
                    <div className="inquiry-reply">
                      <strong className="block text-[0.75rem] text-primary mb-1">Landlord Reply:</strong>
                      {inq.reply_text}
                    </div>
                  ) : (
                    <div className="text-[0.75rem] text-accent mt-2 flex items-center gap-1">
                      <Clock size={12} /> Pending landlord response
                    </div>
                  )}
                </div>
              ))
            )}
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

      {/* 2. Room Carousel Section */}
      <div className="carousel-section">
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

      {/* 3. Favorites + AI Section */}
      <div className="favorites-ai-section">
        {/* Left: Favorites */}
        <div className="favorites-panel">
          <h3 className="text-[1.2rem] font-bold flex items-center gap-2 mb-2">
            <Heart size={20} className="text-danger fill-danger" /> Your Favourites
          </h3>
          
          {bookmarkedRooms.length > 0 ? (
            <div className="favorites-grid">
              {bookmarkedRooms.map(room => (
                <RoomCard key={room.id} room={room} score={calculateRecommendationScore(room, tenantPreferences)} />
              ))}
            </div>
          ) : (
            <div className="empty-favorites">
              <Heart size={48} className="text-border-color mb-3" />
              <p className="font-medium text-[1.1rem]">No favourites yet</p>
              <p className="text-[0.9rem] max-w-[250px] mt-2">
                Your favourite rooms will be visible here once you save them.
              </p>
            </div>
          )}
        </div>

        {/* Right: AI Match */}
        <div className="ai-cta-panel">
          <Sparkles size={48} className="text-primary" />
          <h3 className="text-[1.5rem] font-extrabold text-text-main m-0 leading-tight">
            Let's refine your search with our AI
          </h3>
          <p className="text-[0.95rem] text-text-muted m-0">
            Find the perfect room tailored exactly to your preferences.
          </p>
          <button 
            className="glow-btn btn-lg mt-2 rounded-[var(--radius-full)] px-8 font-bold text-[1.1rem]"
            onClick={() => navigate('/ai-recommend')}
          >
            Find Your Match with AI
          </button>
        </div>
      </div>

      {/* 4. Full-width Map Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[1.2rem] font-bold flex items-center gap-2">
            🗺️ Use Map to Choose Place
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

    </div>
  );
};

export default TenantDashboard;

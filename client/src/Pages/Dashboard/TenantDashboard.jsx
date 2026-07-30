import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from "../../Context/AppContext";
import { RoomCard } from '../../components/RoomCard';
import { MapContainer } from '../../components/MapContainer';
import { DashboardHeader } from '../../components/DashboardHeader';
import logo from '../../assets/NestFinder Logo.png';
import {
  Heart, Sparkles, MessageSquare, Clock, ArrowRight
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
    savedListings,
    inquiries,
    listings,
    tenantPreferences,
    calculateRecommendationScore
  } = useContext(AppContext);

  const navigate = useNavigate();

  const [activeListingId, setActiveListingId] = useState(null);
  const [highlightListingId, setHighlightListingId] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

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

  if (!currentUser) return null;

  return (
    <div className="container animate-fade-in py-8 px-6 pb-20 tenant-dashboard">

      {/* 1. Welcome Banner with Profile */}
      <DashboardHeader className="welcome-banner-redesign animate-fade-in">
        <div>
          <img src={logo} alt="NestFinder" style={{ height: '70px', width: 'auto', marginBottom: '1rem' }} />
          <h2 className="text-[1.8rem] font-extrabold text-primary mb-2">
            Welcome, {currentUser?.name}!
          </h2>
          <p className="text-[1.1rem] font-bold text-text-main m-0">
            Let your search begin
          </p>
        </div>
      </DashboardHeader>

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
          className="glow-btn btn-lg mt-2 rounded-(--radius-full) px-8 font-bold text-[1.1rem]"
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
            <p className="text-[0.9rem] max-w-62.5 mt-2 text-center">
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
            <p className="text-[0.9rem] max-w-62.5 mt-2 text-center">
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
          <div className="map-badge-helper absolute top-3.75 right-3.75 z-999">
            🗺️ Map Discovery Mode
          </div>

          <MapContainer
            listings={listings}
            activeListingId={activeListingId}
            highlightListingId={highlightListingId}
            onMarkerClick={handleMarkerClick}
            currentCenter={mapCenter}
            radius={tenantPreferences.radius || 1000}
            college={tenantPreferences.poiCollege}
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
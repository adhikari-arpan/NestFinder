import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '..D:\NestFinder\NestFinder\client\src\Context\AppContext.jsx';
import { MapPin, Heart, Wifi, Car, Sofa, Flame, CheckCircle, Sparkles, User } from 'lucide-react';

export const RoomCard = ({ room, score }) => {
  const { savedListings, toggleSaveListing } = useContext(AppContext);
  const isSaved = savedListings.includes(room.id);

  // Helper to render relevant amenity icons
  const renderAmenityBadge = (amenity) => {
    switch (amenity) {
      case 'WiFi':
        return <Wifi size={14} title="WiFi" />;
      case 'Parking':
        return <Car size={14} title="Parking" />;
      case 'Furnished':
        return <Sofa size={14} title="Furnished" />;
      case 'Hot Water':
        return <Flame size={14} title="Hot Water" />;
      default:
        return null;
    }
  };

  // Check if listing has custom match score (from AI questionnaire search)
  const displayScore = score !== undefined ? score : room.matchScore;

  return (
    <div className="card card-hover room-card animate-fade-in" style={{ padding: 0 }}>
      {/* Top Media Section */}
      <div className="card-media" style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img 
          src={room.images[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"} 
          alt={room.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-normal)' }}
          className="room-img"
        />
        
        {/* Floating Badges */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 5 }}>
          {room.status === 'verified' && (
            <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backdropFilter: 'blur(4px)', background: 'rgba(16, 185, 129, 0.9)', color: 'white' }}>
              <CheckCircle size={10} /> Verified
            </span>
          )}
          {room.featured && (
            <span className="badge badge-accent" style={{ backdropFilter: 'blur(4px)', background: 'rgba(245, 158, 11, 0.9)', color: 'white' }}>
              Popular
            </span>
          )}
        </div>

        {/* AI Recommendation Score Overlay */}
        {displayScore !== undefined && displayScore > 60 && (
          <div style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            zIndex: 5,
            background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
            color: 'white',
            fontWeight: 800,
            fontSize: '0.75rem',
            padding: '0.3rem 0.6rem',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)'
          }}>
            <Sparkles size={12} style={{ fill: 'white' }} />
            <span>{displayScore}% AI Match</span>
          </div>
        )}

        {/* Save Toggle */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaveListing(room.id);
          }}
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            zIndex: 5,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            transition: 'all var(--transition-fast)'
          }}
          aria-label="Save Room"
        >
          <Heart size={18} style={{ 
            fill: isSaved ? 'var(--danger)' : 'none', 
            color: isSaved ? 'var(--danger)' : '#475569',
            transition: 'all var(--transition-fast)'
          }} />
        </button>
      </div>

      {/* Details Container */}
      <div style={{ padding: '1.25rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        
        {/* Type & Sharing row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {room.sharing} • {room.type}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Rs. {room.price.toLocaleString('en-IN')}<span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span>
          </span>
        </div>

        {/* Room Title */}
        <h3 style={{ 
          fontSize: '1.05rem', 
          fontWeight: 700, 
          margin: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: 'var(--text-main)'
        }}>
          <Link to={`/room/${room.id}`} className="title-link">{room.title}</Link>
        </h3>

        {/* Address */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <MapPin size={14} style={{ color: 'var(--primary)' }} />
          <span>{room.location}</span>
        </div>

        {/* Brief POI College proximity */}
        {room.nearbyPOIs && room.nearbyPOIs[0] && (
          <div style={{ 
            fontSize: '0.8rem', 
            background: 'var(--bg-app)', 
            padding: '0.4rem 0.6rem', 
            borderRadius: 'var(--radius-sm)', 
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
              🎓 {room.nearbyPOIs[0].name}
            </span>
            <strong style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>
              {room.nearbyPOIs[0].distance >= 1000 
                ? `${(room.nearbyPOIs[0].distance/1000).toFixed(1)}km` 
                : `${room.nearbyPOIs[0].distance}m`
              }
            </strong>
          </div>
        )}

        {/* Amenities Row & Card CTA */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '0.75rem',
          marginTop: '0.25rem'
        }}>
          {/* Key icons */}
          <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-light)' }}>
            {room.amenities.slice(0, 4).map((amenity, i) => (
              <span key={i} className="card-amenity-icon" style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--bg-app)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                {renderAmenityBadge(amenity)}
              </span>
            ))}
          </div>

          <Link to={`/room/${room.id}`} className="btn btn-outline btn-sm" style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
            View Details
          </Link>
        </div>

      </div>

      <style>{`
        .room-card {
          border-radius: var(--radius-lg);
          transition: all var(--transition-normal);
        }
        .room-card:hover .room-img {
          transform: scale(1.05);
        }
        .room-card:hover .save-btn {
          background-color: #ffffff !important;
        }
        .save-btn:hover {
          transform: scale(1.1);
        }
        .title-link:hover {
          color: var(--primary);
        }
        .card-media img {
          user-select: none;
        }
      `}</style>
    </div>
  );
};

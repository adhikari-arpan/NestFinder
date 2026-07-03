import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
import { MapPin, Heart, Wifi, Car, Sofa, Flame, CheckCircle, Sparkles } from 'lucide-react';

export const RoomCard = ({ room, score }) => {
  const { savedListings, toggleSaveListing } = useContext(AppContext);
  const isSaved = savedListings.includes(room.id);

  const renderAmenityBadge = (amenity) => {
    switch (amenity) {
      case 'WiFi':      return <Wifi size={14} title="WiFi" />;
      case 'Parking':   return <Car size={14} title="Parking" />;
      case 'Furnished': return <Sofa size={14} title="Furnished" />;
      case 'Hot Water': return <Flame size={14} title="Hot Water" />;
      default:          return null;
    }
  };

  const displayScore = score !== undefined ? score : room.matchScore;

  return (
    <div className="card card-hover room-card animate-fade-in rounded-[var(--radius-lg)] transition-all duration-[var(--transition-normal)] p-0">

      {/* Media Section */}
      <div className="card-media relative h-[200px] overflow-hidden">
        <img
          src={room.images[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"}
          alt={room.title}
          className="room-img w-full h-full object-cover transition-transform duration-[var(--transition-normal)] select-none group-hover:scale-105"
        />

        {/* Floating Badges — top left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-[5]">
          {room.status === 'verified' && (
            <span className="badge badge-secondary flex items-center gap-1 backdrop-blur-sm" style={{ background: 'rgba(16,185,129,0.9)', color: 'white' }}>
              <CheckCircle size={10} /> Verified
            </span>
          )}
          {room.featured && (
            <span className="badge badge-accent backdrop-blur-sm" style={{ background: 'rgba(245,158,11,0.9)', color: 'white' }}>
              Popular
            </span>
          )}
        </div>

        {/* AI Score — top right */}
        {displayScore !== undefined && displayScore > 60 && (
          <div
            className="absolute top-2.5 right-2.5 z-[5] text-white font-extrabold text-[0.75rem] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-[0_4px_10px_rgba(99,102,241,0.4)]"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)' }}
          >
            <Sparkles size={12} style={{ fill: 'white' }} />
            <span>{displayScore}% AI Match</span>
          </div>
        )}

        {/* Save Button — bottom right */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSaveListing(room.id); }}
          className="absolute bottom-2.5 right-2.5 z-[5] w-9 h-9 rounded-full bg-white/90 border-none flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-[var(--transition-fast)] hover:scale-110"
          aria-label="Save Room"
        >
          <Heart
            size={18}
            style={{
              fill: isSaved ? 'var(--danger)' : 'none',
              color: isSaved ? 'var(--danger)' : '#475569',
              transition: 'all var(--transition-fast)'
            }}
          />
        </button>
      </div>

      {/* Details */}
      <div className="p-5 text-left flex flex-col gap-3">

        {/* Type & Price */}
        <div className="flex justify-between items-center">
          <span className="text-[0.75rem] font-bold text-[var(--primary)] uppercase tracking-[0.05em]">
            {room.sharing} • {room.type}
          </span>
          <span className="text-[0.85rem] font-bold text-[var(--text-main)]">
            Rs. {room.price.toLocaleString('en-IN')}
            <span className="text-[0.75rem] font-medium text-[var(--text-muted)]">/mo</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[1.05rem] font-bold m-0 truncate text-[var(--text-main)]">
          <Link to={`/room/${room.id}`} className="hover:text-[var(--primary)] transition-colors">
            {room.title}
          </Link>
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-[0.85rem] text-[var(--text-muted)]">
          <MapPin size={14} className="text-[var(--primary)]" />
          <span>{room.location}</span>
        </div>

        {/* Nearby POI */}
        {room.nearbyPOIs && room.nearbyPOIs[0] && (
          <div className="text-[0.8rem] bg-[var(--bg-app)] px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[var(--text-muted)] flex items-center justify-between">
            <span className="truncate max-w-[80%]">🎓 {room.nearbyPOIs[0].name}</span>
            <strong className="text-[0.75rem] text-[var(--primary)]">
              {room.nearbyPOIs[0].distance >= 1000
                ? `${(room.nearbyPOIs[0].distance / 1000).toFixed(1)}km`
                : `${room.nearbyPOIs[0].distance}m`}
            </strong>
          </div>
        )}

        {/* Amenities & CTA */}
        <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3 mt-1">
          <div className="flex gap-2 text-[var(--text-light)]">
            {room.amenities.slice(0, 4).map((amenity, i) => (
              <span
                key={i}
                className="w-7 h-7 rounded-full bg-[var(--bg-app)] flex items-center justify-center"
              >
                {renderAmenityBadge(amenity)}
              </span>
            ))}
          </div>
          <Link
            to={`/room/${room.id}`}
            className="btn btn-outline btn-sm px-3 py-1.5 rounded-[var(--radius-sm)]"
          >
            View Details
          </Link>
        </div>

      </div>

      <style>{`
        .room-card:hover .room-img {
          transform: scale(1.05);
        }
        .room-card:hover .save-btn {
          background-color: #ffffff !important;
        }
        .card-media img {
          user-select: none;
        }
      `}</style>
    </div>
  );
};
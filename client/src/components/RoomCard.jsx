import { useContext } from 'react';
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
    <div className="card card-hover room-card animate-fade-in rounded-lg) p-0 transition-all duration-(--transition-normal)">

      {/* Media Section */}
      <div className="card-media relative h-50 overflow-hidden">
        <img
        src={
        (Array.isArray(room.images) ? room.images[0] : room.images) ||
        room.image_url ||
        room.image ||
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
}
          alt={room.title}
          className="room-img size-full object-cover transition-transform duration-(--transition-normal) select-none group-hover:scale-105"
        />

        {/* Floating Badges — top left */}
        <div className="absolute top-2.5 left-2.5 z-5 flex flex-col gap-1">
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
            className="absolute top-2.5 right-2.5 z-5 flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.75rem] font-extrabold text-white shadow-[0_4px_10px_rgba(99,102,241,0.4)]"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)' }}
          >
            <Sparkles size={12} style={{ fill: 'white' }} />
            <span>{displayScore}% AI Match</span>
          </div>
        )}

        {/* Save Button — bottom right */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSaveListing(room.id); }}
          className="absolute right-2.5 bottom-2.5 z-5 flex size-9 cursor-pointer items-center justify-center rounded-full border-none bg-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-(--transition-fast) hover:scale-110"
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
      <div className="flex flex-col gap-3 p-5 text-left">

        {/* Type & Price */}
        <div className="flex items-center justify-between">
          <span className="text-[0.75rem] font-bold tracking-wider text-(--primary) uppercase">
            {room.sharing} • {room.type}
          </span>
          <span className="text-[0.85rem] font-bold text-(--text-main)">
            Rs. {room.price.toLocaleString('en-IN')}
            <span className="text-[0.75rem] font-medium text-(--text-muted)">/mo</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="m-0 truncate text-[1.05rem] font-bold text-(--text-main)">
          <Link to={`/room/${room.id}`} className="transition-colors hover:text-(--primary)">
            {room.title}
          </Link>
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-[0.85rem] text-(--text-muted)">
          <MapPin size={14} className="text-(--primary)" />
          <span>{room.location}</span>
        </div>

        {/* Amenities & CTA */}
        <div className="mt-1 flex items-center justify-between border-t border-(--border-color) pt-3">
          <div className="flex gap-2 text-(--text-light)">
            {room.amenities.slice(0, 4).map((amenity, i) => (
              <span
                key={i}
                className="flex size-7 items-center justify-center rounded-full bg-(--bg-app)"
              >
                {renderAmenityBadge(amenity)}
              </span>
            ))}
          </div>
          <Link
            to={`/room/${room.id}`}
            className="btn btn-outline btn-sm rounded-sm) px-3 py-1.5"
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
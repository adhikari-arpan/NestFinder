import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../Context/AppContext';
import { RoomCard } from '../components/RoomCard';
import { ArrowLeft, Sparkles, Home, MapPin } from 'lucide-react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default marker icon (same fix used in LandlordDashboard)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const AllRooms = () => {
  const { listings, listingsLoading, calculateRecommendationScore, tenantPreferences } = useContext(AppContext);
  const navigate = useNavigate();

  // Development only — remove before final submission
  const verifiedRooms = listings; // shows pending + verified + flagged

  // const verifiedRooms = listings
  //   .filter(l => l.status === 'verified')
  //   .map(l => ({
  //     ...l,
  //     matchScore: calculateRecommendationScore(l, tenantPreferences)
  //   }))
  //   .sort((a, b) => b.matchScore - a.matchScore);

  // Only rooms with valid coordinates get a pin on the map
  const pinnableRooms = verifiedRooms.filter(r => r.latitude && r.longitude);

  // Center the map on the average of all pinned rooms, fallback to Kathmandu valley center
  const mapCenter = pinnableRooms.length > 0
    ? [
        pinnableRooms.reduce((sum, r) => sum + Number(r.latitude), 0) / pinnableRooms.length,
        pinnableRooms.reduce((sum, r) => sum + Number(r.longitude), 0) / pinnableRooms.length,
      ]
    : [27.6850, 85.3200];

  return (
    <div className="animate-fade-in container" style={{ padding: '2.5rem 1.5rem 5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.4rem' }}>
              All Available Rooms
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {listingsLoading
                ? 'Loading listings...'
                : `Showing ${verifiedRooms.length} verified listings across Kathmandu valley`}
            </p>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {listingsLoading ? (
        <div className="card text-center" style={{ padding: '5rem 2rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '3px solid var(--primary-light)',
            borderTopColor: 'var(--primary)',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: 'var(--text-muted)' }}>Fetching rooms from database...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

      ) : verifiedRooms.length === 0 ? (
        /* Empty state */
        <div className="card text-center" style={{ padding: '5rem 2rem' }}>
          <Home size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Rooms Available</h3>
          <p style={{ color: 'var(--text-muted)' }}>No verified listings right now. Check back soon.</p>
        </div>

      ) : (
        /* Two-column layout: rooms on the left, sticky map on the right */
        <div className="all-rooms-layout">

          {/* Left: Rooms list */}
          <div className="all-rooms-list">
            {verifiedRooms.map(room => (
              <div key={room.id} style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                  backgroundColor: 'rgba(99,102,241,0.95)',
                  backdropFilter: 'blur(4px)',
                  color: 'white', padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <Sparkles size={10} style={{ fill: 'white' }} />
                  {room.matchScore}% Match
                </div>
                <RoomCard room={room} />
              </div>
            ))}
          </div>

          {/* Right: Sticky map with hover popups */}
          <div className="all-rooms-map-panel">
            <div className="all-rooms-map-sticky">
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)'
              }}>
                <MapPin size={16} style={{ color: 'var(--primary)' }} />
                Room Locations
              </div>

              <div style={{
                height: '600px', borderRadius: 'var(--radius-md)',
                overflow: 'hidden', border: '1px solid var(--border-color)'
              }}>
                <LeafletMap
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  {pinnableRooms.map(room => (
                    <Marker
                      key={room.id}
                      position={[Number(room.latitude), Number(room.longitude)]}
                      eventHandlers={{
                        mouseover: (e) => e.target.openPopup(),
                        mouseout: (e) => e.target.closePopup(),
                        click: () => navigate(`/room/${room.id}`),
                      }}
                    >
                      <Popup>
                        <div style={{ minWidth: '170px' }}>
                          {room.images?.[0] && (
                            <img
                              src={room.images[0]}
                              alt={room.title}
                              style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.4rem' }}
                            />
                          )}
                          <strong style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
                            {room.title}
                          </strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: '0.3rem' }}>
                            📍 {room.location}
                          </span>
                          <span style={{ display: 'block', fontWeight: 700, color: '#6366f1', fontSize: '0.85rem' }}>
                            Rs. {Number(room.price)?.toLocaleString()}/mo
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </LeafletMap>
              </div>
            </div>
          </div>

        </div>
      )}

      <style>{`
        .all-rooms-layout {
          display: flex;
          gap: 1.75rem;
          align-items: flex-start;
        }
        .all-rooms-list {
          flex: 1 1 55%;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          align-content: start;
        }
        .all-rooms-map-panel {
          flex: 1 1 40%;
          max-width: 480px;
        }
        .all-rooms-map-sticky {
          position: sticky;
          top: 1.5rem;
        }
        @media (max-width: 900px) {
          .all-rooms-layout {
            flex-direction: column;
          }
          .all-rooms-map-panel {
            max-width: 100%;
            width: 100%;
          }
          .all-rooms-map-sticky {
            position: static;
          }
        }
      `}</style>
    </div>
  );
};
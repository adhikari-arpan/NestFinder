import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../Context/AppContext';
import { RoomCard } from '../components/RoomCard';
import { PaymentModal } from '../components/PaymentModal';
import { LoadingScreen } from '../components/LoadingScreen';
import { ArrowLeft, Sparkles, Home, MapPin, Lock, Clock, ShieldAlert } from 'lucide-react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapContainer as SelectableMap } from '../components/MapContainer';
import { haversineDistance } from '../utils/geo';
import { RADIUS_OPTIONS } from '../utils/paymentUtils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Settings2 } from "lucide-react";

// Fix Leaflet's default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PRESET_LOCATIONS = [
  { name: "NCIT College", lat: 27.6644, lng: 85.3188 },
  { name: "Kathford College", lat: 27.6636, lng: 85.3195 },
  { name: "Tribhuvan University", lat: 27.68, lng: 85.2895 },
  { name: "Pulchowk Campus", lat: 27.6798, lng: 85.3163 },
  { name: "St. Xavier's College Maitighar", lat: 27.6939, lng: 85.3206 },
  { name: "Apex College Baneshwor", lat: 27.6893, lng: 85.3355 },
  { name: "United Academy Kumaripati", lat: 27.6789, lng: 85.3212 },
  { name: "Kathmandu University", lat: 27.6206, lng: 85.556 },
];

export const AllRooms = () => {
  const {
    listings,
    listingsLoading,
    currentUser,
    paidRadiusAccess,
    getDistancePrice,
    checkDistanceAccess,
  } = useContext(AppContext);

  const navigate = useNavigate();

  const isAccessPaid =
    paidRadiusAccess &&
    paidRadiusAccess.userId === currentUser?.id &&
    paidRadiusAccess.paidUntil > Date.now() &&
    paidRadiusAccess.location;

  const [selectedLocation, setSelectedLocation] = useState(
    paidRadiusAccess?.location || PRESET_LOCATIONS[0]
  );
  const [selectedRadius, setSelectedRadius] = useState(
    paidRadiusAccess?.activeRadius || 1000
  );
  const [showRadiusPicker, setShowRadiusPicker] = useState(false);

  // Filter rooms strictly by user's paid distance radius
  let verifiedRooms = listings;
  if (isAccessPaid && paidRadiusAccess?.location) {
    const loc = paidRadiusAccess.location;
    const rad = paidRadiusAccess.activeRadius;
    verifiedRooms = listings.filter((room) => {
      if (!room.latitude || !room.longitude) return false;
      const dist = haversineDistance(
        loc.lat,
        loc.lng,
        Number(room.latitude),
        Number(room.longitude)
      );
      return dist <= rad;
    });
  }

  // Only rooms with valid coordinates get a pin on the map
  const pinnableRooms = isAccessPaid
    ? verifiedRooms.filter((r) => r.latitude && r.longitude)
    : [];

  const mapCenter = paidRadiusAccess?.location
    ? [paidRadiusAccess.location.lat, paidRadiusAccess.location.lng]
    : [27.685, 85.32];

  const handleUnlockPayment = () => {
    const latStr = selectedLocation?.lat || 27.6644;
    const lngStr = selectedLocation?.lng || 85.3188;
    const nameStr = encodeURIComponent(selectedLocation?.name || "Selected Point");
    const price = getDistancePrice(selectedRadius);
    navigate(
      `/payment?type=distance_radius&radius=${selectedRadius}&amount=${price}&lat=${latStr}&lng=${lngStr}&name=${nameStr}`
    );
  };

  const remainingHours = isAccessPaid
    ? Math.max(0, Math.ceil((paidRadiusAccess.paidUntil - Date.now()) / (1000 * 60 * 60)))
    : 0;

  return (
    <div
      className="animate-fade-in container"
      style={{ padding: "2.5rem 1.5rem 5rem" }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline btn-sm"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            marginBottom: "1.5rem",
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "var(--primary)",
                marginBottom: "0.4rem",
              }}
            >
              All Available Rooms
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              {listingsLoading
                ? "Loading listings..."
                : isAccessPaid
                ? `Showing ${verifiedRooms.length} listings within ${
                    paidRadiusAccess.activeRadius >= 1000
                      ? (paidRadiusAccess.activeRadius / 1000).toFixed(1) + "km"
                      : paidRadiusAccess.activeRadius + "m"
                  } of ${paidRadiusAccess.location.name || "selected location"}`
                : "Distance tier payment required to view rooms for your account"}
            </p>
          </div>
        </div>

        {/* User-Specific Active Paid Access Banner */}
        {isAccessPaid && (
          <div
            style={{
              marginTop: "1.25rem",
              padding: "1rem 1.25rem",
              borderRadius: "12px",
              backgroundColor: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Clock size={20} style={{ color: "#10b981" }} />
              <div>
                <span
                  style={{
                    fontWeight: 700,
                    color: "#10b981",
                    fontSize: "0.95rem",
                  }}
                >
                  Active Paid Radius Access Unlocked ({remainingHours}h remaining)
                </span>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    margin: "0.1rem 0 0",
                  }}
                >
                  Account: <strong>{currentUser?.name || currentUser?.email}</strong> • Location:{" "}
                  <strong>{paidRadiusAccess.location.name || "Custom Point"}</strong> • Radius:{" "}
                  <strong>
                    {paidRadiusAccess.activeRadius >= 1000
                      ? (paidRadiusAccess.activeRadius / 1000).toFixed(1) + "km"
                      : paidRadiusAccess.activeRadius + "m"}
                  </strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowRadiusPicker((prev) => !prev)}
              className="btn btn-outline btn-sm"
              style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Settings2 size={14} /> {showRadiusPicker ? "Close Picker" : "Change Radius Tier / Location"}
            </button>
          </div>
        )}
      </div>

      {/* Inline Radius Picker Modal / Card when toggled or unpaid */}
      {(showRadiusPicker || !isAccessPaid) && (
        <div
          className="card shadow-lg animate-fade-in"
          style={{
            padding: "2rem 1.5rem",
            maxWidth: "720px",
            margin: "0 auto 2.5rem",
            borderRadius: "16px",
            border: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 0.75rem",
              }}
            >
              {isAccessPaid ? <Settings2 size={28} /> : <Lock size={28} />}
            </div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 0.4rem" }}>
              {isAccessPaid ? "Change Target Radius Tier & Location" : "Select Distance Tier to Unlock Rooms"}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
              {isAccessPaid
                ? "Selecting a new location or tighter radius tier requires a new verification payment."
                : "Room access is strictly user-specific and locked per distance radius tier."}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                1. Target Location (College / Workplace):
              </label>
              <select
                value={selectedLocation.name || ""}
                onChange={(e) => {
                  const found = PRESET_LOCATIONS.find((p) => p.name === e.target.value);
                  if (found) setSelectedLocation(found);
                }}
                className="form-input"
                style={{ width: "100%", padding: "0.75rem" }}
              >
                {PRESET_LOCATIONS.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    🎓 {preset.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: "0.82rem", marginBottom: "0.3rem", color: "var(--text-muted)" }}>
                Or select point on map:
              </label>
              <div style={{ height: "200px", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                <SelectableMap
                  selectable
                  onLocationSelect={(lat, lng) => setSelectedLocation({ name: "Custom Pin", lat, lng })}
                  selectedLocation={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : null}
                  selectionRadius={selectedRadius}
                  currentCenter={[selectedLocation.lat, selectedLocation.lng]}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label style={{ fontWeight: 700, fontSize: "0.85rem" }}>2. Distance Radius Tier:</label>
                <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1.1rem" }}>
                  Rs. {getDistancePrice(selectedRadius)}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.5rem" }}>
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setSelectedRadius(opt.val)}
                    style={{
                      padding: "0.65rem 0.4rem",
                      borderRadius: "8px",
                      border: selectedRadius === opt.val ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                      backgroundColor: selectedRadius === opt.val ? "color-mix(in srgb, var(--primary) 12%, transparent)" : "transparent",
                      fontWeight: selectedRadius === opt.val ? 700 : 500,
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      color: "var(--text-main)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleUnlockPayment}
            style={{
              width: "100%",
              padding: "0.9rem",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)",
              color: "white",
              fontWeight: 800,
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: "0 6px 18px rgba(99, 102, 241, 0.3)",
            }}
          >
            <Sparkles size={18} style={{ fill: "white" }} />
            Pay & Unlock Radius Tier (Rs. {getDistancePrice(selectedRadius)})
          </button>
        </div>
      )}

      {/* Loading state */}
      {listingsLoading ? (
        <div className="card text-center" style={{ padding: "5rem 2rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "3px solid var(--primary-light)",
              borderTopColor: "var(--primary)",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "var(--text-muted)" }}>Fetching rooms from database...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : !isAccessPaid ? null : verifiedRooms.length === 0 ? (
        /* Empty state within radius */
        <div className="card text-center" style={{ padding: "5rem 2rem" }}>
          <Home size={48} style={{ color: "var(--text-light)", margin: "0 auto 1rem" }} />
          <h3 style={{ marginBottom: "0.5rem" }}>
            No Rooms Available within{" "}
            {paidRadiusAccess.activeRadius >= 1000
              ? paidRadiusAccess.activeRadius / 1000 + "km"
              : paidRadiusAccess.activeRadius + "m"}
          </h3>
          <p style={{ color: "var(--text-muted)" }}>
            Try selecting a broader radius tier or another target location.
          </p>
        </div>
      ) : (
        /* Two-column layout: rooms on the left, sticky map on the right */
        <div className="all-rooms-layout">
          {/* Left: Rooms list */}
          <div className="all-rooms-list">
            {verifiedRooms.map((room) => (
              <div key={room.id} style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    zIndex: 10,
                    backgroundColor: "rgba(99,102,241,0.95)",
                    backdropFilter: "blur(4px)",
                    color: "white",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <Sparkles size={10} style={{ fill: "white" }} />
                  Within Radius
                </div>
                <RoomCard room={room} />
              </div>
            ))}
          </div>

          {/* Right: Sticky map with hover popups */}
          <div className="all-rooms-map-panel">
            <div className="all-rooms-map-sticky">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginBottom: "0.75rem",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                }}
              >
                <MapPin size={16} style={{ color: "var(--primary)" }} />
                Unlocked Room Locations
              </div>

              <div
                style={{
                  height: "600px",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  border: "1px solid var(--border-color)",
                }}
              >
                <LeafletMap
                  center={mapCenter}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {pinnableRooms.map((room) => (
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
                        <div style={{ minWidth: "170px" }}>
                          {room.images?.[0] && (
                            <img
                              src={room.images[0]}
                              alt={room.title}
                              style={{
                                width: "100%",
                                height: "80px",
                                objectFit: "cover",
                                borderRadius: "6px",
                                marginBottom: "0.4rem",
                              }}
                            />
                          )}
                          <strong
                            style={{
                              display: "block",
                              fontSize: "0.85rem",
                              marginBottom: "0.2rem",
                            }}
                          >
                            {room.title}
                          </strong>
                          <span
                            style={{
                              display: "block",
                              fontSize: "0.75rem",
                              color: "#666",
                              marginBottom: "0.3rem",
                            }}
                          >
                            📍 {room.location}
                          </span>
                          <span
                            style={{
                              display: "block",
                              fontWeight: 700,
                              color: "#6366f1",
                              fontSize: "0.85rem",
                            }}
                          >
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
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { RoomCard } from "../../components/RoomCard";
import { MapContainer } from "../../components/MapContainer";
import { DashboardHeader } from "../../components/DashboardHeader";
import whiteLogo from "../../assets/White_NestFinderLogo.png";
import darkLogo from "../../assets/Dark_NestFinderLogo.png";
import { haversineDistance } from "../../utils/geo";
import { isListingLive } from "../../utils/listingLifecycle";
import { formatDuration } from "../../utils/paymentUtils";
import {
  Heart,
  Sparkles,
  MessageSquare,
  Clock,
  ArrowRight,
  Lock,
} from "lucide-react";

const RoomCarousel = ({ listings, locked = false }) => {
  const [current, setCurrent] = useState(0);

  const images = listings
    .filter((l) => l.images?.length > 0)
    .flatMap((l) =>
      l.images.map((img) => ({
        url: img,
        title: l.title,
        location: l.location,
        price: l.price,
      })),
    );

  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  const img = images[current];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "220px",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      <img
        key={current}
        src={img.url}
        alt={img.title}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          animation: "carouselFade 0.6s ease-in-out",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "1rem 1.25rem",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        {locked ? (
          <p
            style={{
              fontSize: "0.85rem",
              fontWeight: 700,
              margin: 0,
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          >
            Complete payment to view rooms
          </p>
        ) : (
          <>
            <div>
              <p
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  margin: 0,
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                {img.title}
              </p>
              <p style={{ fontSize: "0.75rem", margin: 0, opacity: 0.85 }}>
                📍 {img.location}
              </p>
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 800,
                background: "rgba(99,102,241,0.9)",
                padding: "0.2rem 0.6rem",
                borderRadius: "6px",
              }}
            >
              Rs. {img.price?.toLocaleString()}/mo
            </span>
          </>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "12px",
          display: "flex",
          gap: "5px",
        }}
      >
        {images.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? "18px" : "6px",
              height: "6px",
              borderRadius: "999px",
              background: i === current ? "white" : "rgba(255,255,255,0.45)",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          />
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
    calculateRecommendationScore,
    paidRadiusAccess,
    now: currentTime,
    theme,
  } = useContext(AppContext);
  const logo = theme === "dark" ? darkLogo : whiteLogo;

  const navigate = useNavigate();

  const [activeListingId, setActiveListingId] = useState(null);
  const [highlightListingId] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/");
    } else if (currentUser.role !== "tenant") {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const isAccessPaid =
    paidRadiusAccess &&
    paidRadiusAccess.userId === currentUser?.id &&
    paidRadiusAccess.paidUntil > currentTime &&
    paidRadiusAccess.location;

  const accessRemainingLabel = isAccessPaid
    ? formatDuration(paidRadiusAccess.paidUntil - currentTime)
    : null;

  const visibleListings = isAccessPaid
    ? listings.filter((l) => {
        if (!isListingLive(l)) return false;
        if (!l.latitude || !l.longitude) return false;
        const dist = haversineDistance(
          paidRadiusAccess.location.lat,
          paidRadiusAccess.location.lng,
          Number(l.latitude),
          Number(l.longitude),
        );
        return dist <= paidRadiusAccess.activeRadius;
      })
    : [];

  const bookmarkedRooms = listings.filter((l) => savedListings.includes(l.id));

  const tenantInquiries = inquiries.filter(
    (inq) =>
      inq.tenantEmail?.toLowerCase() === currentUser?.email?.toLowerCase(),
  );

  const handleMarkerClick = (listingId) => {
    setActiveListingId(listingId);
  };

  if (!currentUser) return null;

  return (
    <div className="animate-fade-in tenant-dashboard container px-6 py-8 pb-20">
      {/* 1. Welcome Banner with Profile */}
      <DashboardHeader className="welcome-banner-redesign animate-fade-in">
        <div>
          <img
            src={logo}
            alt="NestFinder"
            style={{ height: "70px", width: "auto", marginBottom: "1rem" }}
          />
          <h2 className="text-primary mb-2 text-[1.8rem] font-extrabold">
            Welcome, {currentUser?.name}!
          </h2>
          <p className="text-text-main m-0 text-[1.1rem] font-bold">
            Let your search begin
          </p>
        </div>
      </DashboardHeader>

      {/* 2. AI Match Horizontal CTA */}
      <div className="ai-cta-horizontal">
        <Sparkles size={48} className="text-primary" />
        <div>
          <h3 className="text-text-main m-0 text-[1.8rem] leading-tight font-extrabold">
            Let's refine your room search with the help of our AI
          </h3>
          <p className="text-text-muted mt-2 mb-0 text-[1rem]">
            Find the perfect room tailored exactly to your preferences.
          </p>
        </div>
        <button
          className="glow-btn btn-lg mt-2 rounded-(--radius-full) px-8 text-[1.1rem] font-bold"
          onClick={() => navigate("/ai-recommend")}
        >
          Find Your Match with AI
        </button>
      </div>

      {/* 3. Favorites Section (Full Width) */}
      <div className="favorites-panel w-full">
        <h3 className="mb-2 flex items-center gap-2 text-[1.4rem] font-bold">
          <Heart size={24} className="text-danger fill-danger" /> Your
          Favourites
        </h3>

        {bookmarkedRooms.length > 0 ? (
          <div
            className="favorites-grid"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            {bookmarkedRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                score={calculateRecommendationScore(room, tenantPreferences)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-favorites">
            <Heart size={48} className="text-border-color mb-3" />
            <p className="text-[1.1rem] font-medium">No favourites yet</p>
            <p className="mt-2 max-w-62.5 text-center text-[0.9rem]">
              Your favourite rooms will be visible here once you save them.
            </p>
          </div>
        )}
      </div>

      {/* 4. Your Inquiries Section */}
      <div className="favorites-panel w-full">
        <h3 className="mb-2 flex items-center gap-2 text-[1.4rem] font-bold">
          <MessageSquare size={24} className="text-primary" /> Your Inquiries
        </h3>

        {tenantInquiries.length > 0 ? (
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tenantInquiries.map((inq) => (
              <div key={inq.id} className="inquiry-card">
                <div className="flex items-start justify-between">
                  <strong className="text-primary text-[1rem]">
                    {inq.listings?.title || "Unknown Room"}
                  </strong>
                  <span className="text-text-light text-[0.8rem]">
                    {new Date(inq.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-text-main m-0 mt-2 text-[0.9rem]">
                  "{inq.message}"
                </p>

                {inq.status === "replied" ? (
                  <div className="inquiry-reply mt-3">
                    <strong className="text-primary mb-1 block text-[0.8rem]">
                      Landlord Reply:
                    </strong>
                    {inq.reply_text}
                  </div>
                ) : (
                  <div className="text-accent mt-3 flex items-center gap-1 text-[0.8rem]">
                    <Clock size={14} /> Pending landlord response
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-favorites" style={{ padding: "3rem 2rem" }}>
            <MessageSquare size={48} className="text-border-color mb-3" />
            <p className="text-[1.1rem] font-medium">No inquiries yet</p>
            <p className="mt-2 max-w-62.5 text-center text-[0.9rem]">
              You haven't made any inquiries yet.
            </p>
          </div>
        )}
      </div>

      {/* 5. Full-width Map Section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-[1.4rem] font-bold">
            🗺️ Unlocked Rooms in Map View
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="badge badge-secondary"
              style={{ textTransform: "none" }}
            >
              {isAccessPaid
                ? `Showing ${visibleListings.length} rooms in radius`
                : "Radius Access Locked"}
            </span>
            {isAccessPaid && (
              <span
                className="badge flex items-center gap-1"
                style={{
                  textTransform: "none",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981",
                }}
              >
                <Clock size={12} /> {accessRemainingLabel} remaining
              </span>
            )}
          </div>
        </div>

        <div className="map-section-full relative">
          {isAccessPaid ? (
            <MapContainer
              listings={visibleListings}
              activeListingId={activeListingId}
              highlightListingId={highlightListingId}
              onMarkerClick={handleMarkerClick}
              currentCenter={
                paidRadiusAccess.location
                  ? [
                      paidRadiusAccess.location.lat,
                      paidRadiusAccess.location.lng,
                    ]
                  : null
              }
              radius={paidRadiusAccess.activeRadius}
              college={paidRadiusAccess.location?.name}
            />
          ) : (
            <div
              style={{
                height: "350px",
                borderRadius: "var(--radius-lg)",
                backgroundColor:
                  "color-mix(in srgb, var(--primary) 8%, transparent)",
                border: "2px dashed var(--border-color)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <Lock
                size={42}
                style={{ color: "var(--primary)", marginBottom: "0.75rem" }}
              />
              <h4
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  margin: "0 0 0.4rem",
                }}
              >
                Distance Tier Paywall Active
              </h4>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.95rem",
                  maxWidth: "480px",
                  marginBottom: "1.25rem",
                }}
              >
                Unlock your desired distance radius tier to view verified room
                pins and listings around your college or workplace.
              </p>
              <button
                className="btn btn-primary font-bold"
                onClick={() => navigate("/rooms")}
              >
                Unlock Distance Tier Access →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6. Available Rooms (Carousel Section) */}
      <div className="mt-8">
        <div className="carousel-section" style={{ marginTop: 0 }}>
          <div className="carousel-container">
            <div className="flex-1">
              <RoomCarousel
                listings={
                  isAccessPaid
                    ? visibleListings
                    : listings.filter(isListingLive)
                }
                locked={!isAccessPaid}
              />
            </div>
            <div className="glowing-arrow" onClick={() => navigate("/rooms")}>
              <ArrowRight size={24} />
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/rooms")}
            style={{ whiteSpace: "nowrap" }}
          >
            {isAccessPaid
              ? "View Unlocked Rooms →"
              : "Unlock & View All Rooms →"}
          </button>
        </div>
      </div>
    </div>
  );
};

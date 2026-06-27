import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from "../../Context/AppContext";
import { RoomCard } from '../../components/RoomCard';
import { MapContainer } from '../../components/MapContainer';
import {
  Heart, Sparkles, Settings, MessageSquare, CheckCircle, Clock,
  ArrowRight, SlidersHorizontal, Filter, Search, Check, Map
} from 'lucide-react';

export const TenantDashboard = () => {
  const {
    currentUser,
    savedListings,
    listings,
    inquiries,
    tenantPreferences,
    setTenantPreferences
  } = useContext(AppContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    } else if (currentUser.role !== 'tenant') {
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  const [activeTab, setActiveTab]               = useState('saved');
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedType, setSelectedType]         = useState('all');
  const [maxBudget, setMaxBudget]               = useState(25000);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [activeListingId, setActiveListingId]   = useState(null);
  const [highlightListingId, setHighlightListingId] = useState(null);
  const [mapCenter, setMapCenter]               = useState(null);

  const [budget, setBudget]           = useState(tenantPreferences.budget);
  const [city, setCity]               = useState(tenantPreferences.preferredCity);
  const [sharing, setSharing]         = useState(tenantPreferences.sharing);
  const [roomType, setRoomType]       = useState(tenantPreferences.roomType);
  const [college, setCollege]         = useState(tenantPreferences.poiCollege);
  const [prefAmenities, setPrefAmenities] = useState(tenantPreferences.essentialAmenities);
  const [isSavedPrefs, setIsSavedPrefs]   = useState(false);

  if (!currentUser || currentUser.role !== 'tenant') return null;

  const bookmarkedRooms  = listings.filter(l => savedListings.includes(l.id));
  const tenantInquiries  = inquiries.filter(inq =>
    inq.tenantEmail.toLowerCase() === currentUser?.email.toLowerCase()
  );

  const handleAmenityToggle = (item) => {
    setPrefAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handlePreferencesSubmit = (e) => {
    e.preventDefault();
    setTenantPreferences({
      budget,
      preferredCity: city,
      sharing,
      roomType,
      essentialAmenities: prefAmenities,
      poiCollege: college,
    });
    setIsSavedPrefs(true);
    setTimeout(() => setIsSavedPrefs(false), 3000);
  };

  const handleMarkerClick = (listing) => {
    setActiveListingId(listing.id);
    const element = document.getElementById(`tenant-room-card-${listing.id}`);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const scoredListings = listings
    .filter(listing => {
      const matchesSearch =
        searchQuery === '' ||
        listing.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType   = selectedType === 'all' || listing.type === selectedType;
      const matchesBudget = listing.price <= maxBudget;
      return matchesSearch && matchesType && matchesBudget;
    })
    .map(listing => ({
      ...listing,
      matchScore: Math.floor(Math.random() * 40) + 60,
    }));

  const AMENITIES = ['WiFi', 'Hot Water', 'Parking', 'Furnished', 'Kitchen', 'Balcony', 'Backup Electricity'];

  return (
    <div className="container animate-fade-in py-8 px-6 pb-20">

      {/* Welcome Banner */}
      <div className="welcome-banner-card animate-fade-in mb-10">
        <h2 className="text-[1.8rem] font-extrabold text-primary mb-2">
          Welcome, {currentUser.name}!
        </h2>
        <p className="text-[1.1rem] font-bold text-text-main m-0">
          Let your search begin
        </p>
      </div>

      <div className="search-split-layout">

        {/* ── Left column: Search & listings ── */}
        <div className="flex flex-col gap-6">

          {/* Filter card */}
          <div className="card p-6 border border-border-color">
            <h3 className="text-[1.15rem] flex items-center gap-2 mb-5 border-b border-border-color pb-2">
              <Filter size={18} className="text-primary" />
              <span>Refine Your Search</span>
            </h3>

            <div className="flex flex-col gap-5">

              {/* Search + Type row */}
              <div className="grid gap-4" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>

                <div className="form-group mb-0">
                  <label className="form-label text-[0.7rem]">Search Zone</label>
                  <div className="relative flex items-center">
                    <Search size={16} className="absolute left-[10px] text-text-light" />
                    <input
                      type="text"
                      placeholder="Baneshwor, Pulchowk, Kirtipur..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="form-input w-full pl-9 py-2 text-[0.9rem]"
                    />
                  </div>
                </div>

                <div className="form-group mb-0">
                  <label className="form-label text-[0.7rem]">Room Type</label>
                  <select
                    value={selectedType}
                    onChange={e => setSelectedType(e.target.value)}
                    className="form-input py-2 text-[0.9rem]"
                  >
                    <option value="all">All Types</option>
                    <option value="Room">Single Room</option>
                    <option value="Flat">Full Flat</option>
                  </select>
                </div>
              </div>

              {/* Budget slider */}
              <div className="form-group mb-0">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label text-[0.7rem]">Max Budget Limit</label>
                  <strong className="text-[0.9rem] text-primary">
                    Rs. {maxBudget.toLocaleString('en-IN')}/mo
                  </strong>
                </div>
                <input
                  type="range"
                  min="4000"
                  max="40000"
                  step="1000"
                  value={maxBudget}
                  onChange={e => setMaxBudget(Number(e.target.value))}
                  className="w-full cursor-pointer accent-primary"
                />
              </div>

              {/* Amenity pills */}
              <div className="text-left">
                <label className="form-label text-[0.7rem] block mb-2">Facilities Required</label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((amenity, i) => {
                    const active = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          setSelectedAmenities(prev =>
                            prev.includes(amenity)
                              ? prev.filter(a => a !== amenity)
                              : [...prev, amenity]
                          )
                        }
                        className={`flex items-center gap-1 px-3 py-1 rounded-full cursor-pointer text-[0.8rem] border transition-all duration-150
                          ${active
                            ? 'bg-primary text-white border-primary'
                            : 'bg-transparent text-text-muted border-border-color hover:border-primary/40'
                          }`}
                      >
                        {active && <Check size={12} />}
                        <span>{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Results list */}
          <div className="flex flex-col gap-4">

            {/* Results meta row */}
            <div className="flex justify-between items-center">
              <span className="text-[0.85rem] text-text-light">
                We found <strong>{scoredListings.length}</strong> matching rooms
              </span>
              <span className="text-[0.75rem] text-text-light flex items-center gap-1">
                <Sparkles size={12} className="text-accent" />
                Sorted by AI Match Score
              </span>
            </div>

            {/* Scrollable cards */}
            <div className="flex flex-col gap-4 max-h-[550px] overflow-y-auto pr-1">
              {scoredListings.length === 0 ? (
                <div className="card text-center py-12 px-4">
                  <p className="text-text-light">No active rooms match these filters.</p>
                </div>
              ) : (
                scoredListings.map(listing => (
                  <div
                    key={listing.id}
                    id={`tenant-room-card-${listing.id}`}
                    onMouseEnter={() => setHighlightListingId(listing.id)}
                    onMouseLeave={() => setHighlightListingId(null)}
                    className={`relative rounded-[var(--radius-lg)] transition-all duration-[250ms]
                      ${activeListingId === listing.id
                        ? 'border-2 border-primary'
                        : 'border-2 border-transparent'
                      }`}
                  >
                    {/* AI match score badge */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-[0.6rem] py-1 rounded-[var(--radius-sm)] text-[0.75rem] font-bold text-white shadow-sm"
                      style={{ backgroundColor: 'rgba(99,102,241,0.95)', backdropFilter: 'blur(4px)' }}
                    >
                      <Sparkles size={10} className="fill-white" />
                      <span>{listing.matchScore}% Match</span>
                    </div>

                    <RoomCard room={listing} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Right column: Map ── */}
        <div className="flex flex-col gap-4">

          <div className="flex justify-between items-center">
            <span className="text-[0.85rem] text-text-light flex items-center gap-1">
              🗺️ Use Map to Choose Place
            </span>
            <span className="badge badge-secondary" style={{ textTransform: 'none' }}>
              Click pins to review
            </span>
          </div>

          <div className="highlight-map-container relative h-[700px]">
            <div className="map-badge-helper absolute top-[15px] right-[15px] z-[999]">
              <Map size={14} />
              <span>Map Discovery Mode</span>
            </div>

            <MapContainer
              listings={scoredListings}
              activeListingId={activeListingId}
              highlightListingId={highlightListingId}
              onMarkerClick={handleMarkerClick}
              currentCenter={mapCenter}
            />
          </div>
        </div>

      </div>
    </div>
  );
};
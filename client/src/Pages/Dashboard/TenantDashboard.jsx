import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext} from "../../Context/AppContext";
import { RoomCard } from '../../components/RoomCard';
import { MapContainer } from '../../components/MapContainer';
import {
  Heart,
  Sparkles,
  Settings,
  MessageSquare,
  CheckCircle,
  Clock,
  ArrowRight,
  SlidersHorizontal,
  Filter,
  Search,
  Check,
  Map
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

  // Redirect if not logged in
    useEffect(() => {
      if (!currentUser) {
        navigate('/auth');
      } else if (currentUser.role !== 'tenant') {
        navigate('/auth');
      }
    }, [currentUser, navigate]);

  // Tab views: 'saved', 'preferences', 'inquiries'
  const [activeTab, setActiveTab] = useState('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [maxBudget, setMaxBudget] = useState(25000);

  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const [activeListingId, setActiveListingId] = useState(null);
  const [highlightListingId, setHighlightListingId] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  // Local state for preference editor
  const [budget, setBudget] = useState(tenantPreferences.budget);
  const [city, setCity] = useState(tenantPreferences.preferredCity);
  const [sharing, setSharing] = useState(tenantPreferences.sharing);
  const [roomType, setRoomType] = useState(tenantPreferences.roomType);
  const [college, setCollege] = useState(tenantPreferences.poiCollege);
  const [prefAmenities, setPrefAmenities] = useState(tenantPreferences.essentialAmenities);
  const [isSavedPrefs, setIsSavedPrefs] = useState(false);

  // Filter bookmarked rooms
  const bookmarkedRooms = listings.filter(l => savedListings.includes(l.id));

  // Filter inquiries sent by this tenant
  const tenantInquiries = inquiries.filter(inq => 
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
      poiCollege: college
    });
        setIsSavedPrefs(true);
        setTimeout(() => setIsSavedPrefs(false), 3000);
      };
      const handleMarkerClick = (listing) => {
      setActiveListingId(listing.id);

      const element = document.getElementById(
        `tenant-room-card-${listing.id}`
      );


      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    };
              const scoredListings = listings.filter(listing => {
              const matchesSearch =
                searchQuery === '' ||
                listing.location?.toLowerCase().includes(
                  searchQuery.toLowerCase()
                );

              const matchesType =
                selectedType === 'all' ||
                listing.type === selectedType;

              const matchesBudget =
                listing.price <= maxBudget;

              return matchesSearch &&
                    matchesType &&
                    matchesBudget;
            }).map(listing => ({
              ...listing,  //spread operator to copy all properties of the listing object
              matchScore: Math.floor(Math.random() * 40) + 60
            }));
     // ============================================================
  // TENANT WORKSPACE VIEW (logged-in tenant)
  // ============================================================
  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 5rem 1.5rem' }}>
      
      {/* Tenant Welcome Banner: shows username greeting + bold search headline */}
      <div className="welcome-banner-card animate-fade-in" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
          Welcome, {currentUser.name}!
        </h2>
        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
          Let your search begin
        </p>
      </div>

      <div className="search-split-layout">
        
        {/* Left column: Search & listings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <Filter size={18} style={{ color: 'var(--primary)' }} />
              <span>Refine Your Search</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Search Zone</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-light)' }} />
                    <input 
                      type="text" 
                      placeholder="Baneshwor, Pulchowk, Kirtipur..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', paddingLeft: '2.3rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Room Type</label>
                  <select 
                    value={selectedType} 
                    onChange={(e) => setSelectedType(e.target.value)} 
                    className="form-input" 
                    style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                  >
                    <option value="all">All Types</option>
                    <option value="Room">Single Room</option>
                    <option value="Flat">Full Flat</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label className="form-label" style={{ fontSize: '0.7rem' }}>Max Budget Limit</label>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>Rs. {maxBudget.toLocaleString('en-IN')}/mo</strong>
                </div>
                <input 
                  type="range" 
                  min="4000" 
                  max="40000" 
                  step="1000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '100%' }}
                />
              </div>

              <div style={{ textAlign: 'left' }}>
                <label className="form-label" style={{ fontSize: '0.7rem', display: 'block', marginBottom: '0.5rem' }}>Facilities Required</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {["WiFi", "Hot Water", "Parking", "Furnished", "Kitchen", "Balcony", "Backup Electricity"].map((amenity, i) => {
                    return (
                      <button 
                        key={i} 
                        type="button"
                        onClick={() => setSelectedAmenities(prev => 
                        prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
                       )}
                        const isChecked = {selectedAmenities.includes(amenity)}
                      >
                        {isChecked && <Check size={12} />}
                        <span>{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <style>{`
        @media (max-width: 968px) {
          .details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
  

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                We found <strong>{scoredListings.length}</strong> matching rooms
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Sparkles size={12} style={{ color: 'var(--accent)' }} /> Sorted by AI Match Score
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {scoredListings.length === 0 ? (
                <div className="card text-center" style={{ padding: '3rem 1rem' }}>
                  <p style={{ color: 'var(--text-light)' }}>No active rooms match these filters.</p>
                </div>
              ) : (
                scoredListings.map(listing => (
                  <div 
                    key={listing.id} 
                    id={`tenant-room-card-${listing.id}`}
                    onMouseEnter={() => setHighlightListingId(listing.id)}
                    onMouseLeave={() => setHighlightListingId(null)}
                    style={{ 
                      borderRadius: 'var(--radius-lg)',
                      border: activeListingId === listing.id ? '2px solid var(--primary)' : '2px solid transparent',
                      transition: 'all 0.25s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ 
                      position: 'absolute', 
                      top: '12px', 
                      right: '12px', 
                      zIndex: 10,
                      backgroundColor: 'rgba(99, 102, 241, 0.95)',
                      backdropFilter: 'blur(4px)',
                      color: 'white',
                      padding: '0.25rem 0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <Sparkles size={10} style={{ fill: 'white' }} />
                      <span>{listing.matchScore}% Match</span>
                    </div>

                    <RoomCard room={listing} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              🗺️ Use Map to Choose Place
            </span>
            <span className="badge badge-secondary" style={{ textTransform: 'none' }}>
              Click pins to review
            </span>
          </div>

          <div className="highlight-map-container" style={{ height: '700px', position: 'relative' }}>
            <div className="map-badge-helper" style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 999 }}>
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

      

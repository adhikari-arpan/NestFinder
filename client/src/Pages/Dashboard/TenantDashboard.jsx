import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext} from "../../Context/AppContext";
import { RoomCard } from '../../components/RoomCard';
import { 
  Heart, 
  Sparkles, 
  Settings, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  SlidersHorizontal 
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
    if (!currentUser || currentUser.role !== 'tenant') {
      navigate('/auth');
    }
  }, [currentUser]);

  // Tab views: 'saved', 'preferences', 'inquiries'
  const [activeTab, setActiveTab] = useState('saved');

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

  const toggleAmenity = (item) => {
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

  return (
    <div className="container animate-fade-in" style={{ padding: '3rem 1.5rem 5rem 1.5rem', textAlign: 'left' }}>
      
      {/* Profile Header card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={currentUser?.avatar} alt="avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '3px solid var(--primary)', objectFit: 'cover' }} />
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Tenant Dashboard: {currentUser?.name}</h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Access your saved rooms, adjust AI matching parameters, and track landlord inquiry statuses.</p>
          </div>
        </div>
        <button onClick={() => navigate('/ai-recommend')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Sparkles size={18} style={{ fill: 'white' }} /> Recalculate Recommendations
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('saved')}
          style={{ 
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'saved' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'saved' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Heart size={16} /> Saved Rooms ({bookmarkedRooms.length})
        </button>
        
        <button 
          onClick={() => setActiveTab('preferences')}
          style={{ 
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'preferences' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'preferences' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Settings size={16} /> Preference Matrix (AI Profile)
        </button>

        <button 
          onClick={() => setActiveTab('inquiries')}
          style={{ 
            padding: '0.75rem 0.5rem',
            background: 'none',
            border: 'none',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: activeTab === 'inquiries' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'inquiries' ? '3px solid var(--primary)' : '3px solid transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <MessageSquare size={16} /> Sent Inquiries ({tenantInquiries.length})
        </button>
      </div>

      {/* 1. Saved Rooms Tab Grid */}
      {activeTab === 'saved' && (
        <div>
          {bookmarkedRooms.length === 0 ? (
            <div className="card text-center" style={{ padding: '4rem 1rem' }}>
              <Heart size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
              <h3>No Bookmarked Rooms</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>Explore Kathmandu rooms and click the heart icon on any card to save it here.</p>
              <Link to="/search" className="btn btn-primary btn-sm">Find Rooms Now</Link>
            </div>
          ) : (
            <div className="grid-cols-3">
              {bookmarkedRooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Preferences Matrix Custom Editor */}
      {activeTab === 'preferences' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }} className="details-grid">
          
          {/* Editor Form */}
          <div className="card" style={{ padding: '2rem', borderColor: 'var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Edit Search Preferences
            </h3>

            {isSavedPrefs && (
              <div className="badge badge-secondary" style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem', borderRadius: 'var(--radius-sm)' }}>
                ✓ Preferences updated in active memory! Recalculating scores.
              </div>
            )}

            <form onSubmit={handlePreferencesSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Search Zone</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="form-input">
                    <option value="Kathmandu">Kathmandu</option>
                    <option value="Lalitpur">Lalitpur</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Max Budget Limit (Rs)</label>
                  <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="form-input" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Layout Type</label>
                  <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="form-input">
                    <option value="Room">Single Room</option>
                    <option value="Flat">Full Flat</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Sharing Layout</label>
                  <select value={sharing} onChange={(e) => setSharing(e.target.value)} className="form-input">
                    <option value="Single">Single Bed</option>
                    <option value="Shared">Shared Room</option>
                    <option value="Private">Private Flat</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nearest Landmark Campus</label>
                <select value={college} onChange={(e) => setCollege(e.target.value)} className="form-input">
                  <option value="">None / Not a student</option>
                  <option value="Tribhuvan University">Tribhuvan University</option>
                  <option value="Pulchowk Campus">Pulchowk Campus</option>
                  <option value="St. Xavier's College Maitighar">St. Xavier's College Maitighar</option>
                  <option value="Apex College Baneshwor">Apex College Baneshwor</option>
                  <option value="United Academy Kumaripati">United Academy Kumaripati</option>
                  <option value="Kathmandu University">Kathmandu University</option>
                </select>
              </div>

              <div className="form-group" style={{ textAlign: 'left' }}>
                <label className="form-label">Essential Amenities Checklist</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {["WiFi", "Hot Water", "Parking", "Furnished", "Kitchen", "Balcony", "Backup Electricity"].map((item, idx) => {
                    const isSelected = prefAmenities.includes(item);
                    return (
                      <button 
                        key={idx} 
                        type="button"
                        onClick={() => toggleAmenity(item)}
                        className="btn btn-outline"
                        style={{ 
                          padding: '0.35rem 0.6rem', 
                          fontSize: '0.75rem', 
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                          borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                          color: isSelected ? 'white' : 'var(--text-muted)'
                        }}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }}>
                Save Preferences
              </button>
            </form>
          </div>

          {/* AI parameters details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ borderColor: 'var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <SlidersHorizontal size={20} />
                <strong style={{ fontSize: '1rem' }}>Matching Vector Model</strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Your preferences profile maps directly to our AI models, modifying how candidate items are scored and recommended on search tabs.
              </p>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', textAlign: 'left' }}>
                <div><strong>Current preference snapshot:</strong></div>
                <div style={{ fontFamily: 'monospace', color: 'var(--primary)', padding: '0.5rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
                  {JSON.stringify(tenantPreferences, null, 2)}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 3. Inquiries Sent tracking list */}
      {activeTab === 'inquiries' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {tenantInquiries.length === 0 ? (
            <div className="card text-center" style={{ padding: '4rem 1rem' }}>
              <MessageSquare size={48} style={{ color: 'var(--text-light)', marginBottom: '1rem' }} />
              <h3>No Messages Sent</h3>
              <p style={{ color: 'var(--text-muted)' }}>When you inquire about listings, your inquiries timeline tracker will populate here.</p>
            </div>
          ) : (
            tenantInquiries.map(inq => {
              const matchedRoom = listings.find(l => l.id === inq.listingId);
              return (
                <div key={inq.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderColor: 'var(--border-color)' }}>
                  
                  {/* Card Header info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>Listing: <Link to={`/room/${inq.listingId}`} style={{ color: 'var(--primary)' }}>{matchedRoom?.title || `Listing #${inq.listingId}`}</Link></strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', display: 'block' }}>
                        Landlord contact: {matchedRoom?.landlord.name} ({matchedRoom?.landlord.phone})
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {inq.status === 'replied' ? (
                        <span className="badge badge-secondary" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                          <CheckCircle size={12} /> Response Received
                        </span>
                      ) : (
                        <span className="badge badge-accent" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                          <Clock size={12} /> Awaiting Reply
                        </span>
                      )}
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                        Inquired {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* My Inquiry Text */}
                  <div style={{ fontSize: '0.9rem', padding: '0.75rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', textAlign: 'left' }}>
                    <strong>My Inquiry message:</strong>
                    <div style={{ fontStyle: 'italic', marginTop: '0.25rem', color: 'var(--text-muted)' }}>"{inq.message}"</div>
                  </div>

                  {/* Landlord reply text */}
                  {inq.status === 'replied' && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--secondary-light)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--secondary)', fontSize: '0.9rem' }}>
                      <strong>Response from Landlord:</strong>
                      <div style={{ fontStyle: 'italic', marginTop: '0.25rem', color: 'var(--text-main)' }}>"{inq.replyText}"</div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 968px) {
          .details-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

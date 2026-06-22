import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext} from "../Context/AppContext";
import { RoomCard } from '../components/RoomCard';
import { Search, Sparkles, MapPin, Award, CheckCircle, Shield, ArrowRight } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const { listings } = useContext(AppContext);
  
  // Search state
  const [searchLocation, setSearchLocation] = useState('');
  const [searchType, setSearchType] = useState('any');
  const [searchBudget, setSearchBudget] = useState('any');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    let url = `/search?`;
    if (searchLocation) url += `location=${encodeURIComponent(searchLocation)}&`;
    if (searchType !== 'any') url += `type=${searchType}&`;
    if (searchBudget !== 'any') url += `budget=${searchBudget}&`;
    navigate(url);
  };

  const handleCollegeClick = (collegeName) => {
    navigate(`/search?poi=${encodeURIComponent(collegeName)}`);
  };

  const featuredRooms = listings.filter(item => item.status === 'verified').slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '5rem' }}>
      
      {/* 1. Hero Section */}
      <section style={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-app) 100%)',
        padding: '6rem 0 5rem 0',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'left'
      }}>
        {/* Decorative subtle glows */}
        <div style={{ 
          position: 'absolute', 
          top: '15%', 
          left: '10%', 
          width: '250px', 
          height: '250px', 
          borderRadius: '50%', 
          background: 'rgba(99, 102, 241, 0.12)', 
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: '10%', 
          right: '5%', 
          width: '300px', 
          height: '300px', 
          borderRadius: '50%', 
          background: 'rgba(16, 185, 129, 0.08)', 
          filter: 'blur(90px)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <span className="badge badge-primary animate-fade-in" style={{ marginBottom: '1.25rem' }}>
              🏠 NO BROKER COMMISSIONS • VERIFIED ROOMS
            </span>
            <h1 className="animate-fade-in" style={{ 
              fontSize: '3.3rem', 
              fontWeight: 800, 
              lineHeight: 1.15,
              fontFamily: 'var(--font-display)',
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, var(--text-main) 30%, var(--primary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Find Your Next Room or Flat In Nepal, Smartly.
            </h1>
            <p className="animate-fade-in" style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '600px' }}>
              Browse listings on interactive maps and let our custom AI Recommendation Engine match room prices, college proximity, and wifi facilities to your exact requirements.
            </p>

            {/* Smart Search Bar */}
            <form onSubmit={handleSearchSubmit} className="glass animate-fade-in hero-search-bar" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-lg)', 
              boxShadow: 'var(--shadow-xl)',
              flexWrap: 'wrap',
              border: '1px solid var(--border-color)'
            }}>
              {/* Location Input */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
                <MapPin size={18} style={{ color: 'var(--primary)' }} />
                <input 
                  type="text" 
                  placeholder="Baneshwor, Pulchowk, Kirtipur..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  style={{ 
                    border: 'none', 
                    background: 'none', 
                    color: 'var(--text-main)', 
                    fontSize: '0.95rem',
                    outline: 'none',
                    width: '100%'
                  }}
                />
              </div>

              {/* Type Select */}
              <div className="search-divider" style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />
              <div style={{ minWidth: '120px' }}>
                <select 
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="search-select"
                >
                  <option value="any">Any Type</option>
                  <option value="Room">Room Only</option>
                  <option value="Flat">Full Flat</option>
                </select>
              </div>

              {/* Budget Select */}
              <div className="search-divider" style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)' }} />
              <div style={{ minWidth: '120px' }}>
                <select 
                  value={searchBudget}
                  onChange={(e) => setSearchBudget(e.target.value)}
                  className="search-select"
                >
                  <option value="any">Any Budget</option>
                  <option value="10000">Below Rs. 10,000</option>
                  <option value="20000">Below Rs. 20,000</option>
                  <option value="30000">Below Rs. 30,000</option>
                </select>
              </div>

              {/* Submit */}
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
                <Search size={18} />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Hero Visual Mockup */}
          <div style={{ display: 'none', lg: 'block', position: 'relative' }}>
            <div className="card shadow-xl animate-fade-in" style={{ padding: 0, overflow: 'hidden', transform: 'rotate(2deg)', maxWidth: '400px', margin: '0 auto' }}>
              <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" alt="Room preview" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
              <div style={{ padding: '1.5rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-secondary">98% Match</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>Rs. 9,500/mo</strong>
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Cozy Studio near Pulchowk</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 Pulchowk Engineering Campus (350m)</p>
              </div>
            </div>

            {/* Float badge widget */}
            <div className="glass shadow-lg animate-fade-in" style={{ 
              position: 'absolute', 
              top: '40%', 
              left: '-20px', 
              padding: '0.75rem 1rem', 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              zIndex: 10
            }}>
              <Sparkles size={18} style={{ color: 'var(--accent)', fill: 'var(--accent)' }} />
              <div style={{ textAlign: 'left', fontSize: '0.8rem' }}>
                <div style={{ fontWeight: 700 }}>AI Match Algorithm</div>
                <div style={{ color: 'var(--text-light)' }}>Fits student preference</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Highlight Features / Value Props */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Why NestFinder?</span>
          <h2 style={{ fontSize: '2.2rem', marginTop: '0.5rem' }}>Modern features for stress-free renting</h2>
        </div>

        <div className="grid-cols-3">
          <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <MapPin size={30} />
            </div>
            <h3>Map-Based Discovery</h3>
            <p style={{ fontSize: '0.92rem' }}>Visualise room coordinates relative to bus stops, supermarkets, and local streets using open map overlays. No blind visits.</p>
          </div>

          <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <Sparkles size={30} />
            </div>
            <h3>AI-Guided Matching</h3>
            <p style={{ fontSize: '0.92rem' }}>Input your budget boundaries, essential services, and walk distance. Our algorithm computes a similarity score instantly.</p>
          </div>

          <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
              <Shield size={30} />
            </div>
            <h3>Verified & direct contact</h3>
            <p style={{ fontSize: '0.92rem' }}>Every landlord goes through validation. Connect directly via telephone or messaging. Say goodbye to heavy brokerage costs.</p>
          </div>
        </div>
      </section>

      {/* 3. AI Recommendation Banner CTA */}
      <section className="container">
        <div className="glass" style={{ 
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.08) 100%)',
          borderRadius: 'var(--radius-lg)', 
          padding: '3.5rem',
          border: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          alignItems: 'center',
          gap: '3rem',
          textAlign: 'left'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--accent-light)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)', color: 'var(--accent)', fontWeight: 700, fontSize: '0.75rem', marginBottom: '1.25rem' }}>
              <Sparkles size={12} style={{ fill: 'var(--accent)' }} /> INTRODUCING AI RECOMMENDATIONS
            </div>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>Tired of scrolling? Let AI match rooms for you.</h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Take our 2-minute preferences assessment. We analyze budget flexibility, wifi utilities, parking requirements, and calculate matching scores against active listings in Kathmandu Valley.
            </p>
            <button onClick={() => navigate('/ai-recommend')} className="btn btn-secondary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Start Preference Assessment</span>
              <ArrowRight size={18} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Small list of match cards */}
            <div className="card shadow-sm" style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-card)', borderLeft: '4px solid var(--secondary)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', fontWeight: 700, flexShrink: 0 }}>
                95%
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 700 }}>Single Room near Pulchowk</div>
                <div style={{ color: 'var(--text-light)' }}>Fits budget (9,500) • 350m to college</div>
              </div>
            </div>
            <div className="card shadow-sm" style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-card)', borderLeft: '4px solid var(--accent)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>
                84%
              </div>
              <div style={{ fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 700 }}>Studio Room in Maitighar</div>
                <div style={{ color: 'var(--text-light)' }}>Fits budget (11,000) • 200m to college</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Listings */}
      <section className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Available Listings</span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>Featured Nest Listings</h2>
          </div>
          <button onClick={() => navigate('/search')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>Browse All Rooms</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid-cols-3">
          {featuredRooms.map(room => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      {/* 5. Campus Quick Search links */}
      <section className="container" style={{ 
        background: 'var(--bg-card)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '3rem', 
        border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Looking for rooms near your college?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Quickly search available listings within walking distance of popular educational hubs in Nepal.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {[
            "Tribhuvan University",
            "Pulchowk Campus",
            "St. Xavier's College Maitighar",
            "Apex College Baneshwor",
            "United Academy Kumaripati",
            "Kathmandu University"
          ].map((college, idx) => (
            <button 
              key={idx} 
              onClick={() => handleCollegeClick(college)}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', background: 'var(--bg-app)', fontWeight: 500 }}
            >
              🎓 {college}
            </button>
          ))}
        </div>
      </section>

      {/* Styled components inside page */}
      <style>{`
        .hero-search-bar input::placeholder {
          color: var(--text-light);
        }
        .search-select {
          border: none;
          background: none;
          color: var(--text-main);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 600;
          outline: none;
          width: 100%;
          cursor: pointer;
        }
        @media (max-width: 968px) {
          .hero-search-bar {
            flex-direction: column;
            align-items: stretch !important;
            gap: 1rem !important;
            padding: 1.5rem !important;
          }
          .search-divider {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

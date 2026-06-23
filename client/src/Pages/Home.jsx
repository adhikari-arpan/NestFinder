import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
import { RoomCard } from '../components/RoomCard';
import { MapContainer } from '../components/MapContainer';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  Award, 
  CheckCircle, 
  Shield, 
  ArrowRight, 
  User, 
  Mail, 
  Phone, 
  Map, 
  Filter, 
  Check, 
  ArrowLeft,
  X
} from 'lucide-react';

// ==========================================================================
// REDESIGNED ABSTRACT ART COMPONENT: Custom animated SVG representing features
// ==========================================================================
const AbstractArt = () => {
  return (
    <svg 
      viewBox="0 0 500 500" 
      width="100%" 
      height="100%" 
      style={{ maxHeight: '480px', overflow: 'visible' }}
    >
      <defs>
        {/* Gradients for glowing shapes */}
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
        
        <linearGradient id="pinGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>

        <linearGradient id="pinGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="pinGradAmber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Background Glow */}
      <circle cx="250" cy="250" r="220" fill="url(#glowGrad)" />

      {/* 1. Map Grid Visualizer */}
      <g stroke="var(--border-color)" strokeWidth="1" fill="none" opacity="0.3">
        <path d="M 50 150 L 450 350" />
        <path d="M 50 230 L 450 430" />
        <path d="M 50 310 L 450 510" />
        <path d="M 50 350 L 450 150" />
        <path d="M 50 430 L 450 230" />
        <path d="M 50 510 L 450 310" />
        <rect x="180" y="180" width="80" height="80" rx="8" transform="rotate(45 220 220)" strokeWidth="1.5" />
        <rect x="300" y="240" width="60" height="60" rx="6" transform="rotate(45 330 270)" strokeWidth="1.5" />
      </g>

      {/* 2. Concentric AI Match Engine Rings */}
      <g className="art-spin-bg" stroke="var(--primary)" strokeWidth="1.5" fill="none" opacity="0.4" style={{ transformOrigin: '250px 250px' }}>
        <circle cx="250" cy="250" r="160" strokeDasharray="15, 35, 45, 20" />
        <circle cx="250" cy="250" r="110" strokeDasharray="30, 20" stroke="var(--secondary)" />
        <circle cx="250" cy="250" r="60" strokeDasharray="5, 10" />
      </g>

      {/* 3. Connection Flow Paths */}
      <path 
        d="M 120 180 C 200 130, 220 320, 310 270" 
        fill="none" 
        stroke="var(--primary)" 
        strokeWidth="2" 
        className="art-line-flow" 
      />
      <path 
        d="M 230 140 C 270 240, 290 280, 380 200" 
        fill="none" 
        stroke="var(--secondary)" 
        strokeWidth="2" 
        className="art-line-flow" 
        opacity="0.8" 
      />

      {/* 4. Connection Nodes */}
      <circle cx="210" cy="215" r="5" fill="var(--primary)" className="art-pulse-dot" />
      <circle cx="310" cy="270" r="6" fill="var(--secondary)" className="art-pulse-dot" />
      <circle cx="288" cy="188" r="4.5" fill="var(--accent)" className="art-pulse-dot" />

      {/* 5. Floating Location Pins */}
      {/* Pin 1: Blue */}
      <g className="art-float-pin-1" style={{ transformOrigin: '120px 180px' }}>
        <path 
          d="M120 180 C105 180, 100 160, 100 145 C100 120, 140 120, 140 145 C140 160, 135 180, 120 180 Z" 
          fill="url(#pinGradBlue)" 
          filter="drop-shadow(0px 4px 8px rgba(99, 102, 241, 0.4))"
        />
        <polygon points="115,145 125,145 125,152 115,152" fill="white" />
        <polygon points="112,145 120,137 128,145" fill="white" />
      </g>

      {/* Pin 2: Green */}
      <g className="art-float-pin-2" style={{ transformOrigin: '380px 200px' }}>
        <path 
          d="M380 200 C365 200, 360 180, 360 165 C360 140, 400 140, 400 165 C400 180, 395 200, 380 200 Z" 
          fill="url(#pinGradGreen)" 
          filter="drop-shadow(0px 4px 8px rgba(16, 185, 129, 0.4))"
        />
        <polygon points="375,165 385,165 385,172 375,172" fill="white" />
        <polygon points="372,165 380,157 388,165" fill="white" />
      </g>

      {/* Pin 3: Amber */}
      <g className="art-float-pin-1" style={{ transformOrigin: '230px 140px' }}>
        <path 
          d="M230 140 C215 140, 210 120, 210 105 C210 80, 250 80, 250 105 C250 120, 245 140, 230 140 Z" 
          fill="url(#pinGradAmber)" 
          filter="drop-shadow(0px 4px 8px rgba(245, 158, 11, 0.4))"
        />
        <polygon points="225,105 235,105 235,112 225,112" fill="white" />
        <polygon points="222,105 230,97 238,105" fill="white" />
      </g>
    </svg>
  );
};

export const Home = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    loginUser, 
    listings, 
    calculateRecommendationScore 
  } = useContext(AppContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState('tenant');

  // Tenant Workspace States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [maxBudget, setMaxBudget] = useState(25000);
  const [selectedAmenities, setSelectedAmenities] = useState(['WiFi', 'Hot Water']);
  
  // Tenant Map Interactive States
  const [activeListingId, setActiveListingId] = useState(null);
  const [highlightListingId, setHighlightListingId] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  // Redirect Landlords and Administrators
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'landlord') {
        navigate('/dashboard/landlord');
      } else if (currentUser.role === 'admin') {
        navigate('/dashboard/admin');
      }
    }
  }, [currentUser, navigate]);

  // Animated network background canvas (guest view only)
  useEffect(() => {
    if (currentUser) return;
    const canvas = document.getElementById('networkCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 3 + 1
    }));
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.fill();
      });
      dots.forEach((a, i) => dots.slice(i + 1).forEach(b => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(99,102,241,${1 - dist / 120})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }));
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [currentUser]);

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    loginUser(email || `${selectedRole}@nestfinder.com`, 'password', selectedRole);
    setIsModalOpen(false);
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleMarkerClick = (listingId) => {
    setActiveListingId(listingId);
    const element = document.getElementById(`tenant-room-card-${listingId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const filteredListings = listings.filter(item => {
    if (item.status !== 'verified') return false;
    const matchesQuery = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesBudget = item.price <= maxBudget;
    const matchesAmenities = selectedAmenities.every(amenity => 
      item.amenities.includes(amenity)
    );
    return matchesQuery && matchesType && matchesBudget && matchesAmenities;
  });

  const scoredListings = filteredListings.map(listing => {
    const score = calculateRecommendationScore(listing, {
      budget: maxBudget,
      preferredCity: listing.city,
      sharing: "Single",
      roomType: selectedType === 'all' ? listing.type : selectedType,
      essentialAmenities: selectedAmenities,
      poiCollege: ""
    });
    return { ...listing, matchScore: score };
  }).sort((a, b) => b.matchScore - a.matchScore);

  // ----------------------------------------------------
  // GUEST LANDING VIEW
  // ----------------------------------------------------
  if (!currentUser) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        background: 'var(--bg-app)',
        color: 'var(--text-main)',
        minHeight: 'calc(100vh - 70px)',
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* Animated network background */}
        <canvas id="networkCanvas" style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          opacity: 0.15, pointerEvents: 'none', zIndex: 0
        }} />

        {/* Glowing Blurred Orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.08)', filter: 'blur(100px)', pointerEvents: 'none' }} />

        {/* 1. Main Hero Container */}
        <div className="container" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.1fr 0.9fr', 
          gap: '3rem', 
          alignItems: 'center', 
          paddingTop: '5rem',
          paddingBottom: '4rem',
          zIndex: 5
        }}>
          {/* Hero text side */}
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', gap: '1.5rem' }}>
            <span className="badge badge-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              ⚡ DISCOVER BROKER-FREE RENTING
            </span>
            
            <h1 style={{ 
              fontSize: '3.1rem', 
              fontWeight: 800, 
              lineHeight: 1.15, 
              fontFamily: 'var(--font-display)',
              background: 'linear-gradient(135deg, var(--text-main) 30%, var(--primary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              maxWidth: '650px'
            }}>
              NestFinder: Discover broker-free, verified rooms and flats in Nepal with smart AI matching.
            </h1>
            
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '580px', lineHeight: 1.6 }}>
              Browse verified rooms directly on interactive map visualization layouts. Connect immediately with landlords, apply customized budgets, and let AI matches score rooms according to your academic vicinity.
            </p>

            {/* Get Started button — styled to match navbar sign in */}
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="btn btn-primary btn-lg"
              style={{ 
                padding: '0.85rem 2rem', 
                borderRadius: 'var(--radius-md)', 
                fontSize: '1rem', 
                fontWeight: 700, 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                background: 'var(--primary)',
                boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
                marginTop: '0.5rem'
              }}
            >
              <span>Get Started • Sign In</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Animated SVG Abstract Art */}
          <div className="animate-fade-in" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <AbstractArt />
          </div>
        </div>

        {/* 2. Features Grid */}
        <div className="container" style={{ zIndex: 5, paddingBottom: '6rem' }}>
          <h2 className="features-section-title">
            Why NestFinder is Helpful
          </h2>

          <div className="features-grid-layout">
            
            <div className="feature-redesign-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Map size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Map-Based Room Discovery</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Locate flats, rooms, and sharing configurations visually on our interactive open map overlay. Select places instantly based on proximity to colleges and transit points.
              </p>
            </div>

            <div className="feature-redesign-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI Similarity Matching</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Specify your exact requirements for max budget, wifi networks, and amenities. Our customized matching algorithm immediately returns percentage scores for all available listings.
              </p>
            </div>

            <div className="feature-redesign-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}>
                <Shield size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Verified Direct Contact</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Every landlord undergoes verification. Reach out directly via telephone or messages with zero broker commissions and zero hidden administrative service fees.
              </p>
            </div>

          </div>
        </div>

        {/* 3. Modal Popup Overlay */}
        {isModalOpen && (
          <div 
            className="modal-overlay"
            onClick={() => setIsModalOpen(false)}
          >
            <div 
              className="card glass-login-container glass shadow-xl" 
              style={{ width: '100%', maxWidth: '460px', padding: '2.5rem', textAlign: 'left', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', position: 'relative' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Access NestFinder</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>Enter email and phone number to log in and start your search</p>

              <form onSubmit={handleSignInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                <div className="form-group" style={{ marginBottom: '0.25rem' }}>
                  <label className="form-label">Select Your Role</label>
                  <div className="role-card-grid">
                    <div 
                      className={`role-radio-card ${selectedRole === 'tenant' ? 'active' : ''}`}
                      onClick={() => setSelectedRole('tenant')}
                    >
                      <span className="role-icon-lg">🙋</span>
                      <strong style={{ fontSize: '0.88rem' }}>I am a Tenant</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>Looking for rooms</span>
                    </div>

                    <div 
                      className={`role-radio-card ${selectedRole === 'landlord' ? 'active' : ''}`}
                      onClick={() => setSelectedRole('landlord')}
                    >
                      <span className="role-icon-lg">🏢</span>
                      <strong style={{ fontSize: '0.88rem' }}>I am a Landlord</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>Renting out flats</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-light)' }} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={`${selectedRole}@nestfinder.com`}
                      className="form-input" 
                      style={{ width: '100%', paddingLeft: '2.5rem' }} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-light)' }} />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98XXXXXXXX" 
                      required
                      className="form-input" 
                      style={{ width: '100%', paddingLeft: '2.5rem' }} 
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // TENANT WORKSPACE VIEW
  // ----------------------------------------------------
  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 5rem 1.5rem' }}>
      
      <div className="welcome-banner-card animate-fade-in" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
          We are here to help you and make your room search efficient.
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem' }}>
          Welcome back, <strong>{currentUser.name}</strong>! Use the map visualizer below to explore rooms, adjust budget facility options, and choose your perfect place.
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
                    const isChecked = selectedAmenities.includes(amenity);
                    return (
                      <button 
                        key={i} 
                        type="button"
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`facility-pill ${isChecked ? 'active' : ''}`}
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
import React, { useState, useContext, useEffect, useRef } from 'react';
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
  X,
  Lock,
  Eye,
  EyeOff,
  Home as HomeIcon,   // renamed to avoid conflict with exported 'Home' component
  ChevronDown
} from 'lucide-react';

// ==========================================================================
// FULL-SCREEN ABSTRACT ART BACKGROUND (Canvas-based, covers entire hero)
// ==========================================================================
const FullScreenArt = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle nodes representing platform features
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
      // Random color: indigo / emerald / amber
      hue: [260, 160, 45][Math.floor(Math.random() * 3)],
      opacity: Math.random() * 0.6 + 0.2,
    }));

    // Floating feature labels
    const labels = [
      { text: '🗺️ Map Discovery', x: 0.15, y: 0.18, speed: 0.0008 },
      { text: '✨ AI Matching',    x: 0.75, y: 0.25, speed: 0.001  },
      { text: '🔒 Verified Rooms', x: 0.55, y: 0.7,  speed: 0.0007 },
      { text: '💰 Budget Filter',  x: 0.2,  y: 0.65, speed: 0.0009 },
      { text: '📍 Pin & Explore',  x: 0.8,  y: 0.6,  speed: 0.0006 },
      { text: '🏠 Broker-Free',    x: 0.4,  y: 0.12, speed: 0.0011 },
    ];

    // Floating orbs for ambient glow effect
    const orbs = [
      { cx: 0.25, cy: 0.3, r: 180, color: 'rgba(99,102,241,0.07)', phase: 0 },
      { cx: 0.75, cy: 0.6, r: 220, color: 'rgba(16,185,129,0.05)', phase: 1.5 },
      { cx: 0.5,  cy: 0.8, r: 150, color: 'rgba(245,158,11,0.05)', phase: 3  },
    ];

    let frame;
    let t = 0;

    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ambient glowing orbs
      orbs.forEach(o => {
        const px = o.cx * canvas.width + Math.sin(t * 0.3 + o.phase) * 40;
        const py = o.cy * canvas.height + Math.cos(t * 0.2 + o.phase) * 30;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, o.r);
        grad.addColorStop(0, o.color);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(px, py, o.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Draw connection lines between nearby particles
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.25;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = isDark ? `rgba(99,102,241,${alpha})` : `rgba(99,102,241,${alpha * 1.5})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });

      // Draw and move particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.opacity})`;
        ctx.fill();
      });

      // Draw floating feature text labels with gentle oscillation
      labels.forEach((lb, i) => {
        const px = lb.x * canvas.width;
        const py = lb.y * canvas.height + Math.sin(t * lb.speed * 100 + i) * 12;

        // Pill background
        const metrics = ctx.measureText(lb.text);
        const textW = metrics.width + 28;
        const textH = 32;
        const rx = px - textW / 2;
        const ry = py - textH / 2;

        ctx.beginPath();
        ctx.roundRect(rx, ry, textW, textH, 16);
        ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.85)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(99,102,241,0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = '13px "Inter", sans-serif';
        ctx.fillStyle = isDark ? 'rgba(248,250,252,0.85)' : 'rgba(30, 27, 75, 0.9)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lb.text, px, py);
      });

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

// ==========================================================================
// MAIN HOME COMPONENT
// ==========================================================================
export const Home = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    loginUser, 
    listings, 
    calculateRecommendationScore 
  } = useContext(AppContext);

  // ==== Modal / Auth States ====
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');         // 'signin' | 'create'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');               // Create account: full name
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('tenant'); // tenant | landlord | admin

  // Reset form when modal is closed or mode switches
  const resetForm = () => { setEmail(''); setPhone(''); setPassword(''); setFullName(''); setShowPassword(false); };

  // ==== Tenant Workspace States ====
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [maxBudget, setMaxBudget] = useState(25000);
  const [selectedAmenities, setSelectedAmenities] = useState(['WiFi', 'Hot Water']);
  
  // ==== Tenant Map Interactive States ====
  const [activeListingId, setActiveListingId] = useState(null);
  const [highlightListingId, setHighlightListingId] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);

  // Redirect Landlords and Administrators away from the home page
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'landlord') {
        navigate('/dashboard/landlord');
      } else if (currentUser.role === 'admin') {
        navigate('/dashboard/admin');
      }
    }
  }, [currentUser, navigate]);

  // Handle sign-in form submission
  const handleSignInSubmit = (e) => {
    e.preventDefault();
    // Pass email (or phone fallback) and password to loginUser
    loginUser(email || `${selectedRole}@nestfinder.com`, password || 'password', selectedRole);
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

  // ============================================================
  // GUEST LANDING VIEW — Full-Screen Art + Centered CTA
  // ============================================================
  if (!currentUser) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--bg-app)',
        color: 'var(--text-main)',
        minHeight: '100vh',
        overflow: 'hidden auto',
      }}>

        {/* ──────────────────────────────────────────────────────
            SECTION 1: Full-Screen Hero with Art Background
        ────────────────────────────────────────────────────── */}
        <section 
          id="hero-section"
          style={{ 
            position: 'relative',
            height: '100vh',   /* exactly one screen tall */
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Abstract animated art fills the entire section */}
          <FullScreenArt />

          {/* Adaptive gradient overlay:
              Dark mode → dark tint so white text is readable over the art
              Light mode → lighter tint with slight brightness so it still feels vivid */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'var(--hero-overlay)',
            zIndex: 1,
            pointerEvents: 'none',
          }} />

          {/* Hero content: centred vertically and horizontally */}
          <div className="hero-center-content" style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 1.5rem' }}>

            {/* Badge */}
            <div className="hero-badge animate-fade-in">
              ⚡ DISCOVER BROKER-FREE RENTING IN NEPAL
            </div>

            {/* Main headline */}
            <h1 className="hero-headline animate-fade-in-up">
              Find Your <span className="gradient-text">Perfect Nest</span>
            </h1>

            {/* Sub tagline — minimal text */}
            <p className="hero-sub animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              AI-powered room discovery. Verified landlords. Zero brokers.
            </p>

            {/* PRIMARY CTA — centered, glowing, interactive */}
            <button
              id="hero-signin-btn"
              onClick={() => setIsModalOpen(true)}
              className="hero-cta-btn animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <span>Get Started • Sign In</span>
              <ArrowRight size={20} />
            </button>

            {/* Subtle scroll hint */}
            <div className="scroll-hint animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <ChevronDown size={22} />
              <span>Scroll to explore features</span>
            </div>
          </div>
        </section>

        {/* ──────────────────────────────────────────────────────
            SECTION 2: Scrollable Feature Highlights
        ────────────────────────────────────────────────────── */}
        <section 
          id="features-section"
          style={{ 
            background: 'var(--bg-app)',
            padding: '6rem 0 4rem',
            position: 'relative',
            zIndex: 5
          }}
        >
          {/* Ambient orbs for features section */}
          <div style={{ position: 'absolute', top: '-60px', left: '10%', width: '350px', height: '350px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.07)', filter: 'blur(80px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-40px', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            {/* Section label */}
            <p style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              WHY NESTFINDER
            </p>
            <h2 style={{ 
              textAlign: 'center',
              fontSize: '2.5rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              marginBottom: '1rem',
              lineHeight: 1.2,
            }}>
              Everything you need to find<br />your ideal room
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '4rem', maxWidth: '560px', margin: '0 auto 4rem' }}>
              NestFinder combines interactive maps, AI matching, and verified listings so you can find your perfect place — fast.
            </p>

            {/* Feature cards grid */}
            <div className="features-grid-layout">
              
              {/* Feature 1: Map */}
              <div className="feature-redesign-card">
                <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <Map size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Map-Based Discovery</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  Browse rooms visually on our interactive OpenStreetMap overlay. Choose places instantly based on proximity to your college or transit point.
                </p>
              </div>

              {/* Feature 2: AI */}
              <div className="feature-redesign-card">
                <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                  <Sparkles size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Similarity Matching</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  Set your budget, amenities, and location preference. Our algorithm scores every listing with a percentage match so you see the best first.
                </p>
              </div>

              {/* Feature 3: Verified */}
              <div className="feature-redesign-card">
                <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}>
                  <Shield size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Verified Direct Contact</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  Every landlord is verified. Contact them directly with zero broker commissions and zero hidden service fees.
                </p>
              </div>

            </div>

            {/* Stats row */}
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">Verified Listings</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-number">0%</span>
                <span className="stat-label">Broker Commission</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-number">AI</span>
                <span className="stat-label">Smart Matching</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-number">📍</span>
                <span className="stat-label">Map Integrated</span>
              </div>
            </div>

            {/* CTA repeat at bottom of features */}
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <button
                onClick={() => setIsModalOpen(true)}
                className="hero-cta-btn"
                style={{ display: 'inline-flex' }}
              >
                <span>Start Searching Now</span>
                <ArrowRight size={20} />
              </button>
            </div>

          </div>
        </section>

        {/* ──────────────────────────────────────────────────────
            MODAL: Sign In / Sign Up Form
            Animation matches the original navbar sign-in style
            Now includes: Gmail, Phone Number, Password
        ────────────────────────────────────────────────────── */}
        {/* ════════════════════════════════════════════════════
            MODAL: Sign In / Create Account
            3 role options: Tenant, Landlord, Admin
            Toggle between Sign In and Create Account
        ════════════════════════════════════════════════════ */}
        {isModalOpen && (
          <div 
            className="modal-overlay"
            onClick={() => { setIsModalOpen(false); resetForm(); }}
          >
            <div 
              className="card glass-login-container glass shadow-xl" 
              style={{ 
                width: '100%', 
                maxWidth: '500px', 
                padding: '2.5rem', 
                textAlign: 'left', 
                borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--border-color)', 
                position: 'relative',
                maxHeight: '92vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button 
                type="button"
                onClick={() => { setIsModalOpen(false); resetForm(); }} 
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              {/* Form header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <HomeIcon size={18} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  {/* Title changes based on mode */}
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.2 }}>
                    {authMode === 'signin' ? 'Welcome Back' : 'Join NestFinder'}
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: '0.15rem' }}>
                    {authMode === 'signin' ? 'Sign in to continue your search' : 'Create your free account in seconds'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSignInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>

                {/* ── 3-Option Role Selector ── */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>I am a...</label>
                  {/* 3-column grid for all 3 roles */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>

                    {/* Tenant */}
                    <div 
                      className={`role-radio-card ${selectedRole === 'tenant' ? 'active' : ''}`}
                      onClick={() => setSelectedRole('tenant')}
                    >
                      <span className="role-icon-lg">🙋</span>
                      <strong style={{ fontSize: '0.8rem' }}>Tenant</strong>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>Find rooms</span>
                    </div>

                    {/* Landlord */}
                    <div 
                      className={`role-radio-card ${selectedRole === 'landlord' ? 'active' : ''}`}
                      onClick={() => setSelectedRole('landlord')}
                    >
                      <span className="role-icon-lg">🏢</span>
                      <strong style={{ fontSize: '0.8rem' }}>Landlord</strong>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>List rooms</span>
                    </div>

                    {/* Admin */}
                    <div 
                      className={`role-radio-card ${selectedRole === 'admin' ? 'active' : ''}`}
                      onClick={() => setSelectedRole('admin')}
                    >
                      <span className="role-icon-lg">🛡️</span>
                      <strong style={{ fontSize: '0.8rem' }}>Admin</strong>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-light)' }}>Manage site</span>
                    </div>
                  </div>
                </div>

                {/* ── Full Name — only shown on Create Account ── */}
                {authMode === 'create' && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Full Name</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <User size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-light)', pointerEvents: 'none' }} />
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        required
                        className="form-input" 
                        style={{ width: '100%', paddingLeft: '2.5rem' }} 
                      />
                    </div>
                  </div>
                )}

                {/* ── Gmail / Email ── */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Gmail / Email</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-light)', pointerEvents: 'none' }} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={`${selectedRole}@gmail.com`}
                      required
                      className="form-input" 
                      style={{ width: '100%', paddingLeft: '2.5rem' }} 
                    />
                  </div>
                </div>

                {/* ── Phone Number — only shown on Create Account ── */}
                {authMode === 'create' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-light)', pointerEvents: 'none' }} />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98XXXXXXXX" 
                      className="form-input" 
                      style={{ width: '100%', paddingLeft: '2.5rem' }} 
                    />
                  </div>
                </div>
                )}

                {/* ── Password ── */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-light)', pointerEvents: 'none' }} />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authMode === 'create' ? 'Create a strong password' : 'Enter your password'}
                      required
                      className="form-input" 
                      style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.75rem' }} 
                    />
                    {/* Eye toggle */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: 0 }}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* ── Submit button ── */}
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg glow-btn" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' }}
                >
                  <span>{authMode === 'signin' ? 'Sign In to NestFinder' : 'Create My Account'}</span>
                  <ArrowRight size={18} />
                </button>

                {/* ── Toggle between Sign In / Create Account ── */}
                <div style={{ textAlign: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  {authMode === 'signin' ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                      New here?{' '}
                      <button 
                        type="button"
                        onClick={() => { setAuthMode('create'); resetForm(); }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
                      >
                        Let's create an account →
                      </button>
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                      Already have an account?{' '}
                      <button 
                        type="button"
                        onClick={() => { setAuthMode('signin'); resetForm(); }}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
                      >
                        Sign in instead →
                      </button>
                    </p>
                  )}
                </div>

              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // TENANT WORKSPACE VIEW (logged-in tenant)
  // ============================================================
  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem 5rem 1.5rem' }}>
      
      {/* Tenant Welcome Banner: shows username greeting + bold search headline */}
      <div className="welcome-banner-card animate-fade-in" style={{ marginBottom: '2.5rem' }}>
        {/* Welcome greeting with username */}
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2, marginBottom: '0.3rem' }}>
          Welcome, <span style={{ color: 'var(--primary)' }}>{currentUser.name}</span> 👋
        </h2>
        {/* Bold search begin headline */}
        <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)', margin: 0 }}>
          Let your search begin.
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
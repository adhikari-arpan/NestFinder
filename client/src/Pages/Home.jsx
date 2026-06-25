import React, { useState, useContext, useEffect, useRef } from 'react';//hook import
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
  Lock,
  ArrowLeft,
  X,
  Eye,
  EyeOff,
  Home as HomeIcon,   // renamed to avoid conflict with exported 'Home' component
  ChevronDown
} from 'lucide-react';

// ==========================================================================
// FULL-SCREEN ABSTRACT ART BACKGROUND (Canvas-based, covers entire hero)
// ==========================================================================
const FullScreenArt = () => {     //creates glowing components, particles, background animation
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');  //2D image banuna allow garxa like cirles, line and some animations
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle nodes representing platform features
    const particles = Array.from({ length: 80 }, () => ({  //created moving dots in the background animations
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

    const draw = () => { //this acutally draws the particles, orbs, and labels on the canvas
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
    calculateRecommendationScore,
    theme
  } = useContext(AppContext);  //AppContext bata yo sabbai data yesma aauxa

  
  //==============================================================
  // ==== Tenant Workspace States ====
  //==============================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [maxBudget, setMaxBudget] = useState(25000);
  const [selectedAmenities, setSelectedAmenities] = useState(['WiFi', 'Hot Water']);
  
  // ==== Tenant Map Interactive States ====
  const [activeListingId, setActiveListingId] = useState(null);
  const [highlightListingId, setHighlightListingId] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);


  //==============================================================
  // Redirect Landlords and Administrators away from the home page
  //==============================================================
useEffect(() => {
  if (currentUser) {
    if (currentUser.role === 'tenant') {
      navigate('/dashboard/tenant');
    } else if (currentUser.role === 'landlord') {
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
    
    const isDark = theme === 'dark';
    const dotColor = isDark ? '#818cf8' : '#4f46e5';
    const baseLineAlpha = isDark ? 0.25 : 0.12;

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
        ctx.fillStyle = dotColor;
        ctx.fill();
      });
      dots.forEach((a, i) => dots.slice(i + 1).forEach(b => {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(99,102,241,${baseLineAlpha * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }));
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [currentUser, theme]);



  
  // ============================================================
  // GUEST LANDING VIEW — Full-Screen Art + Centered CTA
  // ============================================================
  if (!currentUser) {
    const isDark = theme === 'dark';
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        background: isDark ? 'linear-gradient(135deg, #090d16 0%, #0d1222 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #eef2f6 100%)',
        color: 'var(--text-main)',
        minHeight: '100vh',
        overflow: 'hidden auto',
      }}>

        {/* Animated network background */}
        <canvas id="networkCanvas" style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          opacity: isDark ? 0.35 : 0.65, pointerEvents: 'none', zIndex: 0
        }} />

        {/* Glowing Blurred Orbs
        <div style={{ 
          position: 'absolute', 
          top: '10%', 
          left: '5%', 
          width: '300px', 
          height: '300px', 
          borderRadius: '50%', 
          background: isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.05)', 
          filter: 'blur(90px)', 
          pointerEvents: 'none' 
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: '15%', 
          right: '5%', 
          width: '350px', 
          height: '350px', 
          borderRadius: '50%', 
          background: isDark ? 'rgba(16, 185, 129, 0.06)' : 'rgba(16, 185, 129, 0.03)', 
          filter: 'blur(100px)', 
          pointerEvents: 'none' 
        }} /> */}

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
            <div>
              <h1 style={{
                fontSize: '4.5rem',
                fontWeight: 900,
                marginBottom: '0.5rem',
                fontFamily: 'var(--font-display)',
                background: 'linear-gradient(135deg, var(--primary) 20%, var(--secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                NestFinder🏠
              </h1>

              <h2 style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                marginBottom: '1rem'
              }}>
                Find your perfect Nest!!!
              </h2>
           </div>
            
            <button
                onClick={() => navigate("/auth")}
                className="btn btn-primary"
            >
                Sign In
            </button>

            {/* Subtle scroll hint */}
            <div className="scroll-hint animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <ChevronDown size={22} />
              <span>Scroll to explore features</span>
            </div>
          </div>
        </div>

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
              WHY NESTFINDER?
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
              NestFinder combines interactive maps, AI recommendations and verified listings so you can find your perfect place — efficiently in safer way.
            </p>

          <div className="features-grid-layout">
            
            <div className="feature-redesign-card glass" style={{ borderLeft: '4px solid var(--primary)', boxShadow: '0 8px 30px rgba(99, 102, 241, 0.08)' }}>
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)' }}>
                <Map size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Map-Based Room Discovery</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Locate flats, rooms, and sharing configurations visually on our interactive open map overlay. Select places instantly based on proximity to colleges and transit points.
              </p>
            </div>

            <div className="feature-redesign-card glass" style={{ borderLeft: '4px solid var(--accent)', boxShadow: '0 8px 30px rgba(245, 158, 11, 0.08)' }}>
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)', boxShadow: '0 0 15px rgba(245, 158, 11, 0.2)' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>AI Similarity Matching</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Specify your exact requirements for max budget, wifi networks, and amenities. Our customized matching algorithm immediately returns percentage scores for all available listings.
              </p>
            </div>

            <div className="feature-redesign-card glass" style={{ borderLeft: '4px solid var(--secondary)', boxShadow: '0 8px 30px rgba(16, 185, 129, 0.08)' }}>
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)' }}>
                <Shield size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Verified Direct Contact</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Every landlord undergoes verification. Reach out directly via telephone or messages with zero broker commissions and zero hidden administrative service fees.
              </p>
            </div>

          </div>
        </div>
      </section>
      </div>);
  }
      return null;
};   
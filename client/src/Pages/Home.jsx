import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
import { RoomCard } from '../components/RoomCard';
import { MapContainer } from '../components/MapContainer';
import {
  Search, Sparkles, MapPin, Award, CheckCircle, Shield, ArrowRight,
  User, Mail, Phone, Map, Filter, Check, Lock, ArrowLeft, X,
  Eye, EyeOff, Home as HomeIcon, ChevronDown
} from 'lucide-react';

// ==========================================================================
// FULL-SCREEN ABSTRACT ART BACKGROUND
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

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
      hue: [260, 160, 45][Math.floor(Math.random() * 3)],
      opacity: Math.random() * 0.6 + 0.2,
    }));

    const labels = [
      { text: '🗺️ Map Discovery', x: 0.15, y: 0.18, speed: 0.0008 },
      { text: '✨ AI Matching',    x: 0.75, y: 0.25, speed: 0.001  },
      { text: '🔒 Verified Rooms', x: 0.55, y: 0.7,  speed: 0.0007 },
      { text: '💰 Budget Filter',  x: 0.2,  y: 0.65, speed: 0.0009 },
      { text: '📍 Pin & Explore',  x: 0.8,  y: 0.6,  speed: 0.0006 },
      { text: '🏠 Broker-Free',    x: 0.4,  y: 0.12, speed: 0.0011 },
    ];

    const orbs = [
      { cx: 0.25, cy: 0.3, r: 180, color: 'rgba(99,102,241,0.07)', phase: 0   },
      { cx: 0.75, cy: 0.6, r: 220, color: 'rgba(16,185,129,0.05)',  phase: 1.5 },
      { cx: 0.5,  cy: 0.8, r: 150, color: 'rgba(245,158,11,0.05)',  phase: 3   },
    ];

    let frame;
    let t = 0;

    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach(o => {
        const px = o.cx * canvas.width  + Math.sin(t * 0.3 + o.phase) * 40;
        const py = o.cy * canvas.height + Math.cos(t * 0.2 + o.phase) * 30;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, o.r);
        grad.addColorStop(0, o.color);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(px, py, o.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.25;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = isDark
              ? `rgba(99,102,241,${alpha})`
              : `rgba(99,102,241,${alpha * 1.5})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},70%,65%,${p.opacity})`;
        ctx.fill();
      });

      labels.forEach((lb, i) => {
        const px = lb.x * canvas.width;
        const py = lb.y * canvas.height + Math.sin(t * lb.speed * 100 + i) * 12;
        const metrics = ctx.measureText(lb.text);
        const textW = metrics.width + 28;
        const textH = 32;
        const rx = px - textW / 2;
        const ry = py - textH / 2;
        ctx.beginPath();
        ctx.roundRect(rx, ry, textW, textH, 16);
        ctx.fillStyle = isDark ? 'rgba(15,23,42,0.55)' : 'rgba(255,255,255,0.85)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(99,102,241,0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.font = '13px "Inter", sans-serif';
        ctx.fillStyle = isDark ? 'rgba(248,250,252,0.85)' : 'rgba(30,27,75,0.9)';
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
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
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
  } = useContext(AppContext);

  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedType, setSelectedType]         = useState('all');
  const [maxBudget, setMaxBudget]               = useState(25000);
  const [selectedAmenities, setSelectedAmenities] = useState(['WiFi', 'Hot Water']);
  const [activeListingId, setActiveListingId]   = useState(null);
  const [highlightListingId, setHighlightListingId] = useState(null);
  const [mapCenter, setMapCenter]               = useState(null);

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'tenant')   navigate('/dashboard/tenant');
      if (currentUser.role === 'landlord') navigate('/dashboard/landlord');
      if (currentUser.role === 'admin')    navigate('/dashboard/admin');
    }
  }, [currentUser, navigate]);

  // Animated network background canvas (guest view only)
  useEffect(() => {
    if (currentUser) return;
    const canvas = document.getElementById('networkCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const isDark        = theme === 'dark';
    const dotColor      = isDark ? '#818cf8' : '#4f46e5';
    const baseLineAlpha = isDark ? 0.25 : 0.12;

    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 3 + 1,
    }));

    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width)  d.vx *= -1;
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
  // GUEST LANDING VIEW
  // ============================================================
  if (!currentUser) {
    const isDark = theme === 'dark';

    return (
      <div
        className="flex flex-col min-h-screen overflow-x-hidden overflow-y-auto"
        style={{
          background: isDark
            ? 'linear-gradient(135deg,#090d16 0%,#0d1222 100%)'
            : 'linear-gradient(135deg,#f8fafc 0%,#eef2f6 100%)',
          color: 'var(--text-main)',
        }}
      >

        {/* Animated network background canvas */}
        <canvas
          id="networkCanvas"
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
          style={{ opacity: isDark ? 0.35 : 0.65 }}
        />

        {/* ── SECTION 1: Hero ── */}
        <div
          className="container relative z-[5] grid gap-12 items-center pt-20 pb-16"
          style={{ gridTemplateColumns: '1.1fr 0.9fr' }}
        >
          {/* Hero text */}
          <div className="animate-fade-in flex flex-col items-start text-left gap-6">
            <div>
              <h1
                className="text-[4.5rem] font-black mb-2"
                style={{
                  fontFamily: 'var(--font-display)',
                  background: 'linear-gradient(135deg,var(--primary) 20%,var(--secondary) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                NestFinder🏠
              </h1>

              <h2 className="text-[2rem] font-bold text-text-main mb-4">
                Find your perfect Nest!!!
              </h2>
            </div>

            <button
              onClick={() => navigate("/auth")}
              className="btn btn-primary"
            >
              Sign In
            </button>

            <div className="scroll-hint animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <ChevronDown size={22} />
              <span>Scroll to explore features</span>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Feature Highlights ── */}
        <section
          id="features-section"
          className="relative z-[5] py-24 pb-16"
          style={{ background: 'var(--bg-app)' }}
        >
          {/* Ambient orbs */}
          <div className="absolute -top-[60px] left-[10%] w-[350px] h-[350px] rounded-full pointer-events-none"
            style={{ background: 'rgba(99,102,241,0.07)', filter: 'blur(80px)' }} />
          <div className="absolute -bottom-[40px] right-[10%] w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{ background: 'rgba(16,185,129,0.06)', filter: 'blur(80px)' }} />

          <div className="container relative z-[1]">

            {/* Section label */}
            <p className="text-center text-[0.8rem] font-bold tracking-[0.12em] text-primary uppercase mb-3">
              WHY NESTFINDER?
            </p>

            <h2
              className="text-center text-[2.5rem] font-extrabold leading-tight mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Everything you need to find<br />your ideal room
            </h2>

            <p className="text-center text-text-muted text-[1.05rem] max-w-[560px] mx-auto mb-16">
              NestFinder combines interactive maps, AI recommendations and verified listings
              so you can find your perfect place — efficiently in a safer way.
            </p>

            {/* Feature cards grid */}
            <div className="features-grid-layout">

              <div
                className="feature-redesign-card glass"
                style={{
                  borderLeft: '4px solid var(--primary)',
                  boxShadow: '0 8px 30px rgba(99,102,241,0.08)',
                }}
              >
                <div
                  className="feature-icon-wrapper"
                  style={{
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    boxShadow: '0 0 15px rgba(99,102,241,0.2)',
                  }}
                >
                  <Map size={24} />
                </div>
                <h3 className="text-[1.25rem] font-bold text-text-main">Map-Based Room Discovery</h3>
                <p className="text-text-muted text-[0.92rem] leading-relaxed">
                  Locate flats, rooms, and sharing configurations visually on our interactive open
                  map overlay. Select places instantly based on proximity to colleges and transit points.
                </p>
              </div>

              <div
                className="feature-redesign-card glass"
                style={{
                  borderLeft: '4px solid var(--accent)',
                  boxShadow: '0 8px 30px rgba(245,158,11,0.08)',
                }}
              >
                <div
                  className="feature-icon-wrapper"
                  style={{
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent)',
                    boxShadow: '0 0 15px rgba(245,158,11,0.2)',
                  }}
                >
                  <Sparkles size={24} />
                </div>
                <h3 className="text-[1.25rem] font-bold text-text-main">AI Similarity Matching</h3>
                <p className="text-text-muted text-[0.92rem] leading-relaxed">
                  Specify your exact requirements for max budget, wifi networks, and amenities.
                  Our customized matching algorithm immediately returns percentage scores for all
                  available listings.
                </p>
              </div>

              <div
                className="feature-redesign-card glass"
                style={{
                  borderLeft: '4px solid var(--secondary)',
                  boxShadow: '0 8px 30px rgba(16,185,129,0.08)',
                }}
              >
                <div
                  className="feature-icon-wrapper"
                  style={{
                    backgroundColor: 'var(--secondary-light)',
                    color: 'var(--secondary)',
                    boxShadow: '0 0 15px rgba(16,185,129,0.2)',
                  }}
                >
                  <Shield size={24} />
                </div>
                <h3 className="text-[1.25rem] font-bold text-text-main">Verified Direct Contact</h3>
                <p className="text-text-muted text-[0.92rem] leading-relaxed">
                  Every landlord undergoes verification. Reach out directly via telephone or messages
                  with zero broker commissions and zero hidden administrative service fees.
                </p>
              </div>

            </div>
          </div>
        </section>

      </div>
    );
  }

  return null;
};
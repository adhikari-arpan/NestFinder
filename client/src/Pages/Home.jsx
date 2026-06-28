import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
import {
  Sparkles, Shield, ArrowRight,
  Map, Filter, Check, Search, ChevronDown
} from 'lucide-react';
import { RoomCard } from '../components/RoomCard';
import { MapContainer } from '../components/MapContainer';

// ─── Animated Canvas ──────────────────────────────────────────────────────────
const NetworkBackground = ({ theme }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const isDark = theme === 'dark';
    const dots = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
      color: Math.random() > 0.5 ? '99,102,241' : '16,185,129',
    }));
    const houses = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
      size: Math.random() * 14 + 10, opacity: Math.random() * 0.1 + 0.05,
    }));
    const drawHouse = (x, y, size, opacity) => {
      ctx.save(); ctx.globalAlpha = opacity;
      ctx.strokeStyle = 'rgba(99,102,241,1)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size, y); ctx.lineTo(x - size, y); ctx.closePath(); ctx.stroke();
      ctx.strokeRect(x - size * 0.7, y, size * 1.4, size * 1.1);
      ctx.strokeRect(x - size * 0.2, y + size * 0.5, size * 0.4, size * 0.6);
      ctx.restore();
    };
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
      });
      houses.forEach(h => {
        h.x += h.vx; h.y += h.vy;
        if (h.x < 0 || h.x > canvas.width) h.vx *= -1;
        if (h.y < 0 || h.y > canvas.height) h.vy *= -1;
      });
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dist = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * (isDark ? 0.18 : 0.1);
            ctx.beginPath(); ctx.strokeStyle = `rgba(99,102,241,${alpha})`; ctx.lineWidth = 0.8;
            ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke();
          }
        }
      }
      dots.forEach(d => {
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${d.color},${isDark ? 0.55 : 0.35})`; ctx.fill();
      });
      houses.forEach(h => drawHouse(h.x, h.y, h.size, h.opacity));
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, [theme]);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const Home = () => {
  const navigate = useNavigate();
  const { currentUser, listings, calculateRecommendationScore, theme } = useContext(AppContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [maxBudget, setMaxBudget] = useState(25000);
  const [selectedAmenities, setSelectedAmenities] = useState(['WiFi', 'Hot Water']);
  const [activeListingId, setActiveListingId] = useState(null);
  const [highlightListingId, setHighlightListingId] = useState(null);

  useEffect(() => {
    if (currentUser?.role === 'tenant') navigate('/dashboard/tenant');
    else if (currentUser?.role === 'landlord') navigate('/dashboard/landlord');
    else if (currentUser?.role === 'admin') navigate('/dashboard/admin');
  }, [currentUser, navigate]);

  const handleAmenityToggle = (a) =>
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const handleMarkerClick = (id) => {
    setActiveListingId(id);
    document.getElementById(`room-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const scoredListings = listings
    .filter(l => l.status === 'verified' &&
      (searchQuery === '' || l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.location.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedType === 'all' || l.type === selectedType) &&
      l.price <= maxBudget &&
      selectedAmenities.every(a => l.amenities.includes(a))
    )
    .map(l => ({ ...l, matchScore: calculateRecommendationScore(l, { budget: maxBudget, preferredCity: l.city, sharing: 'Single', roomType: selectedType === 'all' ? l.type : selectedType, essentialAmenities: selectedAmenities, poiCollege: '' }) }))
    .sort((a, b) => b.matchScore - a.matchScore);

  const isDark = theme === 'dark';

  // ── GUEST VIEW ──────────────────────────────────────────────────────────────
  if (!currentUser) return (
    <div style={{ display: 'flex', flexDirection: 'column', color: 'var(--text-main)', overflowX: 'hidden' }}>

      {/* ── HERO SECTION — full viewport height ── */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '5rem 1.5rem 3rem',
        overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(135deg,#090d16 0%,#0d1222 60%,#0a1a12 100%)'
          : 'linear-gradient(135deg,#f0f4ff 0%,#fafbff 100%)',
      }}>
        <NetworkBackground theme={theme} />

        {/* Ambient orbs */}
        <div style={{ position: 'absolute', top: '15%', left: '8%', width: '400px', height: '400px', borderRadius: '50%', background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)', filter: 'blur(100px)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: '320px', height: '320px', borderRadius: '50%', background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)', filter: 'blur(90px)', pointerEvents: 'none', zIndex: 1 }} />

        {/* Hero content */}
        <div className="animate-fade-in" style={{ position: 'relative', zIndex: 5, maxWidth: '740px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem' }}>

          <span className="hero-badge">🏠 Nepal's Rental Network</span>

          <h1 className="hero-headline">
            Find your{' '}
            <span className="gradient-text">perfect Nest</span>
          </h1>

          <p className="hero-sub">
            Verified rooms across Kathmandu valley. AI-powered recommendations. Map-based search near colleges, hospitals &amp; transit — zero broker fees.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.6rem' }}>
            {['✅ Verified listings', '🤖 AI match scoring', '🗺️ Map-based search', '🚫 Zero broker fees'].map((f, i) => (
              <span key={i} style={{
                padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.07)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.15)'}`,
                color: isDark ? '#cbd5e1' : '#4338ca',
              }}>{f}</span>
            ))}
          </div>

          {/* CTA — links directly to /auth */}
          <Link to="/auth" className="hero-cta-btn" style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
            Get Started • Sign In <ArrowRight size={18} />
          </Link>

          {/* Scroll hint */}
          <div className="scroll-hint">
            <ChevronDown size={20} />
            <span>Scroll to explore features</span>
          </div>
        </div>

        {/* Stats bar pinned near bottom of hero */}
        <div className="container" style={{ position: 'relative', zIndex: 5, marginTop: '3.5rem', width: '100%' }}>
          <div className="stats-row">
            <div className="stat-item"><div className="stat-number">500+</div><div className="stat-label">Active Listings</div></div>
            <div className="stat-divider" />
            <div className="stat-item"><div className="stat-number">3</div><div className="stat-label">Cities Covered</div></div>
            <div className="stat-divider" />
            <div className="stat-item"><div className="stat-number">98%</div><div className="stat-label">Verified Landlords</div></div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION — next scroll page ── */}
      <section style={{
        position: 'relative',
        padding: '8rem 0 9rem',
        background: isDark
          ? 'linear-gradient(180deg,#0d1222 0%,#090d16 100%)'
          : 'linear-gradient(180deg,#ffffff 0%,#f8faff 100%)',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.08)'}`,
      }}>
        {/* Orbs */}
        <div style={{ position: 'absolute', top: '-80px', left: '10%', width: '380px', height: '380px', borderRadius: '50%', background: 'rgba(99,102,241,0.06)', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '10%', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(16,185,129,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>

          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              WHY NESTFINDER?
            </p>
            <h2 style={{
              fontSize: 'clamp(1.9rem, 4vw, 2.8rem)', fontWeight: 800,
              color: isDark ? '#f1f5f9' : '#0f172a',
              marginBottom: '1.25rem', lineHeight: 1.2,
              fontFamily: 'var(--font-display)'
            }}>
              Everything you need to find<br />your ideal room
            </h2>
            <p style={{ fontSize: '1.05rem', color: isDark ? '#94a3b8' : '#475569', maxWidth: '520px', margin: '0 auto', lineHeight: 1.75 }}>
              NestFinder combines interactive maps, AI recommendations and verified listings so you can find your perfect place — efficiently and safely.
            </p>
          </div>

          {/* Feature cards */}
          <div className="features-grid-layout">
            {[
              {
                icon: <Map size={24} />, color: 'var(--primary)', bg: 'var(--primary-light)',
                border: 'var(--primary)', shadow: 'rgba(99,102,241,0.1)',
                title: 'Map-Based Room Discovery',
                desc: 'Locate flats, rooms, and sharing configurations visually on our interactive open map. Select places instantly based on proximity to colleges and transit points.'
              },
              {
                icon: <Sparkles size={24} />, color: 'var(--accent)', bg: 'var(--accent-light)',
                border: 'var(--accent)', shadow: 'rgba(245,158,11,0.1)',
                title: 'AI Similarity Matching',
                desc: 'Specify your exact requirements for max budget, WiFi, and amenities. Our matching algorithm returns percentage scores for all available listings instantly.'
              },
              {
                icon: <Shield size={24} />, color: 'var(--secondary)', bg: 'var(--secondary-light)',
                border: 'var(--secondary)', shadow: 'rgba(16,185,129,0.1)',
                title: 'Verified Direct Contact',
                desc: 'Every landlord undergoes verification. Reach out directly via telephone or messages with zero broker commissions and no hidden fees whatsoever.'
              },
            ].map(({ icon, color, bg, border, shadow, title, desc }) => (
              <div key={title} className="feature-redesign-card glass" style={{ borderLeft: `4px solid ${border}`, boxShadow: `0 8px 30px ${shadow}` }}>
                <div className="feature-icon-wrapper" style={{ backgroundColor: bg, color, boxShadow: `0 0 15px ${shadow}` }}>
                  {icon}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: isDark ? '#f1f5f9' : '#0f172a', margin: 0 }}>{title}</h3>
                <p style={{ color: isDark ? '#94a3b8' : '#475569', fontSize: '0.93rem', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div style={{ textAlign: 'center', marginTop: '5rem' }}>
            <Link to="/auth" className="hero-cta-btn" style={{ textDecoration: 'none' }}>
              Start Finding Rooms <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );

  return null;
};
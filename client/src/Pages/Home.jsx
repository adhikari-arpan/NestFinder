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

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 size-full"
    />
  );
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
    .map(l => ({ ...l, matchScore: calculateRecommendationScore(l, { budget: maxBudget, preferredCity: l.city, sharing: 'Single', roomType: selectedType === 'all' ? l.type : selectedType, essentialAmenities: selectedAmenities, poiLocation: null }) }))
    .sort((a, b) => b.matchScore - a.matchScore);

  const isDark = theme === 'dark';

  // ── GUEST VIEW ──────────────────────────────────────────────────────────────
  if (!currentUser) return (
    <div className="flex flex-col text-[var(--text-main)]">

      {/* ── HERO SECTION ── */}
      <section className={[
        'relative min-h-[calc(100vh-70px)] flex flex-col items-center justify-center',
        'text-center px-6 pt-20 pb-32',
        isDark
          ? 'bg-[linear-gradient(135deg,#090d16_0%,#0d1222_60%,#0a1a12_100%)]'
          : 'bg-[linear-gradient(135deg,#f0f4ff_0%,#fafbff_100%)]',
      ].join(' ')}>

        <NetworkBackground theme={theme} />

        {/* Ambient orbs */}
        <div className="pointer-events-none absolute top-[15%] left-[8%] z-[1] size-[400px] rounded-full"
          style={{ background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)', filter: 'blur(100px)' }} />
        <div className="pointer-events-none absolute right-[8%] bottom-[20%] z-[1] size-[320px] rounded-full"
          style={{ background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.05)', filter: 'blur(90px)' }} />

        {/* Hero content */}
        <div className="animate-fade-in relative z-[5] flex max-w-[740px] flex-col items-center gap-7">

          <span className="hero-badge">🏠 Nepal's Rental Network</span>

          <h1 className="hero-headline">
            Find your{' '}
            <span className="gradient-text">perfect Nest</span>
          </h1>

          <p className="hero-sub">
            Verified rooms across Kathmandu valley. AI-powered recommendations. Map-based search near colleges, hospitals &amp; transit — zero broker fees.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-[0.6rem]">
            {['✅ Verified listings', '🤖 AI match scoring', '🗺️ Map-based search', '🚫 Zero broker fees'].map((f, i) => (
              <span
                key={i}
                className="rounded-full px-4 py-[0.4rem] text-[0.8rem] font-semibold"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.07)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.15)'}`,
                  color: isDark ? '#cbd5e1' : '#4338ca',
                }}
              >
                {f}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Link to="/auth" className="hero-cta-btn mt-2" style={{ textDecoration: 'none'}}>
            Get Started • Sign In <ArrowRight size={18} />
          </Link>

          {/* Scroll hint */}
          <div className="scroll-hint">
            <ChevronDown size={20} />
            <span>Scroll to explore features</span>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-[5] container mt-14 w-full" style={{ marginBottom: '40px' }}>
          <div className="stats-row">
            <div className="stat-item"><div className="stat-number">10+</div><div className="stat-label">Active Listings</div></div>
            <div className="stat-divider" />
            <div className="stat-item"><div className="stat-number">3</div><div className="stat-label">Cities Covered</div></div>
            <div className="stat-divider" />
            <div className="stat-item"><div className="stat-number">98%</div><div className="stat-label">Verified Landlords</div></div>
          </div>
        </div>
      </section>

      {/* Spacer to guarantee visible gap regardless of external CSS on stats-row */}
      <div className="w-full bg-transparent" style={{ height: '32px' }} />

      {/* ── FEATURES SECTION ── */}
      <section
        className="relative py-36"
        style={{
          background: isDark
            ? 'linear-gradient(180deg,#0d1222 0%,#090d16 100%)'
            : 'linear-gradient(180deg,#ffffff 0%,#f8faff 100%)',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.08)'}`,
        }}
      >
        {/* Orbs */}
        <div className="pointer-events-none absolute -top-20 left-[10%] size-[380px] rounded-full"
          style={{ background: 'rgba(99,102,241,0.06)', filter: 'blur(90px)' }} />
        <div className="pointer-events-none absolute right-[10%] -bottom-16 size-[320px] rounded-full"
          style={{ background: 'rgba(16,185,129,0.05)', filter: 'blur(80px)' }} />

        <div className="relative z-[1] container" style={{ marginLeft: 'auto', marginRight: 'auto' }}>

          {/* Section header */}
          <div
            className="text-center"
            style={{ marginBottom: '60px', marginLeft: 'auto', marginRight: 'auto', maxWidth: '640px', width: '100%', textAlign: 'center' }}
          >
            <p className="mb-4 text-[0.78rem] font-bold tracking-[0.14em] text-[var(--primary)] uppercase">
              WHY NESTFINDER?
            </p>
            <h2
              className="text-[clamp(1.9rem,4vw,2.8rem)] leading-tight font-extrabold"
              style={{
                color: isDark ? '#f1f5f9' : '#0f172a',
                fontFamily: 'var(--font-display)',
                marginBottom: '36px',
              }}
            >
              Everything you need to find<br />your ideal room
            </h2>
            <p
              className="mx-auto max-w-[520px] text-center text-[1.05rem]"
              style={{ color: isDark ? '#94a3b8' : '#475569', lineHeight: '1.9', marginTop: '0px' }}
            >
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
              <div
                key={title}
                className="feature-redesign-card glass"
                style={{ borderLeft: `4px solid ${border}`, boxShadow: `0 8px 30px ${shadow}` }}
              >
                <div
                  className="feature-icon-wrapper"
                  style={{ backgroundColor: bg, color, boxShadow: `0 0 15px ${shadow}` }}
                >
                  {icon}
                </div>
                <h3
                  className="m-0 text-[1.15rem] font-bold"
                  style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
                >
                  {title}
                </h3>
                <p
                  className="m-0 text-[0.93rem] leading-[1.7]"
                  style={{ color: isDark ? '#94a3b8' : '#475569' }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <Link to="/auth" className="hero-cta-btn" style={{ textDecoration: 'none', position: 'relative',bottom:'20px' }}>
              Start Finding Rooms <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );

  return null;
};
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
import { Home, User, Lock, Mail, Phone, ChevronRight, Eye, EyeOff } from 'lucide-react';

// --- Animated Canvas Background ---
const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animFrame;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Nodes representing rooms/connections on the rental network
    const NODE_COUNT = 55;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 3 + 1.5,
      // Mix of indigo and emerald tones matching NestFinder palette
      color: Math.random() > 0.5 ? '99,102,241' : '16,185,129',
    }));

    // House-shaped icon nodes (larger, slower)
    const HOUSE_COUNT = 6;
    const houseNodes = Array.from({ length: HOUSE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      size: Math.random() * 12 + 10,
      opacity: Math.random() * 0.12 + 0.06,
    }));

    const drawHouse = (ctx, x, y, size, opacity) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = 'rgba(99,102,241,1)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Roof
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x - size, y);
      ctx.closePath();
      ctx.stroke();
      // Walls
      ctx.strokeRect(x - size * 0.7, y, size * 1.4, size * 1.1);
      // Door
      ctx.strokeRect(x - size * 0.2, y + size * 0.5, size * 0.4, size * 0.6);
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move and bounce nodes
      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      houseNodes.forEach(h => {
        h.x += h.vx;
        h.y += h.vy;
        if (h.x < 0 || h.x > canvas.width) h.vx *= -1;
        if (h.y < 0 || h.y > canvas.height) h.vy *= -1;
      });

      // Draw connecting lines between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99,102,241,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color},0.55)`;
        ctx.fill();
      });

      // Draw floating house icons
      houseNodes.forEach(h => drawHouse(ctx, h.x, h.y, h.size, h.opacity));

      animFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

// --- Main Auth Component ---
export const Auth = () => {
  const { currentUser, loginUser } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('login');
  const [selectedRole, setSelectedRole] = useState('tenant');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'tenant') navigate('/dashboard/tenant');
      else if (currentUser.role === 'landlord') navigate('/dashboard/landlord');
      else if (currentUser.role === 'admin') navigate('/dashboard/admin');
    }
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'login') {
      loginUser(email || `${selectedRole}@nestfinder.com`, password || 'password', selectedRole);
    } else {
      if (!name || !email || !password || !phone) {
        alert("Please fill all signup fields.");
        return;
      }
      loginUser(email, password, selectedRole);
    }
  };

  const inputStyle = {
    width: '100%',
    paddingLeft: '2.5rem',
    paddingRight: '2.5rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
    height: '44px',
    outline: 'none',
    transition: 'border 0.2s',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #0d1117 50%, #0a1a12 100%)',
      padding: '2rem 1rem',
    }}>

      {/* Animated canvas background */}
      <AnimatedBackground />

      {/* Soft radial glow behind card */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Floating text — left side, only on wider screens */}
      <div style={{
        position: 'absolute',
        left: '6%',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        maxWidth: '280px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }} className="auth-floating-text">
        <div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(16,185,129,0.8)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Nepal's Rental Network
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', lineHeight: 1.2 }}>
            Find your<br />
            <span style={{ color: 'rgba(99,102,241,0.9)' }}>perfect Nest</span>
          </div>
        </div>
        {[
          { icon: '🏠', text: 'Verified room listings across Kathmandu valley' },
          { icon: '🤖', text: 'AI-powered recommendations for your budget' },
          { icon: '🗺️', text: 'Map-based search with nearby colleges & hospitals' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
            <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Floating text — right side */}
      <div style={{
        position: 'absolute',
        right: '6%',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        maxWidth: '220px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
      }} className="auth-floating-text">
        {[
          { num: '500+', label: 'Active Listings' },
          { num: '3', label: 'Cities Covered' },
          { num: '98%', label: 'Verified Landlords' },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'rgba(99,102,241,0.85)' }}>{stat.num}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Auth Card */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          }}>
            <Home size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'rgba(255,255,255,0.92)', margin: 0 }}>NestFinder</h2>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Kathmandu's trusted rental platform</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '4px', marginBottom: '1.5rem' }}>
          {['login', 'signup'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, padding: '0.55rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.2s',
              background: activeTab === tab ? 'rgba(99,102,241,0.85)' : 'transparent',
              color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.45)',
            }}>
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Role selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[{ val: 'tenant', label: '🙋 Tenant' }, { val: 'landlord', label: '🏢 Landlord' }, { val: 'admin', label: '🛡️ Admin' }].map(r => (
            <button key={r.val} type="button" onClick={() => setSelectedRole(r.val)} style={{
              flex: 1, padding: '0.5rem', border: `1px solid ${selectedRole === r.val ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.2s',
              background: selectedRole === r.val ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: selectedRole === r.val ? 'rgba(99,102,241,1)' : 'rgba(255,255,255,0.45)',
            }}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {activeTab === 'signup' && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User size={15} style={{ position: 'absolute', left: '12px', color: 'rgba(255,255,255,0.35)' }} />
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Full Name" required className="form-input" style={inputStyle} />
            </div>
          )}

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Mail size={15} style={{ position: 'absolute', left: '12px', color: 'rgba(255,255,255,0.35)' }} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email address" className="form-input" style={inputStyle} />
          </div>

          {/* PASSWORD — shown on both login and signup */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Lock size={15} style={{ position: 'absolute', left: '12px', color: 'rgba(255,255,255,0.35)' }} />
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" required className="form-input" style={inputStyle} />
            <button type="button" onClick={() => setShowPassword(p => !p)} style={{
              position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 0,
            }}>
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {activeTab === 'signup' && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Phone size={15} style={{ position: 'absolute', left: '12px', color: 'rgba(255,255,255,0.35)' }} />
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="Phone: 98XXXXXXXX" required className="form-input" style={inputStyle} />
            </div>
          )}

          <button type="submit" style={{
            width: '100%', padding: '0.75rem', border: 'none', borderRadius: '10px', cursor: 'pointer',
            background: 'linear-gradient(135deg, #6366f1, #10b981)',
            color: 'white', fontWeight: 700, fontSize: '0.95rem', marginTop: '0.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
            boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
          }}>
            {activeTab === 'login' ? 'Sign In' : 'Create Account'}
            <ChevronRight size={17} />
          </button>
        </form>

        {/* Switch tab */}
        <div style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
          {activeTab === 'login' ? (
            <span>No account? <button onClick={() => setActiveTab('signup')} style={{ background: 'none', border: 'none', color: 'rgba(99,102,241,0.9)', fontWeight: 700, cursor: 'pointer' }}>Register here</button></span>
          ) : (
            <span>Already registered? <button onClick={() => setActiveTab('login')} style={{ background: 'none', border: 'none', color: 'rgba(99,102,241,0.9)', fontWeight: 700, cursor: 'pointer' }}>Sign in</button></span>
          )}
        </div>

      </div>

      {/* Hide floating text on small screens */}
      <style>{`
        @media (max-width: 1024px) {
          .auth-floating-text { display: none !important; }
        }
        .form-input:focus {
          border-color: rgba(99,102,241,0.6) !important;
          background: rgba(99,102,241,0.08) !important;
        }
      `}</style>
    </div>
  );
};
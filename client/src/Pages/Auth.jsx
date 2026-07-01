import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from "../Context/AppContext";
import logo from '../assets/NestFinder Logo.png';
import { Home, User, Lock, Mail, Phone, ChevronRight, Eye, EyeOff } from 'lucide-react';

// --- Animated Canvas Background ---
const AnimatedBackground = ({ theme }) => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animFrame;
    const isDark = theme === 'dark';
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 3 + 1.5, color: Math.random() > 0.5 ? '99,102,241' : '16,185,129',
    }));
    const houseNodes = Array.from({ length: 6 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15,
      size: Math.random() * 12 + 10, opacity: Math.random() * 0.12 + 0.06,
    }));
    const drawHouse = (ctx, x, y, size, opacity) => {
      ctx.save(); ctx.globalAlpha = opacity;
      ctx.strokeStyle = isDark ? 'rgba(99,102,241,1)' : 'rgba(79,70,229,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size, y); ctx.lineTo(x - size, y); ctx.closePath(); ctx.stroke();
      ctx.strokeRect(x - size * 0.7, y, size * 1.4, size * 1.1);
      ctx.strokeRect(x - size * 0.2, y + size * 0.5, size * 0.4, size * 0.6);
      ctx.restore();
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => { n.x += n.vx; n.y += n.vy; if (n.x < 0 || n.x > canvas.width) n.vx *= -1; if (n.y < 0 || n.y > canvas.height) n.vy *= -1; });
      houseNodes.forEach(h => { h.x += h.vx; h.y += h.vy; if (h.x < 0 || h.x > canvas.width) h.vx *= -1; if (h.y < 0 || h.y > canvas.height) h.vy *= -1; });
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < 130) { ctx.beginPath(); ctx.strokeStyle = `rgba(99,102,241,${(1 - dist / 130) * (isDark ? 0.18 : 0.16)})`; ctx.lineWidth = 0.8; ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke(); }
      }
      nodes.forEach(n => { ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(${n.color},${isDark ? 0.55 : 0.5})`; ctx.fill(); });
      houseNodes.forEach(h => drawHouse(ctx, h.x, h.y, h.size, isDark ? h.opacity : h.opacity * 1.8));
      animFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animFrame); window.removeEventListener('resize', resize); };
  }, [theme]);
  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" />;
};

// --- Input Field ---
const InputField = ({ icon: Icon, type, value, onChange, placeholder, required, right, isDark }) => (
  <div className="relative flex items-center w-full">
    <span className="absolute left-0 top-0 h-full w-11 flex items-center justify-center pointer-events-none">
      <Icon size={16} style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(79,70,229,0.6)' }} />
    </span>
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
      style={{
        background: isDark ? 'rgba(255,255,255,0.055)' : 'rgba(99,102,241,0.05)',
        border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(99,102,241,0.18)'}`,
        color: isDark ? 'rgba(255,255,255,0.92)' : '#1e1b4b',
        paddingLeft: '3rem',
        paddingRight: '2.75rem',
        textAlign: 'left',
      }}
      className="w-full h-[54px] rounded-xl text-[0.9rem] outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/25"
    />
    {right && <div className="absolute right-4 flex items-center">{right}</div>}
  </div>
);

export const Auth = () => {
  const { currentUser, loginUser, signupUser, theme } = useContext(AppContext);
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState('login');
  const [selectedRole, setSelectedRole] = useState('tenant');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'tenant') navigate('/dashboard/tenant');
    if (currentUser.role === 'landlord') navigate('/dashboard/landlord');
    if (currentUser.role === 'admin') navigate('/dashboard/admin');
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMsg({ text: '', type: '' }); // clear previous message

    if (activeTab === 'login') {
      if (!email || !password) {
        setFormMsg({ text: 'Please fill in email and password.', type: 'error' });
        return;
      }
      const result = await loginUser(email, password);
      if (result && !result.success) {
        setFormMsg({ text: result.message, type: 'error' });
      }
    } else {
      if (!name || !email || !password || !phone) {
        setFormMsg({ text: 'Please fill all signup fields.', type: 'error' });
        return;
      }
      const result = await signupUser(email, password, name, phone, selectedRole);
      setFormMsg({ text: result.message, type: result.success ? 'success' : 'error' });
    }
  };

  const roles = [{ val: 'tenant', label: '🙋 Tenant' }, { val: 'landlord', label: '🏢 Landlord' }, { val: 'admin', label: '🛡️ Admin' }];
  const features = [{ icon: '🏠', text: 'Verified room listings across Kathmandu valley' }, { icon: '🤖', text: 'AI-powered recommendations for your budget' }, { icon: '🗺️', text: 'Map-based search with nearby colleges & hospitals' }];
  const stats = [{ num: '500+', label: 'Active Listings' }, { num: '3', label: 'Cities Covered' }, { num: '98%', label: 'Verified Landlords' }];

  // Switching between dark and white modes
  const pageBg = isDark ? 'linear-gradient(135deg,#090d16 0%,#0d1117 60%,#0a1a12 100%)' : 'linear-gradient(135deg,#f0f4ff 0%,#fafbff 60%,#f0fdf4 100%)';
  const cardBg = isDark ? 'rgba(255,255,255,0.042)' : 'rgba(255,255,255,0.9)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(99,102,241,0.16)';
  const cardShadow = isDark ? '0 32px 80px rgba(0,0,0,0.6)' : '0 20px 60px rgba(99,102,241,0.13), 0 4px 20px rgba(0,0,0,0.05)';
  const tabBarBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.07)';
  const headingColor = isDark ? 'rgba(255,255,255,0.92)' : '#1e1b4b';
  const subColor = isDark ? 'rgba(255,255,255,0.4)' : '#4338ca';
  const switchColor = isDark ? 'rgba(255,255,255,0.4)' : '#374151';
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.10)';
  const linkColor = isDark ? '#818cf8' : '#4f46e5';
  const tabInactiveColor = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(67,56,202,0.65)';
  const roleActiveText = isDark ? '#c7d2fe' : '#4338ca';
  const roleInactiveText = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(67,56,202,0.6)';

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-10 px-4"
      style={{ background: pageBg }}>

      <AnimatedBackground theme={theme} />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none z-[1]"
        style={{ background: isDark ? 'radial-gradient(circle,rgba(99,102,241,0.10) 0%,transparent 70%)' : 'radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%)' }} />

      {/* Left panel */}
      <div className="absolute left-[6%] top-1/2 -translate-y-1/2 z-[2] max-w-[260px] hidden xl:flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-[0.68rem] tracking-[0.18em] font-bold uppercase"
            style={{ color: isDark ? 'rgba(52,211,153,0.8)' : '#059669' }}>Nepal's Rental Network</p>
          <h1 className="text-[2rem] font-extrabold leading-[1.2]" style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#1e1b4b' }}>
            Find your<br /><span style={{ color: isDark ? '#818cf8' : '#4f46e5' }}>perfect Nest</span>
          </h1>
        </div>
        <div className="w-8 h-[2px] rounded-full" style={{ background: isDark ? '#818cf8' : '#4f46e5', opacity: 0.4 }} />
        <div className="flex flex-col gap-5">
          {features.map((f, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-base mt-0.5 shrink-0">{f.icon}</span>
              <span className="text-[0.81rem] leading-relaxed" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#475569' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="absolute right-[6%] top-1/2 -translate-y-1/2 z-[2] max-w-[200px] hidden xl:flex flex-col gap-7">
        {stats.map((s, i) => (
          <div key={i} className="text-right">
            <p className="text-[1.75rem] font-extrabold leading-none" style={{ color: isDark ? 'rgba(129,140,248,0.85)' : '#4f46e5' }}>{s.num}</p>
            <p className="text-[0.72rem] font-medium tracking-wide mt-0.5" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : '#64748b' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Card ── */}
      <div className="relative z-[3] w-full max-w-[420px] rounded-2xl border backdrop-blur-2xl animate-modal-enter"
        style={{ background: cardBg, borderColor: cardBorder, boxShadow: cardShadow, padding: '2.75rem 2.25rem 2.5rem' }}>

        {/* Logo */}
        <div className="flex flex-col items-center gap-3" style={{ marginBottom: '2.75rem' }}>
          <img src={logo} alt="NestFinder" style={{ height: '100px', width: 'auto' }} />
          <h2 className="text-[1.35rem] font-extrabold m-0 tracking-tight" style={{ color: headingColor }}>NestFinder</h2>
          <p className="text-[0.75rem] m-0 font-medium" style={{ color: subColor }}>Nepals's trusted rental platform</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl p-[5px]" style={{ background: tabBarBg, marginBottom: '1.75rem' }}>
          {['login', 'signup'].map(tab => (
            <button key={tab} type="button" onClick={() => { setActiveTab(tab); setFormMsg({ text: '', type: '' }); }}
              className={`flex-1 py-3 rounded-[9px] border-none cursor-pointer font-bold text-[0.85rem] transition-all duration-200 ${activeTab === tab
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-[0_2px_14px_rgba(99,102,241,0.38)]'
                : 'bg-transparent hover:opacity-70'
                }`}
              style={activeTab !== tab ? { color: tabInactiveColor } : {}}>
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Role selector */}
        <div className="flex gap-2.5" style={{ marginBottom: '2.25rem' }}>
          {roles.map(r => (
            <button key={r.val} type="button" onClick={() => setSelectedRole(r.val)}
              className="flex-1 py-3 px-1 rounded-xl border cursor-pointer font-semibold text-[0.82rem] transition-all duration-200"
              style={selectedRole === r.val ? {
                borderColor: 'rgba(151, 153, 237, 0.55)',
                background: isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.1)',
                color: roleActiveText,
              } : {
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.14)',
                background: 'transparent',
                color: roleInactiveText,
              }}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px w-full" style={{ background: dividerColor, marginBottom: '2.25rem' }} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '1.5rem' }}>

          {activeTab === 'signup' && (
            <InputField isDark={isDark} icon={User} type="text" value={name}
              onChange={e => setName(e.target.value)} placeholder="Full name" required />
          )}

          <InputField isDark={isDark} icon={Mail} type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="Email address" required />

          {activeTab === 'signup' && (
            <InputField isDark={isDark} icon={Phone} type="tel" value={phone}
              onChange={e => setPhone(e.target.value)} placeholder="Phone: 98XXXXXXXX" required />
          )}

          <InputField isDark={isDark} icon={Lock}
            type={showPassword ? 'text' : 'password'}
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Password" required
            right={
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="bg-transparent border-none cursor-pointer p-0 transition-opacity hover:opacity-60"
                style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(79,70,229,0.6)' }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          {/* Success Failure Message */}
          {formMsg.text && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 500,
              background: formMsg.type === 'error'
                ? 'rgba(239,68,68,0.12)'
                : 'rgba(16,185,129,0.12)',
              border: `1px solid ${formMsg.type === 'error'
                ? 'rgba(239,68,68,0.3)'
                : 'rgba(16,185,129,0.3)'}`,
              color: formMsg.type === 'error' ? '#f87171' : '#34d399',
            }}>
              {formMsg.text}
            </div>
          )}

          {/* Submit */}
          <button type="submit"
            style={{ marginTop: '0.5rem' }}
            className="w-full h-[54px] border-none rounded-xl cursor-pointer bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-bold text-[0.93rem] flex items-center justify-center gap-2 shadow-[0_4px_22px_rgba(99,102,241,0.32)] hover:opacity-90 hover:shadow-[0_6px_28px_rgba(99,102,241,0.42)] transition-all duration-200">
            {activeTab === 'login' ? 'Sign In' : 'Create Account'}
            <ChevronRight size={17} />
          </button>
        </form>

        {/* Switch */}
        <p className="text-[0.79rem] text-center font-medium" style={{ color: switchColor, marginTop: '2rem' }}>
          {activeTab === 'login' ? (
            <>No account?{' '}
              <button type="button" onClick={() => setActiveTab('signup')}
                className="bg-transparent border-none font-bold cursor-pointer hover:underline p-0"
                style={{ color: linkColor }}>Register here</button>
            </>
          ) : (
            <>Already registered?{' '}
              <button type="button" onClick={() => setActiveTab('login')}
                className="bg-transparent border-none font-bold cursor-pointer hover:underline p-0"
                style={{ color: linkColor }}>Sign in</button>
            </>
          )}
        </p>

      </div>
    </div>
  );
};
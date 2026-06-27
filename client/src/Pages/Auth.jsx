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

    const NODE_COUNT = 55;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 3 + 1.5,
      color: Math.random() > 0.5 ? '99,102,241' : '16,185,129',
    }));

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
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x - size, y);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeRect(x - size * 0.7, y, size * 1.4, size * 1.1);
      ctx.strokeRect(x - size * 0.2, y + size * 0.5, size * 0.4, size * 0.6);
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      houseNodes.forEach(h => {
        h.x += h.vx; h.y += h.vy;
        if (h.x < 0 || h.x > canvas.width) h.vx *= -1;
        if (h.y < 0 || h.y > canvas.height) h.vy *= -1;
      });

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

      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color},0.55)`;
        ctx.fill();
      });

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
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
};

// --- Reusable Input Field ---
const InputField = ({ icon: Icon, type, value, onChange, placeholder, required, right }) => (
  <div className="relative flex items-center">
    <Icon size={15} className="absolute left-3 text-white/35 pointer-events-none" />
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full h-11 pl-10 pr-10 bg-white/[0.06] border border-white/[0.15] rounded-[10px] text-white/90 text-[0.9rem] placeholder-white/30 outline-none transition-all duration-200 focus:border-indigo-500/60 focus:bg-indigo-500/[0.08]"
    />
    {right && <div className="absolute right-3">{right}</div>}
  </div>
);

// --- Main Auth Component ---
export const Auth = () => {
  const { currentUser, loginUser, signupUser } = useContext(AppContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab]       = useState('login');
  const [selectedRole, setSelectedRole] = useState('tenant');
  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [phone, setPhone]               = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'tenant')   navigate('/dashboard/tenant');
    if (currentUser.role === 'landlord') navigate('/dashboard/landlord');
    if (currentUser.role === 'admin')    navigate('/dashboard/admin');
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'login') {
      if (!email || !password) { alert("Please fill in email and password."); return; }
      loginUser(email, password);
    } else {
      if (!name || !email || !password || !phone) { alert("Please fill all signup fields."); return; }
      signupUser(email, password, name, phone, selectedRole);
    }
  };

  const roles = [
    { val: 'tenant',   label: '🙋 Tenant' },
    { val: 'landlord', label: '🏢 Landlord' },
    { val: 'admin',    label: '🛡️ Admin' },
  ];

  const features = [
    { icon: '🏠', text: 'Verified room listings across Kathmandu valley' },
    { icon: '🤖', text: 'AI-powered recommendations for your budget' },
    { icon: '🗺️', text: 'Map-based search with nearby colleges & hospitals' },
  ];

  const stats = [
    { num: '500+', label: 'Active Listings' },
    { num: '3',    label: 'Cities Covered' },
    { num: '98%',  label: 'Verified Landlords' },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f0f1a] via-[#0d1117] to-[#0a1a12] py-8 px-4">

      {/* Canvas background */}
      <AnimatedBackground />

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-[1]"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
      />

      {/* Left floating panel — hidden below lg */}
      <div className="absolute left-[6%] top-1/2 -translate-y-1/2 z-[2] max-w-[280px] hidden lg:flex flex-col gap-6">
        <div>
          <p className="text-[0.7rem] tracking-[0.15em] text-emerald-400/80 font-bold uppercase mb-2">
            Nepal's Rental Network
          </p>
          <h1 className="text-[1.9rem] font-extrabold text-white/90 leading-tight">
            Find your<br />
            <span className="text-indigo-400/90">perfect Nest</span>
          </h1>
        </div>
        {features.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <span className="text-lg">{item.icon}</span>
            <span className="text-[0.82rem] text-white/55 leading-relaxed">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Right floating panel — hidden below lg */}
      <div className="absolute right-[6%] top-1/2 -translate-y-1/2 z-[2] max-w-[220px] hidden lg:flex flex-col gap-5">
        {stats.map((stat, i) => (
          <div key={i} className="text-right">
            <p className="text-[1.6rem] font-extrabold text-indigo-400/85">{stat.num}</p>
            <p className="text-[0.75rem] text-white/40 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Auth Card */}
      <div
        className="relative z-[3] w-full max-w-[440px] rounded-[20px] py-10 px-8 border border-white/[0.12] backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] animate-modal-enter"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-7">
          <div className="w-[50px] h-[50px] rounded-[14px] bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-[0_4px_20px_rgba(99,102,241,0.4)]">
            <Home size={24} color="white" />
          </div>
          <h2 className="text-[1.35rem] font-extrabold text-white/90 m-0">NestFinder</h2>
          <p className="text-[0.78rem] text-white/40 m-0">Kathmandu's trusted rental platform</p>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-[10px] p-1 mb-6"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {['login', 'signup'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg border-none cursor-pointer font-bold text-[0.85rem] transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-indigo-500/85 text-white'
                  : 'bg-transparent text-white/45 hover:text-white/70'
              }`}
            >
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Role selector */}
        <div className="flex gap-2 mb-6">
          {roles.map(r => (
            <button
              key={r.val}
              type="button"
              onClick={() => setSelectedRole(r.val)}
              className={`flex-1 py-2 px-1 rounded-[10px] border cursor-pointer font-bold text-[0.82rem] transition-all duration-200 ${
                selectedRole === r.val
                  ? 'border-indigo-500/70 bg-indigo-500/20 text-indigo-400'
                  : 'border-white/10 bg-transparent text-white/45 hover:border-white/25'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {activeTab === 'signup' && (
            <InputField
              icon={User} type="text" value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full Name" required
            />
          )}

          <InputField
            icon={Mail} type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address" required
          />

          {activeTab === 'signup' && (
            <InputField
              icon={Phone} type="tel" value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Phone: 98XXXXXXXX" required
            />
          )}

          <InputField
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            right={
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="text-white/35 hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer p-0"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          <button
            type="submit"
            className="w-full py-3 mt-1 border-none rounded-[10px] cursor-pointer bg-gradient-to-br from-indigo-500 to-emerald-500 text-white font-bold text-[0.95rem] flex items-center justify-center gap-1 shadow-[0_4px_20px_rgba(99,102,241,0.35)] hover:opacity-90 transition-opacity duration-200"
          >
            {activeTab === 'login' ? 'Sign In' : 'Create Account'}
            <ChevronRight size={17} />
          </button>
        </form>

        {/* Switch tab */}
        <p className="mt-5 text-[0.8rem] text-white/35 text-center">
          {activeTab === 'login' ? (
            <>No account?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('signup')}
                className="bg-transparent border-none text-indigo-400/90 font-bold cursor-pointer hover:underline p-0"
              >
                Register here
              </button>
            </>
          ) : (
            <>Already registered?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="bg-transparent border-none text-indigo-400/90 font-bold cursor-pointer hover:underline p-0"
              >
                Sign in
              </button>
            </>
          )}
        </p>

      </div>
    </div>
  );
};
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext} from "../Context/AppContext";
import { Home, Sparkles, Shield, User, Lock, Mail, Phone, ChevronRight } from 'lucide-react';

export const Auth = () => {
  const { currentUser, loginUser } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [selectedRole, setSelectedRole] = useState('tenant'); // 'tenant' or 'landlord'

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Redirect if already logged in
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
      // Mock Login
      loginUser(email || `${selectedRole}@nestfinder.com`, password || 'password', selectedRole);
    } else {
      // Mock Signup
      if (!name || !email || !password || !phone) {
        alert("Please fill all signup fields.");
        return;
      }
      loginUser(email, password, selectedRole);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '4rem 1.5rem',
      background: 'linear-gradient(135deg, var(--bg-app) 0%, var(--bg-card) 100%)',
      position: 'relative'
    }} className="animate-fade-in">
      
      {/* Decorative Glows */}
      <div style={{ position: 'absolute', top: '10%', left: '15%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.08)', filter: 'blur(70px)' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.08)', filter: 'blur(80px)' }} />

      {/* Main card */}
      <div className="card shadow-xl" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', borderColor: 'var(--border-color)' }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(99,102,241,0.3)' }}>
            <Home size={24} style={{ fill: 'white', color: 'var(--primary)' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>NestFinder Portal</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Secure Login & Registration for Tenants and Landlords</p>
        </div>

        {/* Form Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('login')}
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              background: 'none', 
              border: 'none', 
              color: activeTab === 'login' ? 'var(--primary)' : 'var(--text-light)', 
              fontWeight: 700, 
              borderBottom: activeTab === 'login' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            Sign In
          </button>
          <button 
            onClick={() => setActiveTab('signup')}
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              background: 'none', 
              border: 'none', 
              color: activeTab === 'signup' ? 'var(--primary)' : 'var(--text-light)', 
              fontWeight: 700, 
              borderBottom: activeTab === 'signup' ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            Create Account
          </button>
        </div>

        {/* Role Selection Switcher */}
        <div className="form-group" style={{ marginBottom: '2rem' }}>
          <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '0.5rem' }}>Select Your Role</label>
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-app)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <button 
              type="button"
              onClick={() => setSelectedRole('tenant')}
              style={{ 
                flex: 1, 
                padding: '0.5rem 1rem', 
                border: 'none', 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: selectedRole === 'tenant' ? 'var(--bg-card)' : 'transparent',
                color: selectedRole === 'tenant' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: selectedRole === 'tenant' ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              🙋 I am a Tenant
            </button>
            <button 
              type="button"
              onClick={() => setSelectedRole('landlord')}
              style={{ 
                flex: 1, 
                padding: '0.5rem 1rem', 
                border: 'none', 
                borderRadius: 'var(--radius-sm)', 
                backgroundColor: selectedRole === 'landlord' ? 'var(--bg-card)' : 'transparent',
                color: selectedRole === 'landlord' ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: selectedRole === 'landlord' ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)'
              }}
            >
              🏢 I am a Landlord
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {activeTab === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-light)' }} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ram Bahadur"
                  required 
                  className="form-input" 
                  style={{ width: '100%', paddingLeft: '2.5rem' }} 
                />
              </div>
            </div>
          )}

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
            {activeTab === 'login' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', textAlign: 'left', display: 'block', marginTop: '0.25rem' }}>
                💡 Leave empty to auto-fill mock credentials for quick evaluation.
              </span>
            )}
          </div>

          {activeTab === 'signup' && (
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
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-light)' }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="form-input" 
                style={{ width: '100%', paddingLeft: '2.5rem' }} 
              />
            </div>
          </div>

          {/* Submit Action */}
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
            <span>{activeTab === 'login' ? 'Sign In to Account' : 'Register Account'}</span>
            <ChevronRight size={18} />
          </button>
        </form>

        {/* Bottom Switch Trigger */}
        <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {activeTab === 'login' ? (
            <span>Don't have an account? <button onClick={() => setActiveTab('signup')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Create one here</button></span>
          ) : (
            <span>Already have a Nest account? <button onClick={() => setActiveTab('login')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Sign in here</button></span>
          )}
        </div>

      </div>
    </div>
  );
};

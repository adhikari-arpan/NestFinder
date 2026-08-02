import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Users, Sparkles, ArrowRight, CreditCard } from 'lucide-react';

export const About = () => {
  return (
    <div className="animate-fade-in container" style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          About Nest<span style={{ color: 'var(--primary)' }}>Finder</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Nepal's map-based platform helping students and tenants discover verified room and flat rentals,
          powered by smart AI search algorithms.
        </p>
      </div>

      {/* Mission */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <Target size={26} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>Our Mission</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
            More content about NestFinder's mission and story will be added here soon.
          </p>
        </div>
      </div>

      {/* What we do */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <Sparkles size={26} style={{ color: 'var(--secondary)', flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>What We Do</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7, margin: 0 }}>
            More details about the platform's features and how it works will be added here soon.
          </p>
        </div>
      </div>

      {/* Team */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <Users size={26} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.4rem' }}>The Team</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.7, margin: '0 0 0.75rem' }}>
            NestFinder is developed by:
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.9 }}>
            <li>Arpan Adhikari</li>
            <li>Purnima Bhattrai</li>
          </ul>
          <p style={{ color: 'var(--text-light)', fontSize: '0.82rem', marginTop: '0.75rem' }}>
            Full team bios and profile details coming soon.
          </p>
        </div>
      </div>

      {/* Link to payment guide */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CreditCard size={22} style={{ color: 'var(--primary)' }} />
          <div>
            <p style={{ fontWeight: 700, margin: 0 }}>Curious how payments work?</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', margin: '0.2rem 0 0' }}>
              See listing fees for landlords and access fees for tenants.
            </p>
          </div>
        </div>
        <Link to="/about/payment" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          Payment Guide <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

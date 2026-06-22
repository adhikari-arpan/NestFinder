import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Globe, Share2, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: 'var(--bg-card)', 
      borderTop: '1px solid var(--border-color)',
      padding: '4rem 0 2rem 0',
      marginTop: 'auto',
      transition: 'background var(--transition-normal)'
    }}>
      <div className="container">
        <div className="grid-cols-3" style={{ gap: '3rem', marginBottom: '3rem' }}>
          
          {/* Brand Col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>
              <Home style={{ fill: 'var(--primary)', color: '#ffffff' }} size={24} />
              <span>Nest<span style={{ color: 'var(--text-main)' }}>Finder</span></span>
            </Link>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              NestFinder is Nepal's leading map-based platform designed specifically to help students and tenants discover verified room and flat rentals, powered by smart AI search algorithms.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a href="#" className="social-icon" aria-label="Website"><Globe size={18} /></a>
              <a href="#" className="social-icon" aria-label="Share"><Share2 size={18} /></a>
              <a href="#" className="social-icon" aria-label="Message"><MessageSquare size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>For Tenants</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <li><Link to="/search" className="footer-link">Find Rooms</Link></li>
                <li><Link to="/ai-recommend" className="footer-link">AI Recommendations</Link></li>
                <li><Link to="/auth" className="footer-link">Student Login</Link></li>
                <li><a href="#" className="footer-link">Popular Localities</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>For Landlords</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <li><Link to="/dashboard/landlord?action=post" className="footer-link">Post a Listing</Link></li>
                <li><a href="#" className="footer-link">Pricing & Plans</a></li>
                <li><a href="#" className="footer-link">Safety Guidelines</a></li>
                <li><a href="#" className="footer-link">Landlord FAQ</a></li>
              </ul>
            </div>
          </div>

          {/* Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Contact NestFinder</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} className="text-primary-color" />
                <span>Maitighar Heights, Kathmandu, Nepal</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} className="text-primary-color" />
                <span>+977-1-4432100, +977-9851000000</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} className="text-primary-color" />
                <span>support@nestfinder.com.np</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div style={{ 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-light)'
        }}>
          <div>
            &copy; {new Date().getFullYear()} NestFinder. Built for students & landlords in Nepal.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Support Hub</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link {
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }
        .footer-link:hover {
          color: var(--primary);
        }
        .social-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background-color: var(--border-color);
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }
        .social-icon:hover {
          background-color: var(--primary);
          color: #ffffff;
          transform: translateY(-2px);
        }
        .text-primary-color {
          color: var(--primary);
        }
      `}</style>
    </footer>
  );
};

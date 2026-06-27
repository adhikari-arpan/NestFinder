import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Globe, Share2, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const footerLinkClass = "text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]";
  const socialIconClass = "w-9 h-9 rounded-[var(--radius-md)] bg-[var(--border-color)] text-[var(--text-main)] flex items-center justify-center transition-all hover:bg-[var(--primary)] hover:text-white hover:-translate-y-0.5";

  return (
    <footer className="bg-[var(--bg-card)] border-t border-[var(--border-color)] pt-16 pb-8 mt-auto transition-[background] duration-[var(--transition-normal)]">
      <div className="container">

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand Col */}
          <div className="flex flex-col gap-5 text-left">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-[1.4rem] text-[var(--primary)]">
              <Home size={24} style={{ fill: 'var(--primary)', color: '#ffffff' }} />
              <span>Nest<span className="text-[var(--text-main)]">Finder</span></span>
            </Link>
            <p className="text-[0.9rem] text-[var(--text-muted)]">
              NestFinder is Nepal's leading map-based platform designed specifically to help students and tenants discover verified room and flat rentals, powered by smart AI search algorithms.
            </p>
            <div className="flex gap-3">
              <a href="#" className={socialIconClass} aria-label="Website"><Globe size={18} /></a>
              <a href="#" className={socialIconClass} aria-label="Share"><Share2 size={18} /></a>
              <a href="#" className={socialIconClass} aria-label="Message"><MessageSquare size={18} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-6 text-left">
            <div>
              <h4 className="text-[0.95rem] font-bold uppercase tracking-[0.05em] mb-5">For Tenants</h4>
              <ul className="flex flex-col gap-3 text-[0.9rem] list-none">
                <li><Link to="/search" className={footerLinkClass}>Find Rooms</Link></li>
                <li><Link to="/ai-recommend" className={footerLinkClass}>AI Recommendations</Link></li>
                <li><Link to="/auth" className={footerLinkClass}>Student Login</Link></li>
                <li><a href="#" className={footerLinkClass}>Popular Localities</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.95rem] font-bold uppercase tracking-[0.05em] mb-5">For Landlords</h4>
              <ul className="flex flex-col gap-3 text-[0.9rem] list-none">
                <li><Link to="/dashboard/landlord?action=post" className={footerLinkClass}>Post a Listing</Link></li>
                <li><a href="#" className={footerLinkClass}>Pricing & Plans</a></li>
                <li><a href="#" className={footerLinkClass}>Safety Guidelines</a></li>
                <li><a href="#" className={footerLinkClass}>Landlord FAQ</a></li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="text-[0.95rem] font-bold uppercase tracking-[0.05em]">Contact NestFinder</h4>
            <div className="flex flex-col gap-3 text-[0.9rem] text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[var(--primary)]" />
                <span>Maitighar Heights, Kathmandu, Nepal</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[var(--primary)]" />
                <span>+977-1-4432100, +977-9851000000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[var(--primary)]" />
                <span>support@nestfinder.com.np</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-[var(--border-color)] pt-6 flex justify-between items-center flex-wrap gap-4 text-[0.85rem] text-[var(--text-light)]">
          <div>
            &copy; {new Date().getFullYear()} NestFinder. Built for students &amp; landlords in Nepal.
          </div>
          <div className="flex gap-6">
            <a href="#" className={footerLinkClass}>Terms of Service</a>
            <a href="#" className={footerLinkClass}>Privacy Policy</a>
            <a href="#" className={footerLinkClass}>Support Hub</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Share2, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';
import logo from '../assets/NestFinder Logo.png';

export const Footer = () => {
  const linkClass = "text-[var(--text-muted)] text-[0.85rem] transition-colors hover:text-[var(--primary)]";

  return (
    <footer className="bg-[var(--bg-card)] border-t border-[var(--border-color)] mt-auto"
      style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
      <div className="container">

        {/* Top row: Brand LEFT — Contact RIGHT */}
        <div className="flex justify-between items-start flex-wrap gap-10 mb-8">

          {/* Left: Logo + description + socials */}
          <div className="flex flex-col gap-3 max-w-[400px]">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-[1.3rem] text-[var(--primary)]">
              <img src={logo} alt="NestFinder" style={{ height: '36px', width: 'auto' }} />
              <span>Nest<span className="text-[var(--text-main)]">Finder</span></span>
            </Link>
            <p className="text-[0.85rem] text-[var(--text-muted)] leading-[1.8] m-0">
              Nepal's leading map-based platform helping students and tenants discover verified room and flat rentals, powered by smart AI search algorithms.
            </p>
            <div className="flex gap-2.5 mt-1">
              {[Globe, Share2, MessageSquare].map((Icon, i) => (
                <a key={i} href="#"
                  className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--border-color)] text-[var(--text-main)] flex items-center justify-center transition-all hover:bg-[var(--primary)] hover:text-white hover:-translate-y-0.5">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Right: Contact info */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[0.82rem] font-bold uppercase tracking-[0.1em] text-[var(--text-main)] m-0">
              Contact NestFinder
            </h4>
            <div className="flex flex-col gap-2.5 text-[0.84rem] text-[var(--text-muted)]">
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="text-[var(--primary)] shrink-0" />
                <span>Balkumari, Lalitpur, Nepal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-[var(--primary)] shrink-0" />
                <span>+977-1xxxxxxxxx, +977-98xxxxxxxx</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-[var(--primary)] shrink-0" />
                <span>@nestfinder.com.np</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border-color)] pt-5 flex justify-between items-center flex-wrap gap-4">
          <span className="text-[0.8rem] text-[var(--text-light)]">
            &copy; {new Date().getFullYear()} NestFinder. Developed by Purnima Bhattrai and Arpan Adhikari.
          </span>
          <div className="flex gap-5">
            <a href="#" className={linkClass}>Terms of Service</a>
            <a href="#" className={linkClass}>Privacy Policy</a>
            <a href="#" className={linkClass}>Support Hub</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
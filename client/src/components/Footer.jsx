import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Share2, MessageSquare, Mail, Phone, MapPin } from 'lucide-react';
import logo from '../assets/NestFinder Logo.png';

export const Footer = () => {
  const linkClass = "text-[var(--text-muted)] text-[0.85rem] transition-colors hover:text-[var(--primary)]";

  return (
    <footer className="mt-auto border-t border-[var(--border-color)] bg-[var(--bg-card)]"
      style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
      <div className="container">

        {/* Top row: Brand LEFT — Contact RIGHT */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-10">

          {/* Left: Logo + description + socials */}
          <div className="flex max-w-[400px] flex-col gap-3">
            <Link to="/" className="flex items-center gap-2 text-[1.3rem] font-extrabold text-[var(--primary)]">
              <img src={logo} alt="NestFinder" style={{ height: '36px', width: 'auto' }} />
              <span>Nest<span className="text-[var(--text-main)]">Finder</span></span>
            </Link>
            <p className="m-0 text-[0.85rem] leading-[1.8] text-[var(--text-muted)]">
              Nepal's leading map-based platform helping students and tenants discover verified room and flat rentals, powered by smart AI search algorithms.
            </p>
            <div className="mt-1 flex gap-2.5">
              {[Globe, Share2, MessageSquare].map((Icon, i) => (
                <a key={i} href="#"
                  className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--border-color)] text-[var(--text-main)] transition-all hover:-translate-y-0.5 hover:bg-[var(--primary)] hover:text-white">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Right: Contact info */}
          <div className="flex flex-col gap-3">
            <h4 className="m-0 text-[0.82rem] font-bold tracking-[0.1em] text-[var(--text-main)] uppercase">
              Contact NestFinder
            </h4>
            <div className="flex flex-col gap-2.5 text-[0.84rem] text-[var(--text-muted)]">
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="shrink-0 text-[var(--primary)]" />
                <span>Balkumari, Lalitpur, Nepal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="shrink-0 text-[var(--primary)]" />
                <span>+977-1xxxxxxxxx, +977-98xxxxxxxx</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="shrink-0 text-[var(--primary)]" />
                <span>@nestfinder.com.np</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-color)] pt-5">
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
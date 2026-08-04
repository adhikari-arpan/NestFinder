import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { COUNTRY_CODES, flagEmoji } from '../utils/countryCodes';

// Compact "+977 ▾" trigger that opens a searchable country list. Meant to
// sit directly beside a phone number input (see Auth.jsx signup form).
export const CountryCodeSelect = ({ value, onChange, isDark, disabled }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const rootRef = useRef(null);

  useEffect(() => {
    const onDocMouseDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  const selected = COUNTRY_CODES.find((c) => c.dial === value) || COUNTRY_CODES[0];

  const q = search.trim().toLowerCase();
  const filtered = q
    ? COUNTRY_CODES.filter(
        (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q),
      )
    : COUNTRY_CODES;

  const panelBg = isDark ? '#111827' : '#ffffff';
  const panelBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(99,102,241,0.18)';
  const textColor = isDark ? 'rgba(255,255,255,0.92)' : '#1e1b4b';
  const mutedColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(79,70,229,0.6)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.08)';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex h-13.5 items-center gap-1.5 rounded-xl px-3 text-[0.9rem] transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          background: isDark ? 'rgba(255,255,255,0.055)' : 'rgba(99,102,241,0.05)',
          border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(99,102,241,0.18)'}`,
          color: textColor,
        }}
      >
        <span className="text-base leading-none">{flagEmoji(selected.iso2)}</span>
        <span className="font-semibold">+{selected.dial}</span>
        <ChevronDown size={14} style={{ color: mutedColor }} />
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+0.5rem)] left-0 z-20 w-70 overflow-hidden rounded-xl"
          style={{ background: panelBg, border: `1.5px solid ${panelBorder}`, boxShadow: '0 20px 45px rgba(0,0,0,0.25)' }}
        >
          <div className="p-2" style={{ borderBottom: `1px solid ${panelBorder}` }}>
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code..."
              className="h-9 w-full rounded-lg px-3 text-[0.85rem] outline-none"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.06)',
                border: `1px solid ${panelBorder}`,
                color: textColor,
              }}
            />
          </div>
          <div className="max-h-65 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="p-3 text-[0.8rem]" style={{ color: mutedColor }}>
                No matching country.
              </p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.iso2}
                  type="button"
                  onClick={() => {
                    onChange(c.dial);
                    setOpen(false);
                    setSearch('');
                  }}
                  className="flex w-full cursor-pointer items-center gap-2.5 border-none bg-transparent px-3 py-2 text-left text-[0.85rem]"
                  style={{
                    color: textColor,
                    background: c.dial === value && c.iso2 === selected.iso2 ? hoverBg : 'transparent',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg; }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      c.dial === value && c.iso2 === selected.iso2 ? hoverBg : 'transparent';
                  }}
                >
                  <span className="text-base leading-none">{flagEmoji(c.iso2)}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span style={{ color: mutedColor }}>+{c.dial}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

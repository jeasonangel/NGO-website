import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/programs', label: 'Programs' },
  { to: '/data', label: 'Census Data' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur border-b border-ink-primary/10 sticky top-0 z-30">
      <div className="container-page flex items-center justify-between h-16">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="flex gap-0.5">
            <span className="w-2 h-7 bg-ngo-primary rounded-sm" />
            <span className="w-2 h-7 bg-ngo-accent rounded-sm" />
            <span className="w-2 h-7 bg-ink-primary/80 rounded-sm" />
          </div>
          <div className="leading-tight">
            <p className="font-bold text-ink-primary">Espoir Santé</p>
            <p className="text-[11px] text-ink-muted">Health &amp; Development, Cameroon</p>
          </div>
        </NavLink>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <span className="badge bg-ngo-primary-light text-ngo-primary-dark">
            <Activity className="w-3.5 h-3.5" />
            Live Census Data
          </span>
          <NavLink to="/data" className="btn-primary text-sm px-4 py-2">
            Explore Data
          </NavLink>
        </div>

        <button
          className="md:hidden p-2 -mr-2 text-ink-primary"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink-primary/10 bg-white">
          <nav className="container-page py-3 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `py-2.5 text-sm font-medium ${isActive ? 'text-ngo-primary' : 'text-ink-secondary'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <span className="badge w-fit mt-1 bg-ngo-primary-light text-ngo-primary-dark">
              <Activity className="w-3.5 h-3.5" />
              Live Census Data
            </span>
          </nav>
        </div>
      )}
    </header>
  );
}

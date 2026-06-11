import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { signOut } from '../lib/firebase';

const PLATFORM_ADMINS = ['peterjohn2343@gmail.com', 'bitrus@trueweb.ng'];

export function Navbar() {
  const { user, credits } = useAuthStore();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const free = credits?.freeRemaining ?? 0;
  const paid = credits?.paidCredits ?? 0;
  const has = free > 0 || paid > 0;
  const isAdmin = !!user?.email && PLATFORM_ADMINS.includes(user.email);

  // Close menu on navigation
  React.useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <div className="nav-logo-mark">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#100800" strokeWidth="3">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          HarvestAI
        </Link>

        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
        {menuOpen && <div className="nav-overlay" onClick={() => setMenuOpen(false)} />}

        <div className={`nav-right${menuOpen ? ' menu-open' : ''}`}>
          {!user && (
            <>
              <Link to="/pricing" className="nav-link">Pricing</Link>
              <Link to="/app" className="nav-link">App</Link>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => useAuthStore.getState().openPricing()}
              >
                Start free →
              </button>
            </>
          )}

          {user && credits !== null && (
            <Link to="/pricing" className={`nav-credits ${has ? 'ok' : 'empty'}`}>
              <span className={`nav-credits-dot${!has ? ' pulse' : ''}`} />
              {free > 0 ? `${free} free left` : paid > 0 ? `${paid} credits` : 'No credits'}
            </Link>
          )}
          {user && (
            <>
              {isAdmin && (
                <Link to="/admin" className={`nav-link${pathname === '/admin' ? ' active' : ''}`} style={{
                  display: 'flex', alignItems: 'center', gap: 4, color: '#f5a623',
                  border: '1px solid rgba(245,166,35,0.3)', padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  Admin
                </Link>
              )}
              <Link to="/app"       className={`nav-link${pathname === '/app'       ? ' active' : ''}`}>Harvest</Link>
              <Link to="/scheduled" className={`nav-link${pathname === '/scheduled' ? ' active' : ''}`}>Schedule</Link>
              <Link to="/history"   className={`nav-link${pathname === '/history'   ? ' active' : ''}`}>History</Link>
              <Link to="/settings"  className={`nav-link${pathname === '/settings'  ? ' active' : ''}`}>Settings</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary)', color: 'black', fontWeight: 600, fontSize: 13 }}>
                      {user.email?.[0].toUpperCase() ?? 'U'}
                    </div>
                  )}
                </div>
                <button className="nav-signout" onClick={() => signOut()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, padding: '4px 0' }}>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

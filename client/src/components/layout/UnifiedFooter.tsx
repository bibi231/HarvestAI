import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NETWORK_PRODUCTS = [
  { name: 'ReplyAI',     desc: 'AI email replies in seconds',             link: 'https://replyai.com.ng',  icon: '⚡' },
  { name: 'Portfolio',   desc: "Bitrus's work, projects & contact",       link: 'https://trueweb.tech',    icon: '🧑‍💻' },
  { name: 'Star Ranker', desc: 'Entertainment analytics & PR',            link: '#',                       icon: '⭐' },
  { name: 'SafeNet',     desc: 'Digital security & fraud protection',     link: '#',                       icon: '🛡️' },
];

const SOCIAL_LINKS = [
  { label: 'Twitter / X', href: 'https://twitter.com', svg: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
  { label: 'LinkedIn',    href: 'https://linkedin.com', svg: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
  { label: 'Instagram',   href: 'https://instagram.com', svg: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
];

export function UnifiedFooter() {
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);
  const year = new Date().getFullYear();

  return (
    <footer className="hai-footer">
      <div className="hai-footer-inner">
        <div className="hai-footer-grid">
          {/* Brand column */}
          <div className="hai-footer-col hai-footer-brand">
            <Link to="/" className="hai-footer-logo">
              <span className="hai-footer-logo-mark">H</span>
              <span className="hai-footer-logo-text">HarvestAI</span>
            </Link>
            <p className="hai-footer-tag">
              AI-powered web intelligence & lead generation. Built in Nigeria, serving the world.
            </p>
            <div className="hai-footer-socials">
              {SOCIAL_LINKS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  className="hai-footer-social"
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d={s.svg} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div className="hai-footer-col">
            <h4 className="hai-footer-h">Product</h4>
            <ul className="hai-footer-links">
              <li><Link to="/app">Harvest Center</Link></li>
              <li><Link to="/history">Job History</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/settings">Settings</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="hai-footer-col">
            <h4 className="hai-footer-h">Legal</h4>
            <ul className="hai-footer-links">
              <li><Link to="/privacy">Privacy</Link></li>
              <li><Link to="/terms">Terms</Link></li>
              <li><Link to="/refund">Refund Policy</Link></li>
              <li><Link to="/cookies">Cookies</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="hai-footer-col">
            <h4 className="hai-footer-h">Support</h4>
            <ul className="hai-footer-links">
              <li><a href="mailto:support@harvestai.ng">Help</a></li>
              <li><a href="mailto:support@harvestai.ng">Contact</a></li>
              <li>
                <button
                  type="button"
                  className="hai-footer-linklike"
                  onClick={() => setIsNetworkOpen(o => !o)}
                  aria-expanded={isNetworkOpen}
                >
                  TrueWeb Network
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                       style={{ marginLeft: 6, transform: isNetworkOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .25s' }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Network panel */}
        <div className={`hai-footer-network ${isNetworkOpen ? 'is-open' : ''}`}>
          <div className="hai-footer-network-grid">
            {NETWORK_PRODUCTS.map(p => (
              <a
                key={p.name}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hai-footer-network-card"
              >
                <span className="hai-footer-network-icon">{p.icon}</span>
                <span className="hai-footer-network-meta">
                  <span className="hai-footer-network-name">{p.name}</span>
                  <span className="hai-footer-network-desc">{p.desc}</span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <div className="hai-footer-bottom">
          <span className="hai-footer-meta">
            © {year} <strong>TrueWeb Solutions</strong>. Made with care in Nigeria 🇳🇬.
          </span>
          <span className="hai-footer-status">
            <span className="hai-footer-dot" /> All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}

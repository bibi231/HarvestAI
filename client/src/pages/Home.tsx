import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const ROTATING = ['business leads', 'contact data', 'product prices', 'competitor info', 'any website data'];

export default function Home() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const tick = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const word = ROTATING[idx];
    tick.current = setTimeout(() => {
      if (!deleting) {
        if (text.length < word.length) setText(word.slice(0, text.length + 1));
        else setTimeout(() => setDeleting(true), 2000);
      } else {
        if (text.length > 0) setText(text.slice(0, -1));
        else { setDeleting(false); setIdx(i => (i + 1) % ROTATING.length); }
      }
    }, deleting ? 45 : 85);
    return () => clearTimeout(tick.current);
  }, [text, deleting, idx]);

  return (
    <div className="home">
      <div className="mesh-bg" />
      
      <nav className="home-nav">
        <div className="home-nav-inner">
          <Link to="/" className="home-nav-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            <span style={{ letterSpacing: '-0.03em' }}>HarvestAI</span>
          </Link>
          <div className="home-nav-links">
            <Link to="/pricing" className="home-nav-link">Pricing</Link>
            <Link to="/app" className="btn btn-secondary">Login</Link>
            <Link to="/app" className="btn btn-primary">Try Free →</Link>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          AI-powered web scraping · No coding needed
        </div>
        
        <h1 className="hero-headline text-gradient">
          Harvest <span className="accent-gradient">{text}</span>
          <br />from any website.
        </h1>
        
        <p className="hero-sub">
          The ultimate engine for lead generation and data extraction. 
          Describe what you want in plain English, and let AI handle the heavy lifting.
        </p>
        
        <div className="hero-actions">
          <Link to="/app" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '16px' }}>
            Start for free →
          </Link>
          <Link to="/pricing" className="btn btn-secondary" style={{ padding: '16px 40px', fontSize: '16px' }}>
            View Pricing
          </Link>
        </div>

        <div className="hero-demo mockup-container">
          <div className="mockup-inner">
            <div className="mockup-header">
              <div className="mockup-dots">
                <div className="mockup-dot" />
                <div className="mockup-dot" />
                <div className="mockup-dot" />
              </div>
              <div style={{ marginLeft: '12px', fontSize: '10px', color: 'var(--text-muted)' }}>harvestai.sh/app/lead-finder</div>
            </div>
            
            <div style={{ padding: '40px', textAlign: 'left' }}>
              <div className="demo-mode-pill" style={{ marginBottom: '24px' }}>Mode: Lead Finder</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                <div className="bento-card" style={{ padding: '20px', background: 'var(--bg-elevated)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Business Type</div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>Investment Banks</div>
                </div>
                <div className="bento-card" style={{ padding: '20px', background: 'var(--bg-elevated)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Location</div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>Lagos, Nigeria</div>
                </div>
              </div>
              
              <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, #000, transparent)' }} />
                {[
                  { n: 'UBA Capital', e: 'contact@ubacap.com', s: 'Verified' },
                  { n: 'Stanbic IBTC Bank', e: 'leads@stanbic.ng', s: 'Verified' },
                  { n: 'FBN Quest', e: 'info@fbnquest.com', s: 'Verified' },
                  { n: 'Chapel Hill Denham', e: 'hello@chapelhill.com', s: 'Verified' },
                ].map((r, i) => (
                  <div key={i} className="bento-card" style={{ padding: '14px 20px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', opacity: 1 - i * 0.2 }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{r.n}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{r.e}</div>
                    </div>
                    <div style={{ color: 'var(--success)', fontSize: '11px', fontWeight: '700' }}>{r.s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section bento-grid">
        <div className="bento-card bento-8">
          <div className="mode-icon">🎯</div>
          <h3 className="bento-card-title">Lead Finder</h3>
          <p className="bento-card-desc">
            Automatically discover and enrich business leads. HarvestAI hit global and local directories, 
            identifying key decision-makers, verified emails, and phone numbers.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
            <span className="demo-mode-pill" style={{ opacity: 0.6 }}>VConnect</span>
            <span className="demo-mode-pill" style={{ opacity: 0.6 }}>LinkedIn</span>
            <span className="demo-mode-pill" style={{ opacity: 0.6 }}>Google Maps</span>
          </div>
        </div>
        
        <div className="bento-card bento-4" style={{ background: 'var(--accent-dim)', borderColor: 'rgba(245,166,35,0.2)' }}>
          <div style={{ fontSize: '48px', fontWeight: '900', color: 'var(--accent)', marginBottom: '12px' }}>30</div>
          <h3 className="bento-card-title">Free Credits</h3>
          <p className="bento-card-desc" style={{ color: 'var(--accent)' }}>Starting credits every month. No credit card required.</p>
        </div>

        <div className="bento-card bento-4">
          <div className="mode-icon">🔍</div>
          <h3 className="bento-card-title">Browser Extension</h3>
          <p className="bento-card-desc">Extract data from your current tab without leaving your workflow.</p>
        </div>

        <div className="bento-card bento-8">
          <div className="mode-icon">🤖</div>
          <h3 className="bento-card-title">AI-Powered Extraction</h3>
          <p className="bento-card-desc">
            Powered by Gemini 2.0 Flash. Just describe what you need in plain English and watched structured 
            data magically appear from unstructured web noise.
          </p>
        </div>
      </section>

      <footer className="home-footer" style={{ padding: '80px 24px', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="home-footer-inner" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="home-nav-logo">HarvestAI</div>
          <div style={{ display: 'flex', gap: '32px' }}>
            <Link to="/pricing" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Pricing</Link>
            <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Privacy</a>
            <a href="#" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Terms</a>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>© 2026 HarvestAI · Built in Abuja 🇳🇬</div>
        </div>
      </footer>
    </div>
  );
}

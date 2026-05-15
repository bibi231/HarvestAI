import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { HARVEST_MODES } from '../types/index';
import { Navbar } from '../components/Navbar';

const WORDS = ['business leads', 'contact data', 'product prices', 'competitor info', 'website data', 'email addresses'];

export default function Home() {
  const { user } = useAuthStore();
  const [wi, setWi] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [txt, setTxt] = useState('');
  const [del, setDel] = useState(false);
  const t = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const w = WORDS[wi];
    t.current = setTimeout(() => {
      if (!del) {
        if (txt.length < w.length) setTxt(w.slice(0, txt.length + 1));
        else setTimeout(() => setDel(true), 2000);
      } else {
        if (txt.length > 0) setTxt(txt.slice(0, -1));
        else { setDel(false); setWi(i => (i + 1) % WORDS.length); }
      }
    }, del ? 42 : 82);
    return () => clearTimeout(t.current);
  }, [txt, del, wi]);

  const handleStartFree = () => {
    const user = useAuthStore.getState().user;
    if (user) {
      navigate('/app');
    } else {
      useAuthStore.getState().openPricing();
    }
  };

  const handleModeClick = (modeId: string) => {
    const user = useAuthStore.getState().user;
    if (user) {
      navigate(`/app?mode=${modeId}`);
    } else {
      useAuthStore.getState().openPricing();
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterLoading(true);
    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    } catch {}
    setNewsletterLoading(false);
  };

  return (
    <div className="landing">
      <div className="ambient-grid" aria-hidden />
      <div className="ambient-glow" aria-hidden />

      <Navbar />

      {/* HERO */}
      <div className="hero-wrap">
        <div className="hero-grid">
          {/* Left */}
          <div>
            <div className="hero-pill">
              <span className="hero-pill-dot" />
              AI-powered · No code needed · Export instantly
            </div>
            <h1 className="hero-h1">
              Harvest <em>{txt}<span className="hero-cursor" /></em>
              <br />from anywhere.
            </h1>
            <p className="hero-sub">
              Find business leads from Nigerian directories and global sources. Extract structured data from any website. Just describe what you want — AI does the rest.
            </p>
            <div className="hero-actions">
              <button 
                className="btn btn-primary btn-xl"
                onClick={handleStartFree}
              >
                {user ? 'Go to Harvest' : 'Start harvesting free'}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <Link to="/pricing" className="btn btn-secondary btn-md">See pricing</Link>
              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-md"
                style={{ opacity: 0.75 }}
              >
                🧩 Chrome Extension ✦
              </a>
            </div>
            <div className="hero-stats">
              <div>
                <span className="hero-stat-v">30<span className="a">+</span></span>
                <span className="hero-stat-l">Free credits/month</span>
              </div>
              <div className="hero-stat-div" />
              <div>
                <span className="hero-stat-v">8</span>
                <span className="hero-stat-l">Harvest modes</span>
              </div>
              <div className="hero-stat-div" />
              <div>
                <span className="hero-stat-v">4<span className="a"> fmts</span></span>
                <span className="hero-stat-l">Export formats</span>
              </div>
            </div>
          </div>

          {/* Right — demo card */}
          <div className="demo-wrap">
            <div className="demo-card">
              <div className="demo-header">
                <span className="demo-mode">Lead Finder</span>
                <div className="demo-live">
                  <span className="demo-live-dot" />
                  RUNNING
                </div>
              </div>
              <div className="demo-inputs">
                <div className="demo-row">
                  <span className="demo-key">Business type</span>
                  <span className="demo-val">Law firms</span>
                </div>
                <div className="demo-row">
                  <span className="demo-key">Location</span>
                  <span className="demo-val">Lagos, Nigeria</span>
                </div>
              </div>
              <div className="demo-prog-wrap">
                <div className="demo-prog-label">
                  <span className="demo-prog-dot" />
                  Scraping VConnect Nigeria…
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: '68%' }} />
                </div>
              </div>
              <div className="demo-results">
                {[
                  { name: 'Okonkwo & Associates',  contact: 'info@okonkwolaw.com', score: '9.2' },
                  { name: 'Lagos Legal Partners',  contact: '08012345678',         score: '8.7' },
                  { name: 'Adetokunbo Chambers',   contact: 'contact@adc.ng',      score: '8.1' },
                ].map(r => (
                  <div key={r.name} className="demo-result">
                    <div>
                      <div className="demo-result-name">{r.name}</div>
                      <div className="demo-result-contact">{r.contact}</div>
                    </div>
                    <span className="demo-result-score">{r.score}</span>
                  </div>
                ))}
                <div className="demo-more">+ 22 more results found</div>
              </div>
            </div>
            <div className="demo-float demo-float-1">✓ 25 leads harvested</div>
            <div className="demo-float demo-float-2">⚡ 3 credits used</div>
          </div>
        </div>
      </div>

      {/* STATS BELT */}
      <div className="stats-belt">
        <div className="stats-belt-inner">
          {[
            { v: '17,400', s: '+', l: 'Free AI calls/day' },
            { v: '8',      s: '',  l: 'Harvest modes' },
            { v: '20',     s: '',  l: 'URLs per job' },
            { v: '100',    s: '%', l: 'Export free always' },
          ].map(s => (
            <div key={s.l}>
              <div className="stat-val">{s.v}<span className="a">{s.s}</span></div>
              <div className="stat-lab">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* MODES — clickable grid of all 8 */}
      <section className="section">
        <div className="section-inner">
          <div className="eyebrow">Eight modes</div>
          <h2 className="section-h">One tool. Infinite data.</h2>
          <p className="section-p">From lead generation to price monitoring to data enrichment — HarvestAI handles it all.</p>
          <div className="mode-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {HARVEST_MODES.map(m => (
              <div
                key={m.id}
                className="mode-card"
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => handleModeClick(m.id)}
              >
                {m.badge && (
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    fontSize: 9, fontWeight: 800, color: 'var(--amber)',
                    background: 'rgba(245,166,35,0.15)', padding: '2px 6px',
                    borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{m.badge}</span>
                )}
                <span className="mode-icon">{m.icon}</span>
                <div className="mode-title">{m.label}</div>
                <p className="mode-desc">{m.desc}</p>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-m)', marginTop: 8 }}>
                  {m.creditNote}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="section section-alt">
        <div className="section-inner">
          <div className="eyebrow">How it works</div>
          <h2 className="section-h">Three steps to clean data.</h2>
          <div className="steps-row">
            {[
              { n: '01', t: 'Describe your target', d: 'Pick a mode. Enter a business type and location, paste URLs, or upload a CSV.' },
              { n: '02', t: 'AI scrapes and extracts', d: 'HarvestAI fetches the pages and uses Gemini AI to pull exactly what you asked for.' },
              { n: '03', t: 'Export and use', d: 'Download as CSV, Excel, JSON, or Markdown table and import into your CRM or spreadsheet.' },
            ].map((s, i) => (
              <div key={s.n} className="step">
                <span className="step-n">{s.n}</span>
                <div className="step-title">{s.t}</div>
                <p className="step-desc">{s.d}</p>
                {i < 2 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-section">
        <div className="cta-h">Stop copying data manually.</div>
        <p className="cta-sub">
          {user 
            ? "HarvestAI does it in seconds. Describe what you want and the AI extracts it instantly."
            : "HarvestAI does it in seconds. 30 free credits every month — no card needed."}
        </p>
        <button 
          className="btn btn-primary btn-xl"
          onClick={handleStartFree}
        >
          {user ? 'Go to Harvest →' : 'Start harvesting for free →'}
        </button>
      </div>

      {/* ── Newsletter + ReplyAI Promo ── */}
      <div className="newsletter-split">
        <div className="newsletter-panel">
          <p className="newsletter-eyebrow">📬 FREE NEWSLETTER</p>
          <h2 className="newsletter-headline">Level up your data game</h2>
          <p className="newsletter-sub">
            Join 2,000+ Nigerian professionals getting weekly tips on AI tools, web intelligence, and exclusive HarvestAI updates.
          </p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="your@email.com"
              value={newsletterEmail}
              onChange={e => setNewsletterEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-btn" disabled={newsletterLoading}>
              {newsletterLoading ? 'Subscribing...' : 'Subscribe free →'}
            </button>
          </form>
          {newsletterSuccess && <p className="newsletter-success">🎉 You're on the list!</p>}
          <p className="newsletter-fine">No spam. Unsubscribe anytime.</p>
        </div>

        <div className="harvest-promo-card" style={{background: 'linear-gradient(135deg, #1a0800 0%, #3d2000 50%, #1a0800 100%)', border: '1px solid rgba(245,158,11,0.4)'}}>
          <p className="harvest-promo-eyebrow" style={{color: '#f59e0b'}}>POWERED BY TRUEWEB NETWORK</p>
          <div className="harvest-promo-icon">✉️</div>
          <h3 className="harvest-promo-title">Supercharge with <span style={{color: '#f59e0b'}}>ReplyAI</span></h3>
          <p className="harvest-promo-desc">
            Write perfect professional email replies in seconds. AI-powered, built for Nigerian inboxes.
          </p>
          <a href="https://replyai.com.ng" target="_blank" rel="noopener noreferrer" className="harvest-promo-btn" style={{background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#000'}}>
            Try ReplyAI free →
          </a>
        </div>
      </div>
    </div>
  );
}

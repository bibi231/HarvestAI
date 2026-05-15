import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'harvestai:newsletter:dismissed';
const DELAY_MS = 25_000;

export default function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try { if (window.localStorage.getItem(STORAGE_KEY) === '1') return; } catch {}
    const t = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    try { window.localStorage.setItem(STORAGE_KEY, '1'); } catch {}
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setStatus('err'); setErrMsg('Please enter a valid email.'); return;
    }
    setStatus('loading'); setErrMsg('');
    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiBase}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'harvestai-popup' }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus('ok');
      try { window.localStorage.setItem(STORAGE_KEY, '1'); } catch {}
      setTimeout(() => setOpen(false), 2200);
    } catch {
      setStatus('err');
      setErrMsg('Something went wrong. Please try again.');
    }
  };

  if (!open) return null;

  return (
    <div className="hai-nl-overlay" role="dialog" aria-modal="true" onClick={close}>
      <div className="hai-nl-card" onClick={e => e.stopPropagation()}>
        <button className="hai-nl-close" onClick={close} aria-label="Close">{String.fromCharCode(0x2715)}</button>
        <div className="hai-nl-eyebrow">Intelligence Briefing</div>
        <h3 className="hai-nl-title">The HarvestAI weekly</h3>
        <p className="hai-nl-sub">
          One email a week: scraping recipes, lead-gen plays, and product upgrades. No fluff.
        </p>

        {status === 'ok' ? (
          <div className="hai-nl-success">
            <span className="hai-nl-check">{String.fromCharCode(0x2713)}</span>
            You're in. Check your inbox to confirm.
          </div>
        ) : (
          <form className="hai-nl-form" onSubmit={submit}>
            <input
              type="email" autoFocus required
              placeholder="you@work-email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="hai-nl-input"
              disabled={status === 'loading'}
            />
            <button type="submit" className="hai-nl-btn" disabled={status === 'loading'}>
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'err' && <div className="hai-nl-error">{errMsg}</div>}

        <div className="hai-nl-foot">By subscribing you agree to our privacy practices.</div>
      </div>
    </div>
  );
}

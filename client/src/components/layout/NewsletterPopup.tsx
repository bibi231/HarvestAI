import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'harvestai:newsletter:dismissed';
const DELAY_MS = 25_000;

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {}
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
    <div className="rai-nl-overlay" role="dialog" aria-modal="true" onClick={close}>
      <div className="rai-nl-card" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <button className="rai-nl-close" onClick={close} aria-label="Close">&times;</button>
        <div className="rai-nl-eyebrow">Newsletter</div>
        <h3 className="rai-nl-title">Get farming tips & updates</h3>
        <p className="rai-nl-sub">
          One email a week: new AI features, crop insights, and early-access offers for farmers.
          No spam, unsubscribe any time.
        </p>

        {status === 'ok' ? (
          <div className="rai-nl-success">
            <span className="rai-nl-check">&#10003;</span>
            You're in. Check your inbox to confirm.
          </div>
        ) : (
          <form className="rai-nl-form" onSubmit={submit}>
            <input
              type="email"
              autoFocus
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="rai-nl-input"
              disabled={status === 'loading'}
            />
            <button type="submit" className="rai-nl-btn" disabled={status === 'loading'}>
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
        {status === 'err' && <div className="rai-nl-error">{errMsg}</div>}
        <div className="rai-nl-foot">By subscribing you agree to our <a href="/privacy">Privacy Policy</a>.</div>
      </div>
    </div>
  );
}

export default NewsletterPopup;

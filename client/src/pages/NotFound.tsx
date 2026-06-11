import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export default function NotFound() {
  return (
    <>
    <Navbar />
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '110px 24px 60px' }}>
      <div style={{ textAlign: 'center', maxWidth: 460 }}>
        <div style={{ fontFamily: 'var(--font-d)', fontWeight: 900, fontSize: 92, lineHeight: 1, color: 'var(--amber)' }}>404</div>
        <h1 style={{ fontFamily: 'var(--font-d)', fontWeight: 800, fontSize: 25, color: 'var(--text-1)', marginTop: 16, letterSpacing: '-0.02em' }}>Page not found</h1>
        <p style={{ color: 'var(--text-2)', fontSize: 15, marginTop: 10, lineHeight: 1.6 }}>
          That page doesn't exist or has moved. Try one of these instead.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 26, flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary btn-sm">Back home</Link>
          <Link to="/app" className="nav-link" style={{ border: '1px solid var(--border-1)', borderRadius: 8 }}>Open the app</Link>
          <Link to="/pricing" className="nav-link" style={{ border: '1px solid var(--border-1)', borderRadius: 8 }}>Pricing</Link>
        </div>
      </div>
    </main>
    </>
  );
}

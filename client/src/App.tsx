import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import CookieBanner from './components/layout/CookieBanner';
import { NewsletterPopup } from './components/layout/NewsletterPopup';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Pricing from './pages/Pricing';

// Components
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-base flex items-center justify-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// ── Inline Ad Banner (between content and footer) ────────
function InlineAdBanner() {
  const [adLoaded, setAdLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const adsbygoogle = (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
      setTimeout(() => {
        const ins = document.querySelector('.inline-ad-banner ins.adsbygoogle') as HTMLElement | null;
        if (ins && ins.getAttribute('data-ad-status') === 'filled') setAdLoaded(true);
      }, 2500);
    } catch(e) {}
  }, []);

  return (
    <div className="inline-ad-banner">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7798519284162823"
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      {!adLoaded && (
        <div className="inline-ad-placeholder">
          <span>🌱 <strong>Reach thousands of farmers</strong> — advertise with HarvestAI</span>
          <a href="mailto:peterjohn2343@gmail.com" className="inline-ad-cta">Partner with us</a>
        </div>
      )}
    </div>
  );
}
// ────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <CookieBanner />
      <NewsletterPopup />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Protected Dashboard Area */}
        <Route 
          path="/app" 
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          } 
        />
        <Route 
          path="/app/history" 
          element={
            <AuthGuard>
              <History />
            </AuthGuard>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <InlineAdBanner />
    </BrowserRouter>
  );
}

export default App;

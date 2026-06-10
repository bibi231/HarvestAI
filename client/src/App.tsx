import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useAuth } from './hooks/useAuth';


// Code-split heavy routes
const Home            = lazy(() => import('./pages/Home'));
const Dashboard       = lazy(() => import('./pages/Dashboard'));
const Settings        = lazy(() => import('./pages/Settings'));
const Pricing         = lazy(() => import('./pages/Pricing'));
const Scheduled       = lazy(() => import('./pages/Scheduled'));
const History         = lazy(() => import('./pages/History'));
const Privacy         = lazy(() => import('./pages/Privacy'));
const Terms           = lazy(() => import('./pages/Terms'));
const Refund          = lazy(() => import('./pages/Refund'));
const Cookies         = lazy(() => import('./pages/Cookies'));
const Blog            = lazy(() => import('./pages/Blog'));
const BlogPost        = lazy(() => import('./pages/BlogPost'));
const AuthModal       = lazy(() => import('./components/AuthModal'));
const NewsletterPopup = lazy(() => import('./components/marketing/NewsletterPopup'));
const UnifiedFooter   = lazy(() => import('./components/layout/UnifiedFooter').then(m => ({ default: m.UnifiedFooter })));

// All inline styles - never invisible regardless of Tailwind config
function FullScreenSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#07070c',
    }}>
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <div style={{
          width: 48,
          height: 48,
          border: '2px solid rgba(245,166,35,0.2)',
          borderTopColor: '#f5a623',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  const { user, isAuthLoading } = useAuth();
  const _openPricing = useAuthStore(s => s.openPricing);

  React.useEffect(() => {
    if (!isAuthLoading) {
      const splash = document.getElementById('hai-boot');
      if (splash) {
        splash.style.transition = 'opacity .4s ease';
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 450);
      }
    }
  }, [isAuthLoading]);

  if (isAuthLoading) return null;

  return (
    <Router>
      <Suspense fallback={<FullScreenSpinner />}>
        <AuthModal />
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/app"       element={user ? <Dashboard /> : <Navigate to="/" replace />} />
          <Route path="/settings"  element={user ? <Settings />  : <Navigate to="/" replace />} />
          <Route path="/scheduled" element={user ? <Scheduled /> : <Navigate to="/" replace />} />
          <Route path="/history"   element={user ? <History />   : <Navigate to="/" replace />} />
          <Route path="/pricing"   element={<Pricing />} />
          <Route path="/blog"      element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/privacy"   element={<Privacy />} />
          <Route path="/terms"     element={<Terms />} />
          <Route path="/refund"    element={<Refund />} />
          <Route path="/cookies"   element={<Cookies />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
        <NewsletterPopup />
        <UnifiedFooter />
      </Suspense>
    </Router>
  );
}

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
    </BrowserRouter>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthModal from '../components/AuthModal';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [authModal, setAuthModal] = useState<{isOpen: boolean, mode: 'login' | 'signup'}>({
    isOpen: false,
    mode: 'login'
  });

  const [rotatingText, setRotatingText] = useState('any website data.');
  const texts = ['any website data.', 'competitor info.', 'business leads.', 'product pricing.'];
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setRotatingText(texts[i]);
    }, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const openAuth = (mode: 'login' | 'signup') => {
    if (user) {
      navigate('/app');
    } else {
      setAuthModal({ isOpen: true, mode });
    }
  };

  return (
    <div className="min-h-screen bg-base pb-20 selection:bg-accent/30 selection:text-accent">
      <div className="mesh-bg" />
      
      {/* ── Navigation ── */}
      <nav className={`fixed top-0 left-0 w-full z-[80] transition-all duration-300 border-b ${
        scrolled ? 'bg-base/80 backdrop-blur-xl border-default py-4' : 'bg-transparent border-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 select-none cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
             <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-black font-black">H</div>
             <span className="font-black text-xl text-primary tracking-tighter uppercase italic">HarvestAI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/pricing" className="text-sm font-bold text-secondary hover:text-primary transition-colors">Pricing</NavLink>
            <a href="https://github.com/truewebsolutions/harvestai/wiki" target="_blank" className="text-sm font-bold text-secondary hover:text-primary transition-colors">Documentation</a>
            {user ? (
              <button 
                onClick={() => navigate('/app')}
                className="btn btn-primary px-6 py-2"
              >
                Go to App →
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => openAuth('login')}
                  className="text-sm font-bold text-secondary hover:text-primary transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => openAuth('signup')}
                  className="btn btn-primary px-6 py-2"
                >
                  Try Free →
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="hero-badge mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            AI-powered web scraping · No coding needed
          </div>
          
          <h1 className="text-6xl md:text-[5rem] font-black text-primary leading-[1.1] tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Harvest <br className="md:hidden" />
            <span className="text-accent inline-block min-w-[200px] transition-all duration-500 animate-pulse-slow">
              {rotatingText}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-secondary max-w-2xl mx-auto mb-12 font-medium animate-in fade-in slide-in-from-bottom-12 duration-1200">
            The ultimate engine for lead generation and data extraction. Describe what you want in plain English, and let AI handle the heavy lifting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1500">
            <button onClick={() => openAuth('signup')} className="btn btn-primary px-10 py-4 text-lg">Start Free Harvest →</button>
            <button onClick={() => navigate('/pricing')} className="btn btn-secondary px-10 py-4 text-lg">View Credit Packs</button>
          </div>
        </div>

        {/* ── Mockup Display ── */}
        <div className="max-w-6xl mx-auto mt-24 relative p-4 bento-card border-accent/20 bg-elevated/40 backdrop-blur-3xl animate-in fade-in zoom-in duration-1000">
           <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
           <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
           
           <div className="rounded-xl overflow-hidden shadow-2xl border border-default">
              <div className="bg-elevated/80 border-b border-default p-3 flex items-center gap-2">
                 <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                 </div>
                 <div className="bg-neutral-900 border border-default rounded px-3 py-1 text-[10px] text-muted font-bold mx-auto">https://app.harvestai.io/leads</div>
              </div>
              <div className="p-8 bg-neutral-950">
                 <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-4 bg-elevated/30 border border-default rounded-lg p-4 h-48 animate-pulse" />
                    <div className="col-span-8 bg-elevated/30 border border-default rounded-lg p-4 h-48 animate-pulse" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ── Feature Highlights (Bento Grid) ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bento-card col-span-1 md:col-span-2 group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-left duration-500">🎯</div>
              <h3 className="text-2xl font-black text-primary mb-2 italic">Precision Lead Finding</h3>
              <p className="text-secondary text-sm">Input any business category and location. Our AI-orchestrated scrapers hunt through directories to return scored, high-value leads with full contact data.</p>
            </div>
            <div className="bento-card">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="text-2xl font-black text-primary mb-2 italic">Natural Parsing</h3>
              <p className="text-secondary text-sm">Tell us what to extract using plain English. "Give me all product SKUs" or "Find all speaker emails."</p>
            </div>
            <div className="bento-card">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-2xl font-black text-primary mb-2 italic">Instant Export</h3>
              <p className="text-secondary text-sm">Download your clean data as industrial-ready CSV files in one click.</p>
            </div>
            <div className="bento-card col-span-1 md:col-span-2 group overflow-hidden">
               <h3 className="text-2xl font-black text-primary mb-2 italic">Built-in Intelligence</h3>
               <p className="text-secondary text-sm">Every lead is automatically scored by our ranking engine based on completeness and data freshness.</p>
               <div className="mt-8 flex gap-2 overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity duration-1000">
                  {[1,2,3,4,5,6,7,8,9,10].map(i => (
                    <div key={i} className="min-w-[120px] h-20 bg-elevated rounded-lg border border-default" />
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Auth Modal ── */}
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({...authModal, isOpen: false})} 
        initialMode={authModal.mode} 
      />
    </div>
  );
}

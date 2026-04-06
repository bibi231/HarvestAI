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
    <div className="min-h-screen bg-[#020202] pb-40 selection:bg-accent/30 selection:text-accent">
      <div className="mesh-bg" />
      
      {/* ── Navigation ── */}
      <nav className={`fixed top-0 left-0 w-full z-[80] transition-all duration-500 border-b ${
        scrolled ? 'bg-black/60 backdrop-blur-2xl border-default py-4' : 'bg-transparent border-transparent py-8'
      }`}>
        <div className="max-w-7xl mx-auto px-10 flex items-center justify-between">
          <div className="flex items-center gap-4 select-none cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
             <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-black font-black text-xl shadow-lg shadow-accent/20 transition-transform group-hover:scale-110">H</div>
             <span className="font-black text-2xl text-primary tracking-tighter uppercase italic">HarvestAI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-12">
            <NavLink to="/pricing" className="text-[11px] font-black uppercase tracking-widest text-secondary hover:text-accent transition-colors">Pricing</NavLink>
            <a href="https://github.com/truewebsolutions/harvestai/wiki" target="_blank" className="text-[11px] font-black uppercase tracking-widest text-secondary hover:text-accent transition-colors">Docs</a>
            {user ? (
              <button 
                onClick={() => navigate('/app')}
                className="btn btn-primary px-8 py-3 bg-white text-black shadow-white/10"
              >
                Launch Console →
              </button>
            ) : (
              <div className="flex items-center gap-8">
                <button 
                  onClick={() => openAuth('login')}
                  className="text-[11px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors"
                >
                  Ident Interface
                </button>
                <button 
                  onClick={() => openAuth('signup')}
                  className="btn btn-primary px-8 py-3"
                >
                  Free Harvest →
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-60 pb-40 px-10 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <div className="hero-badge mx-auto mb-10 animate-fade-in backdrop-blur-xl bg-white/[0.03] border-white/10">
            <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />
            AI-powered Industrial Scraping engine
          </div>
          
          <h1 className="text-7xl md:text-[6.5rem] font-black text-primary leading-[0.95] tracking-tighter mb-10 animate-slide-up">
            Harvest <br className="md:hidden" />
            <span className="text-accent inline-block min-w-[280px] transition-all duration-700 hover:rotate-[-2deg]">
              {rotatingText}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-secondary max-w-3xl mx-auto mb-16 font-medium animate-fade-in delay-200">
            Deploy advanced AI scrapers to hunt through thousands of digital sources. Describe your target, and our engine extracts clean, orchestrated data.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up delay-400">
            <button onClick={() => openAuth('signup')} className="btn btn-primary px-12 py-5 text-lg shadow-accent/40">Initialize System →</button>
            <button onClick={() => navigate('/pricing')} className="btn btn-secondary px-12 py-5 text-lg">View Data Tiers</button>
          </div>
        </div>

        {/* ── Elevated Mockup ── */}
        <div className="max-w-6xl mx-auto mt-32 relative p-1.5 bento-card border-white/5 bg-white/[0.02] backdrop-blur-sm animate-scale-in delay-600">
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
           <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
           
           <div className="rounded-[20px] overflow-hidden shadow-2xl border border-white/10 bg-black">
              <div className="bg-white/[0.03] border-b border-white/5 p-4 flex items-center justify-between">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/10 border border-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/10 border border-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/10 border border-green-500/20" />
                 </div>
                 <div className="bg-neutral-900/50 border border-white/5 rounded-lg px-4 py-1.5 text-[10px] text-muted font-black tracking-widest uppercase italic">https://app.harvestai.io / console</div>
                 <div className="w-10 h-0.5 bg-white/5 rounded-full" />
              </div>
              <div className="p-12 h-[500px] bg-black relative flex flex-col justify-center items-center">
                 <div className="w-full max-w-3xl space-y-8 animate-pulse-slow">
                    <div className="h-4 w-1/4 bg-white/5 rounded-full" />
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 h-32 bg-white/[0.03] border border-white/5 rounded-2xl" />
                        <div className="col-span-4 h-24 bg-white/[0.02] border border-white/5 rounded-2xl" />
                        <div className="col-span-8 h-24 bg-white/[0.02] border border-white/5 rounded-2xl" />
                    </div>
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>
           </div>
        </div>
      </section>

      {/* ── Feature Bento Grid ── */}
      <section className="py-20 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bento-card col-span-1 md:col-span-2 group">
              <span className="section-label">Targeting System</span>
              <div className="text-4xl mb-6 group-hover:scale-110 group-hover:rotate-[5deg] transition-all duration-500 origin-left">🎯</div>
              <h3 className="text-3xl font-black text-primary mb-4 italic">Precision Harvesting</h3>
              <p className="text-secondary text-base leading-relaxed max-w-xl">Hunt through directory layers to return scored, high-value leads. Full contact vector extraction with confidence scoring included.</p>
            </div>
            
            <div className="bento-card group">
              <span className="section-label">Engine Core</span>
              <div className="text-4xl mb-6 group-hover:-translate-y-2 transition-transform">🧠</div>
              <h3 className="text-3xl font-black text-primary mb-4 italic">Natural Intelligence</h3>
              <p className="text-secondary text-base leading-relaxed">Describe your extraction payload in plain English. No more selectors, just raw intent.</p>
            </div>
            
            <div className="bento-card group border-accent/10">
              <span className="section-label text-accent">Data Logistics</span>
              <div className="text-4xl mb-6 group-hover:translate-x-2 transition-transform">🚀</div>
              <h3 className="text-3xl font-black text-primary mb-4 italic">Instant Export</h3>
              <p className="text-secondary text-base leading-relaxed">Download clean CSV datasets in one click. Production-ready data in seconds, not hours.</p>
            </div>

            <div className="bento-card col-span-1 md:col-span-2 group overflow-hidden bg-accent/[0.01]">
               <span className="section-label">Scalability</span>
               <h3 className="text-3xl font-black text-primary mb-4 italic">Built-in Multi-Region Clusters</h3>
               <p className="text-secondary text-base leading-relaxed">Every lead is automatically scored by our ranking engine based on completeness and data freshness across 12 global regions.</p>
               <div className="mt-12 flex gap-4 opacity-10 group-hover:opacity-30 transition-all duration-1000 grayscale group-hover:grayscale-0">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="min-w-[140px] h-24 bg-accent/20 border border-accent/30 rounded-2xl flex items-center justify-center font-black text-accent italic">REGION_{i}</div>
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

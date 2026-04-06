import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { api } from '../lib/api';
import AuthModal from '../components/AuthModal';

const PLANS = [
  { id: 'starter', name: 'Starter Batch', credits: 100, price: 5000, currency: 'NGN', desc: 'Single-harvest deployment.' },
  { id: 'pro', name: 'Pro Harvester', credits: 300, price: 12000, currency: 'NGN', desc: 'The industrial industry standard.', popular: true },
  { id: 'power', name: 'Infinite Pack', credits: 500, price: 18000, currency: 'NGN', desc: 'Max throughput at baseline cost.' },
];

declare global {
  interface Window {
    FlutterwaveCheckout: (params: any) => void;
  }
}

export default function Pricing() {
  const { user } = useAuth();
  const { refreshCredits } = useCredits();
  const [loading, setLoading] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState<{isOpen: boolean, mode: 'login' | 'signup'}>({
    isOpen: false,
    mode: 'signup'
  });

  const handlePurchase = async (plan: typeof PLANS[0]) => {
    if (!user) {
      setAuthModal({ isOpen: true, mode: 'signup' });
      return;
    }
    setLoading(plan.id);

    try {
      const { data } = await api.post('/api/credits/initialize', {
        planId: plan.id,
        amount: plan.price,
        currency: plan.currency
      });

      window.FlutterwaveCheckout({
        public_key: data.public_key,
        tx_ref: data.tx_ref,
        amount: plan.price,
        currency: plan.currency,
        payment_options: 'card, banktransfer, ussd',
        customer: {
          email: user.email,
          name: user.displayName || 'HarvestAI User',
        },
        meta: { planId: plan.id },
        customizations: {
          title: 'HarvestAI Credits',
          description: `Payment for ${plan.credits} credits`,
          logo: 'https://raw.githubusercontent.com/truewebsolutions/harvestai/main/logo.png',
        },
        callback: async (response: any) => {
          await api.post('/api/credits/verify', { transaction_id: response.transaction_id });
          refreshCredits();
          alert('Credits added successfully!');
          setLoading(null);
        },
        onclose: () => {
          setLoading(null);
        }
      });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to initialize payment');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] pt-40 pb-40 px-10 relative">
      <div className="mesh-bg" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 max-w-2xl mx-auto animate-fade-in">
          <div className="hero-badge mx-auto mb-8">Data Acquisition Tiers</div>
          <h1 className="text-6xl font-black text-primary tracking-tighter mb-6 italic">Investment Tiers</h1>
          <p className="text-secondary text-sm font-medium tracking-widest uppercase opacity-60">
            Select your harvest capacity and unlock industrial-grade intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {PLANS.map((plan, i) => (
            <div 
              key={plan.id} 
              className={`bento-card relative flex flex-col p-12 animate-slide-up bg-white/[0.01] hover:bg-white/[0.03]
                ${plan.popular ? 'border-accent shadow-glow bg-accent/[0.02]' : 'border-default'}
              `}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {plan.popular && (
                <div className="absolute top-0 right-14 -translate-y-1/2 bg-accent text-black text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl shadow-accent/20">RECOMMENDED_ACQUISITION</div>
              )}
              
              <div className="mb-14">
                <span className="section-label mb-3">PLAN_IDENT_{plan.id.toUpperCase()}</span>
                <h3 className="text-3xl font-black text-primary italic leading-none">{plan.name}</h3>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-4 leading-relaxed">{plan.desc}</p>
              </div>
              
              <div className="flex items-baseline gap-3 mb-14 pb-10 border-b border-white/5 relative">
                <span className="text-6xl font-black text-primary tracking-tighter italic">{plan.price.toLocaleString()}</span>
                <span className="text-sm font-black text-muted uppercase tracking-[0.2em] font-mono">{plan.currency}</span>
              </div>

              <div className="space-y-6 mb-16">
                {[
                  `${plan.credits} AI Harvester Credits`,
                  'Priority GPU Processing',
                  'Advanced Scraper Clusters',
                  'Instant CSV Manifest'
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-4 group/feat">
                    <div className="w-5 h-5 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-[10px] text-accent font-black transition-colors group-hover/feat:bg-accent group-hover/feat:text-black">✓</div>
                    <span className="text-xs font-black text-primary uppercase tracking-tighter italic opacity-80 group-hover/feat:opacity-100 transition-opacity">{feat}</span>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => handlePurchase(plan)}
                disabled={loading === plan.id}
                className={`btn w-full py-5 text-base tracking-widest transition-all active:scale-95 ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
              >
                {loading === plan.id ? 'Connecting Gateway...' : 'Initialize Acquisition →'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-32 p-14 bento-card flex flex-col lg:flex-row items-center justify-between gap-12 max-w-5xl mx-auto border-white/5 bg-white/[0.01] backdrop-blur-3xl animate-fade-in transition-all hover:bg-white/[0.02]">
          <div className="flex-1">
             <div className="flex items-center gap-4 mb-4">
                 <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                 <span className="text-[10px] font-black text-accent uppercase tracking-[0.4em] italic">Enterprise Grade</span>
             </div>
            <h4 className="text-3xl font-black text-primary mb-5 italic">Dedicated Scraper Infrastructure</h4>
            <p className="text-secondary text-base leading-relaxed max-w-xl opacity-80">
              HarvestAI delivers ultra-high throughput to clusters requiring 10M+ extractions. If you need bespoke logic and dedicated agents, our engineering team is standing by.
            </p>
          </div>
          <button className="btn btn-secondary px-10 py-4 whitespace-nowrap text-xs font-black tracking-widest">Connect Engineering →</button>
        </div>
      </div>
      
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({...authModal, isOpen: false})} 
        initialMode={authModal.mode} 
      />

      <script src="https://checkout.flutterwave.com/v3.js" defer />
    </div>
  );
}

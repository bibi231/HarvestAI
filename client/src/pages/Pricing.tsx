import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { api } from '../lib/api';
import AuthModal from '../components/AuthModal';

const PLANS = [
  { id: 'starter', name: 'Starter Batch', credits: 100, price: 5000, currency: 'NGN', desc: 'Perfect for one-off research projects.' },
  { id: 'pro', name: 'Pro Harvester', credits: 300, price: 12000, currency: 'NGN', desc: 'The industry standard for data teams.', popular: true },
  { id: 'power', name: 'Infinite Pack', credits: 500, price: 18000, currency: 'NGN', desc: 'Maximum throughput at the lowest cost.' },
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
    <div className="min-h-screen bg-base pt-32 pb-32 px-6">
      <div className="mesh-bg" />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="hero-badge mx-auto mb-6">Scale your infrastructure</div>
          <h1 className="text-5xl font-black text-primary tracking-tight mb-4">Investment Tiers</h1>
          <p className="text-secondary text-base lg:text-lg">
            Harvest data without limits. All plans include full access to both Lead Finder and Data Extractor engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, i) => (
            <div 
              key={plan.id} 
              className={`bento-card relative flex flex-col p-10 animate-in fade-in slide-in-from-bottom-8 duration-700
                ${plan.popular ? 'border-accent ring-1 ring-accent/30 shadow-2xl shadow-accent/20 bg-accent/[0.03]' : 'bg-neutral-950/20'}
              `}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {plan.popular && (
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-accent text-black text-[10px] font-black px-3 py-1 rounded uppercase tracking-tighter">Most Efficient</div>
              )}
              
              <div className="mb-10">
                <h3 className="text-2xl font-black text-primary mb-2 italic">_{plan.name}</h3>
                <p className="text-xs text-muted font-medium uppercase tracking-widest">{plan.desc}</p>
              </div>
              
              <div className="flex items-baseline gap-2 mb-10 pb-8 border-b border-default">
                <span className="text-5xl font-black text-primary tracking-tighter">{plan.price.toLocaleString()}</span>
                <span className="text-xs font-bold text-muted uppercase tracking-widest">{plan.currency}</span>
              </div>

              <div className="space-y-4 mb-auto">
                <div className="flex items-center gap-3">
                    <span className="text-accent text-lg">✓</span>
                    <span className="text-sm font-bold text-primary">{plan.credits} AI Harvester Credits</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-accent text-lg">✓</span>
                    <span className="text-sm font-bold text-primary">Priority GPU Queues</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-accent text-lg">✓</span>
                    <span className="text-sm font-bold text-primary">Industrial-rate Scrapers</span>
                </div>
              </div>
              
              <button 
                onClick={() => handlePurchase(plan)}
                disabled={loading === plan.id}
                className={`btn btn-full py-4 mt-12 transition-all active:scale-95 ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
              >
                {loading === plan.id ? 'Connecting Gateway...' : 'Initialize Acquisition →'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 p-10 bento-card flex flex-col lg:flex-row items-center justify-between gap-10 max-w-5xl mx-auto text-left border-default bg-elevated/40 backdrop-blur-3xl">
          <div className="flex-1">
            <h4 className="text-2xl font-black text-primary mb-2 italic">Enterprise Scraper Clusters</h4>
            <p className="text-sm text-secondary font-medium leading-relaxed max-w-xl">
              HarvestAI can scale to 10M+ extractions per month. If you need bespoke data pipelines, dedicated server clusters, or custom crawler logic for deep enterprise sources, our engineering team is ready to scale with you.
            </p>
          </div>
          <button className="btn btn-secondary px-8 py-3 whitespace-nowrap">Contact Enterprise Engineering →</button>
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

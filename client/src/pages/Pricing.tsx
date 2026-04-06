import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { api } from '../lib/api';

const PLANS = [
  { id: 'starter', name: 'Starter Batch', credits: 100, price: 5000, currency: 'NGN', desc: 'Perfect for small research projects.' },
  { id: 'pro', name: 'Pro Harvester', credits: 300, price: 12000, currency: 'NGN', desc: 'For agencies and power users.', popular: true },
  { id: 'power', name: 'Infinite Pack', credits: 500, price: 18000, currency: 'NGN', desc: 'Maximum data, minimum friction.' },
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

  const handlePurchase = async (plan: typeof PLANS[0]) => {
    if (!user) return alert('Please login first');
    setLoading(plan.id);

    try {
      // 1. Initialize payment on backend to get reference
      const { data } = await api.post('/api/credits/initialize', {
        planId: plan.id,
        amount: plan.price,
        currency: plan.currency
      });

      // 2. Open Flutterwave Inline
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
          console.log('Payment Successful', response);
          // Verify on backend
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
    <div className="min-h-screen bg-base pt-32 pb-20 px-6">
      <div className="mesh-bg" />
      <div className="max-w-5xl mx-auto text-center">
        <div className="hero-badge mx-auto">Flexible Credit Packs</div>
        <h1 className="text-5xl font-black text-primary tracking-tight mb-4">Fuelling your next harvest.</h1>
        <p className="text-secondary max-w-lg mx-auto mb-16">
          Simple, effective credit pricing. One credit equals one AI-enriched extraction. 
          No monthly commitment, just the data you need.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`bento-card ${plan.popular ? 'border-accent shadow-accent' : ''} flex flex-col items-center text-center`}>
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-accent text-black text-[10px] font-black px-2 py-0.5 rounded uppercase">Most Popular</div>
              )}
              <h3 className="text-xl font-black text-primary mb-2">{plan.name}</h3>
              <p className="text-xs text-muted mb-8">{plan.desc}</p>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-black text-primary">{plan.price.toLocaleString()}</span>
                <span className="text-sm font-bold text-muted">{plan.currency}</span>
              </div>
              <div className="text-sm font-black text-accent mb-10">{plan.credits} AI Extractions</div>
              
              <button 
                onClick={() => handlePurchase(plan)}
                disabled={loading === plan.id}
                className={`btn btn-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
              >
                {loading === plan.id ? 'Processing...' : 'Get Started →'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 p-8 bento-card flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto text-left">
          <div className="flex-1">
            <h4 className="text-xl font-bold text-primary mb-2">Need a custom enterprise plan?</h4>
            <p className="text-sm text-secondary">Looking for 10k+ credits or custom scraping clusters for deep enterprise data? Our team can build a custom solution for your engineering needs.</p>
          </div>
          <button className="btn btn-secondary whitespace-nowrap">Contact Enterprise →</button>
        </div>
      </div>
      
      {/* Flutterwave Script */}
      <script src="https://checkout.flutterwave.com/v3.js" defer />
    </div>
  );
}

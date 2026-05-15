import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHarvestStore } from '../store/harvestStore';
import { Icon } from './shared/Icon';

interface Plan {
  name: string;
  credits: number;
  price: string;
  currency: string;
  desc: string;
  popular?: boolean;
}

const NGN_PRICES: Plan[] = [
  { name: 'Starter', credits: 100, price: '2,000', currency: '₦', desc: 'Perfect for small research tasks' },
  { name: 'Pro', credits: 300, price: '5,000', currency: '₦', desc: 'Best for sales teams & startups', popular: true },
  { name: 'Power', credits: 1000, price: '12,000', currency: '₦', desc: 'Enterprise data extraction' },
];

const USD_PRICES: Plan[] = [
  { name: 'Starter', credits: 100, price: '5', currency: '$', desc: 'Perfect for small research tasks' },
  { name: 'Pro', credits: 300, price: '12', currency: '$', desc: 'Best for sales teams & startups', popular: true },
  { name: 'Power', credits: 1000, price: '29', currency: '$', desc: 'Enterprise data extraction' },
];

export function PricingSection() {
  const { currency, setCurrency } = useHarvestStore();
  const plans = currency === 'NGN' ? NGN_PRICES : USD_PRICES;

  return (
    <section className="max-w-6xl mx-auto mb-32 px-6">
      <div className="text-center mb-20">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-label"
        >
          Scalable Infrastructure
        </motion.span>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-6xl italic font-display tracking-tight mb-8"
        >
          High-Velocity <span className="text-accent underline decoration-white/5 underline-offset-8">Credit Packs.</span>
        </motion.h2>

        {/* Currency Toggle */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-6 mt-10"
        >
          <button 
            onClick={() => setCurrency('NGN')}
            className={`text-xs font-black uppercase tracking-[0.2em] transition-all ${currency === 'NGN' ? 'text-accent' : 'text-white/20 hover:text-white'}`}
          >
            Naira (NGN)
          </button>
          
          <button 
            onClick={() => setCurrency(currency === 'NGN' ? 'USD' : 'NGN')}
            className="w-14 h-7 rounded-full bg-white/5 border border-white/10 relative p-1 transition-all hover:border-accent/40 group"
          >
            <div className={`w-5 h-5 rounded-full bg-accent shadow-[0_0_15px_var(--accent)] transition-all duration-300 ${currency === 'USD' ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
          
          <button 
            onClick={() => setCurrency('USD')}
            className={`text-xs font-black uppercase tracking-[0.2em] transition-all ${currency === 'USD' ? 'text-accent' : 'text-white/20 hover:text-white'}`}
          >
            US Dollar (USD)
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <AnimatePresence mode="wait">
          {plans.map((plan, i) => (
            <motion.div 
              key={`${currency}-${plan.name}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={`bento-card group flex flex-col items-center text-center !p-10 ${plan.popular ? 'border-accent/40 shadow-glow' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-accent text-[10px] font-black uppercase tracking-widest text-black shadow-lg shadow-accent/20">
                  Most Popular
                </div>
              )}

              <span className="section-label !m-0 !mb-6 !text-white/40 tracking-[0.3em] group-hover:!text-accent transition-colors">{plan.name}</span>
              
              <div className="text-5xl font-black italic font-display mb-3 tracking-tighter group-hover:scale-110 transition-transform duration-500">
                <span className="text-white/40 text-2xl align-top mr-1 font-bold">{plan.currency}</span>
                {plan.price}
              </div>
              
              <div className="flex items-center gap-2 mb-8 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
                <Icon name="target" size={14} className="text-accent" />
                <span className="text-xs font-black tracking-tight text-white/80">{plan.credits.toLocaleString()} Credits</span>
              </div>

              <p className="text-white/30 text-xs font-bold mb-10 h-8 line-clamp-2">{plan.desc}</p>

              <ul className="text-left w-full space-y-4 mb-10">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon name="check" className="text-accent w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-white/50 group-hover:text-white/80 transition-colors">Instant Verification</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon name="check" className="text-accent w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-white/50 group-hover:text-white/80 transition-colors">Bulk Scraper Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon name="check" className="text-accent w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-white/50 group-hover:text-white/80 transition-colors">AI Relevance Scoring</span>
                </li>
              </ul>

              <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`btn w-full h-14 ${plan.popular ? 'btn-primary' : 'btn-secondary'} shadow-2xl transition-all`}
              >
                Top up {plan.name}
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Sparkles */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
    </section>
  );
}

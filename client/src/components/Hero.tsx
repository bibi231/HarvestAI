import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from './shared/Icon';

export function Hero() {
  const scrollToInput = () => {
    document.getElementById('harvest-config')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative z-10 pt-32 pb-24 px-6 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <Icon name="shieldCheck" className="text-accent w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Trusted by 2,000+ Lead Experts</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-8xl mb-8 tracking-tight font-bold leading-[1.05] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
        >
          Harvest leads while you <span className="text-accent">sleep.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto font-medium mb-12 leading-relaxed"
        >
          Pick a niche. Set your filters. Get 500+ professional leads in seconds. Powered by AI, built for modern growth hackers.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToInput}
            className="btn btn-primary h-12 px-8 text-sm w-full sm:w-auto"
          >
            Try it free →
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="btn btn-secondary border-white/20 h-12 px-8 text-sm w-full sm:w-auto"
          >
            See pricing
          </motion.button>
        </motion.div>

        {/* Floaties */}
        <div className="absolute top-1/2 left-0 w-24 h-24 bg-accent/20 rounded-full blur-[60px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[80px] animate-pulse pointer-events-none" />
      </div>
    </section>
  );
}

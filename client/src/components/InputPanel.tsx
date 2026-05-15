import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHarvestStore } from '../store/harvestStore';
import { Icon } from './shared/Icon';

export function InputPanel() {
  const { mode, setMode, isHarvesting, startHarvest } = useHarvestStore();

  return (
    <div id="harvest-config" className="bento-card flex flex-col gap-8 h-full min-h-[500px]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="section-label !m-0 tracking-[0.2em]">Configuration</span>
          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">v2.4 Engine Active</span>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner">
          <button 
            onClick={() => setMode('leads')}
            className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${mode === 'leads' ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white'}`}
          >
            Lead Finder
          </button>
          <button 
            onClick={() => setMode('extract')}
            className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${mode === 'extract' ? 'bg-accent text-black shadow-lg shadow-accent/20' : 'text-white/40 hover:text-white'}`}
          >
            Data Extractor
          </button>
        </div>
      </div>

      <div className="space-y-8 flex-1">
        <AnimatePresence mode="wait">
          {mode === 'leads' ? (
            <motion.div 
              key="lead"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                  <Icon name="search" size={12} className="text-accent" />
                  Target Industry / Business Type
                </label>
                <input 
                  type="text" 
                  className="w-full h-14 !px-6 !text-sm" 
                  placeholder="e.g. Solar Installation Companies, SaaS Startups" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                  <Icon name="mapPin" size={12} className="text-accent" />
                  Target Geo-Location
                </label>
                <input 
                  type="text" 
                  className="w-full h-14 !px-6 !text-sm" 
                  placeholder="e.g. Lagos, Nigeria or San Francisco, US" 
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="extract"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                  <Icon name="globe" size={12} className="text-accent" />
                  Source URLs (One per line)
                </label>
                <textarea 
                  className="w-full h-36 resize-none !px-6 !py-4 !text-sm custom-scrollbar" 
                  placeholder="https://example.com/listings&#10;https://business.inc/deals" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                  <Icon name="database" size={12} className="text-accent" />
                  Data Extraction Logic
                </label>
                <input 
                  type="text" 
                  className="w-full h-14 !px-6 !text-sm" 
                  placeholder="e.g. Extract name, pricing, and features as JSON" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        disabled={isHarvesting}
        onClick={startHarvest}
        className="btn btn-primary h-16 group shadow-2xl shadow-accent/10 disabled:opacity-50 disabled:grayscale transition-all"
      >
        {isHarvesting ? (
          <div className="flex items-center gap-3">
            <Icon name="loader" className="w-5 h-5" />
            <span className="font-black text-sm">Harvesting Pipeline Active...</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Icon name="zap" className="w-5 h-5 fill-black group-hover:animate-pulse" />
            <span className="font-black text-sm">Execute AI Harvesting Engine</span>
          </div>
        )}
      </motion.button>
    </div>
  );
}

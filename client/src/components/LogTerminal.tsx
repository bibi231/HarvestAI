import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHarvestStore } from '../store/harvestStore';
import { Icon } from './shared/Icon';

export function LogTerminal() {
  const { logs, isHarvesting } = useHarvestStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bento-card flex-1 !p-8 bg-black/40 border-accent/20 backdrop-blur-xl relative overflow-hidden group">
      {/* Radiant Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isHarvesting ? 'bg-accent animate-pulse shadow-[0_0_10px_var(--accent)]' : 'bg-white/10'}`} />
          <span className="section-label !m-0 tracking-[0.3em]">Harvest Pipeline — Live Stream</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/20">
          <span className="flex items-center gap-1.5"><Icon name="globe" size={10} className="text-accent/40" /> SSE Protocol</span>
          <span className="flex items-center gap-1.5"><Icon name="shieldCheck" size={10} className="text-accent/40" /> Verified</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="h-[320px] overflow-y-auto space-y-4 font-mono text-[11px] leading-relaxed pr-6 custom-scrollbar"
      >
        <AnimatePresence>
          {logs.length === 0 && !isHarvesting && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center gap-4 text-white/10 italic"
            >
              <Icon name="database" size={32} className="opacity-10" />
              <span>Initialize the harvesting engine to view live data pipeline...</span>
            </motion.div>
          )}

          {logs.map((log, index) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-4 group/log hover:bg-white/5 p-1 rounded transition-colors"
            >
              <span className="text-white/20 select-none">{log.timestamp}</span>
              <span className="text-accent/60 font-black select-none">
                [{log.status === 'success' ? '✓' : '✗'}]
              </span>
              <span className="text-white/70 group-hover/log:text-white transition-colors">
                {log.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {isHarvesting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 p-1"
          >
            <span className="text-white/10 animate-pulse">--:--:--</span>
            <span className="text-accent/40 animate-pulse">[...]</span>
            <span className="text-white/30 italic flex items-center gap-2">
              Streaming event data from distributed nodes...
              <Icon name="loader" size={10} className="animate-spin text-accent" />
            </span>
          </motion.div>
        )}
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
    </div>
  );
}

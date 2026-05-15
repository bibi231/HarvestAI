import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHarvestStore } from '../store/harvestStore';
import { ExportButton } from './harvest/ExportButton';

export const ResultsTable = React.memo(function ResultsTable() {
  const { results, isHarvesting, mode, jobId, searchQuery, setSearchQuery } = useHarvestStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [results, mode]);

  if (results.length === 0 && !isHarvesting && !jobId) {
    return (
      <div className="empty-state flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
        <div className="empty-icon text-amber opacity-30 mb-6">
          <svg className="w-20 h-20" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMidYMid meet">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        <h3 className="empty-h text-xl font-bold tracking-tight text-white/80">Ready to harvest</h3>
        <p className="empty-p text-sm text-white/40 max-w-sm mt-3">
          Configure your job settings on the left and click Start Harvest.
        </p>
        <div className="mt-8 flex gap-3 opacity-60">
          <div className="empty-hint bg-bg-3 px-4 py-2 rounded-lg border border-border-1 text-xs text-white/50">8 job modes</div>
          <div className="empty-hint bg-bg-3 px-4 py-2 rounded-lg border border-border-1 text-xs text-white/50">CSV / JSON export</div>
          <div className="empty-hint bg-bg-3 px-4 py-2 rounded-lg border border-border-1 text-xs text-white/50">Job history</div>
        </div>
      </div>
    );
  }

  if (results.length === 0 && !isHarvesting && jobId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>○</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>No results found</div>
        <p style={{ fontSize: 13, color: 'var(--text-3)', maxWidth: 320, lineHeight: 1.6 }}>
          The job completed but returned no data. Try adjusting your search terms or switching modes.
        </p>
      </div>
    );
  }

  // Filter results by search
  const filteredResults = useMemo(() => {
    return results.filter((r: any) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return Object.values(r).some(val => String(val).toLowerCase().includes(q));
    });
  }, [results, searchQuery]);

  // Dynamic column detection
  const columns = useMemo(() => {
    if (results.length === 0) return [];
    
    // Core fields for leads mode
    if (mode === 'leads') {
      return ['name', 'contact', 'location', 'relevance'];
    }

    // Auto-detect for other modes, filtering junk
    const blacklist = ['id', 'job_id', 'user_id', 'created_at', 'raw_data', 'metadata', 'results', 'screenshot'];
    const allKeys = Array.from(new Set(results.slice(0, 10).flatMap(r => Object.keys(r))));
    return allKeys.filter(k => !blacklist.includes(k)).slice(0, 7);
  }, [results, mode]);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);
  const currentResults = filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatValue = (val: any, col: string) => {
    if (val === null || val === undefined) return <span className="opacity-20 text-[11px] font-mono">NULL</span>;
    
    const sVal = String(val);
    if (sVal.startsWith('http')) {
      return (
        <a href={sVal} target="_blank" rel="noreferrer" className="tbl-link text-amber hover:underline text-[12px] font-medium">
          {sVal.replace(/^https?:\/\/(www\.)?/, '').substring(0, 24)}...
        </a>
      );
    }

    if (col === 'score' || col === 'relevance' || col === 'confidence') {
      const s = Number(val);
      const score = s <= 1 ? s * 100 : s; // normalize if 0-1
      const cls = score >= 80 ? 's5' : score >= 60 ? 's4' : score >= 40 ? 's3' : score >= 20 ? 's2' : 's1';
      return (
        <div className="flex items-center gap-2">
          <span className={`score-dot-indicator ${cls}`} />
          <span className={`score-badge ${cls} text-[10px] font-bold`}>{score.toFixed(0)}%</span>
        </div>
      );
    }

    if (col === 'price') return <span className="text-amber font-bold">{sVal}</span>;
    if (col === 'email') return <span className="text-white/80 select-all tracking-tight font-medium">{sVal}</span>;

    return <span className="text-white/60 truncate block max-w-[200px]" title={sVal}>{sVal}</span>;
  };

  return (
    <div className="output flex flex-col h-full bg-bg">
      <div className="tbl-wrap flex-1 overflow-hidden flex flex-col">
        <div className="tbl-scroll-premium flex-1 overflow-y-auto">
          <table className="tbl tbl-premium w-full text-left">
            <thead className="tbl-header-glassy">
              <tr className="border-b border-border-1 bg-bg-2/80">
                {columns.map(col => (
                  <th key={col} className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.14em] text-white/30 whitespace-nowrap">
                    {col.replace(/_/g, ' ')}
                  </th>
                ))}
                {mode === 'leads' && <th className="px-6 py-4 text-right pr-12 text-[10px] font-black uppercase tracking-[0.14em] text-white/30">Action</th>}
              </tr>
            </thead>
            <tbody>
              {isHarvesting && currentPage === 1 && (
                [...Array(3)].map((_, i) => (
                  <tr key={`skel-${i}`} className="animate-pulse">
                    {columns.map(col => (
                      <td key={`skel-td-${col}`} className="px-6 py-5">
                        <div className="h-2.5 bg-white/5 rounded-full w-24"></div>
                      </td>
                    ))}
                    {mode === 'leads' && <td className="px-6 py-5"><div className="h-8 bg-white/5 rounded-lg w-20 float-right"></div></td>}
                  </tr>
                ))
              )}
              
              <AnimatePresence mode="popLayout">
                {currentResults.map((row, idx) => (
                  <motion.tr 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="border-b border-border-1/30 hover:bg-white/[0.02] group"
                  >
                    {columns.map(col => (
                      <td key={col} className="px-6 py-5 whitespace-nowrap align-middle">
                        {formatValue(row[col], col)}
                      </td>
                    ))}
                    {mode === 'leads' && (
                      <td className="px-6 py-5 text-right whitespace-nowrap">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="action-verify-btn bg-amber/10 border border-amber/20 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] text-amber hover:bg-amber hover:text-bg-1 transition-all"
                        >
                          Verify ↗
                        </motion.button>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="tbl-pagination py-4 px-6 border-t border-border-1 bg-bg-2/40 backdrop-blur-sm flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Showing Results {((currentPage-1)*itemsPerPage)+1}-{Math.min(currentPage*itemsPerPage, filteredResults.length)} of {filteredResults.length}</span>
            <div className="flex gap-2">
              <button 
                className="btn btn-xs !bg-bg-3 !border-border-1 !px-4 hover:!text-amber"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </button>
              <div className="px-4 py-1.5 flex items-center bg-bg-1 rounded-lg border border-border-1 text-[11px] font-mono text-white/60">
                {currentPage} / {totalPages}
              </div>
              <button 
                className="btn btn-xs !bg-bg-3 !border-border-1 !px-4 hover:!text-amber"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

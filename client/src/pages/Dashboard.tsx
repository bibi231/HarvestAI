import React, { useState, useEffect } from 'react';
import { useCredits } from '../hooks/useCredits';
import { useJobStream } from '../hooks/useJobStream';
import { api } from '../lib/api';
import AppShell from '../components/AppShell';

type Mode = 'leads' | 'extract';

export default function Dashboard() {
  const { credits, refreshCredits } = useCredits();
  const [mode, setMode] = useState<Mode>('leads');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  // Form State
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const { job, isDone } = useJobStream(jobId);
  const status = job?.status ?? null;
  const progress = job?.progress ?? 0;
  const results = job?.results ?? [];
  const error = job?.error ?? null;

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setJobId(null);

    try {
      const endpoint = mode === 'leads' ? '/api/harvest/leads' : '/api/harvest/extract';
      const payload = mode === 'leads' 
        ? { businessType, location } 
        : { urls: [url], description };

      const response = await api.post(endpoint, payload);
      setJobId(response.data.jobId);
      refreshCredits();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start job');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!results || results.length === 0) return;
    const headers = Object.keys(results[0]).join(',');
    const rows = results.map((r: any) => Object.values(r).join(',')).join('\n');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `harvestai_${mode}_results.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <AppShell>
      <div className="space-y-12 animate-slide-up">
        
        {/* ── Dashboard Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div>
            <h1 className="text-5xl font-black text-primary tracking-tighter mb-3 italic">Harvest Center</h1>
            <p className="text-secondary text-sm font-medium uppercase tracking-widest opacity-60">Engine Management & Data Orchestration</p>
          </div>
          <div className="flex gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-default shadow-2xl backdrop-blur-3xl lg:translate-y-2">
            {(['leads', 'extract'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  mode === m 
                    ? 'bg-accent text-black shadow-xl shadow-accent/25' 
                    : 'text-secondary hover:text-primary hover:bg-white/5'
                }`}
              >
                {m === 'leads' ? 'Lead Finder' : 'Data Extractor'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ── Parameters Column ── */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bento-card border-white/5 bg-white/[0.01]">
              <span className="section-label">Payload Configuration</span>
              <form onSubmit={handleStart} className="space-y-6">
                {mode === 'leads' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] italic">Business Category</label>
                      <input 
                        placeholder="e.g. Architectural Firms"
                        value={businessType}
                        onChange={e => setBusinessType(e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] italic">Target Location</label>
                      <input 
                        placeholder="e.g. Lagos, Abuja"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] italic">Source URL</label>
                      <input 
                        placeholder="https://clutch.co/directories/lagos"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] italic">Intelligence Description</label>
                      <textarea 
                        placeholder="Identify every business name, contact info, and rating..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full min-h-[160px] resize-none"
                        required
                      />
                    </div>
                  </>
                )}
                
                <button 
                  disabled={loading || !!jobId && status === 'running' || (credits?.remaining ?? 0) <= 0}
                  className={`btn btn-primary w-full py-5 text-base tracking-widest ${
                    (credits?.remaining ?? 0) <= 0 ? 'grayscale opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Initializing Engine...' : jobId && status === 'running' ? 'Scanning Sources...' : (credits?.remaining ?? 0) <= 0 ? 'Insufficient Credits' : 'Start Harvesting →'}
                </button>
              </form>
            </div>
            
             <div className="bento-card border-accent/10 bg-accent/[0.02]">
                <div className="flex items-center gap-4">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_var(--accent)]" />
                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em] italic">Engine Status: Nominal</span>
                </div>
             </div>
          </div>

          {/* ── Intelligence Feed Column ── */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            {/* Real-time Monitoring */}
            {jobId && (
              <div className="bento-card border-accent/20 bg-accent/[0.04] animate-scale-in">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center gap-6">
                      <div className="px-4 py-1.5 bg-black/40 border border-default rounded-xl flex items-center gap-3">
                         <span className="text-[10px] font-black text-muted uppercase tracking-tighter italic">CONSOLE_LOG_</span>
                         <span className="text-xs font-mono font-bold text-accent">{jobId.slice(0, 8)}</span>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        status === 'completed' ? 'bg-success/20 text-success border border-success/30' : 
                        status === 'failed' ? 'bg-error/20 text-error border border-error/30' : 'bg-accent/20 text-accent border border-accent/30'
                      }`}>
                        {status}
                      </div>
                   </div>
                   {status === 'completed' && (
                     <button onClick={handleExport} className="btn-secondary px-5 py-2 rounded-xl text-[10px] uppercase font-black tracking-[0.2em] group">
                       <span className="opacity-60 group-hover:opacity-100 transition-opacity">Manifest Download</span> ↓
                     </button>
                   )}
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em] italic">Extraction Integrity</span>
                    <span className="text-3xl font-black text-primary font-mono tracking-tighter">{progress}%</span>
                  </div>
                  <div className="h-3 w-full bg-black/50 rounded-full overflow-hidden border border-default p-0.5">
                    <div className="h-full bg-accent rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_var(--accent)]" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Results Table */}
            <div className="bento-card flex-grow overflow-hidden bg-white/[0.01]">
              <div className="flex items-center justify-between mb-10">
                 <span className="section-label mb-0">Harvested Intelligence</span>
                 {results.length > 0 && <span className="text-[10px] font-black text-muted uppercase tracking-widest font-mono">COUNT_{results.length}</span>}
              </div>

              {!jobId ? (
                <div className="flex flex-col items-center justify-center py-40 text-center opacity-20 group cursor-default">
                  <div className="text-6xl mb-8 group-hover:scale-110 transition-transform duration-700 select-none">🌾</div>
                  <div className="text-sm font-black tracking-widest uppercase italic text-primary">Silo is currently empty</div>
                  <div className="text-[9px] mt-3 text-muted uppercase tracking-[0.4em] font-medium leading-none">AWAITING INITIALIZATION PROTOCOL</div>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 text-center">
                  <div className="spinner mb-8" />
                  <div className="text-sm font-black tracking-widest uppercase italic text-accent animate-pulse">Navigating Digital Layers...</div>
                  <div className="text-[10px] text-muted mt-3 uppercase tracking-widest font-black leading-none">PROTOCOL_{mode.toUpperCase()}</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[10px] font-black text-muted uppercase tracking-[0.3em] italic">
                        <th className="pb-6 pr-6 pl-0">Target Entity</th>
                        <th className="pb-6 pr-6">Extraction Details</th>
                        <th className="pb-6 text-right">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {results.map((row: any, i: number) => (
                        <tr key={i} className="group hover:bg-accent/[0.02]">
                          <td className="py-6 pr-6 pl-0">
                            <div className="font-black text-primary text-xl tracking-tighter italic transition-colors group-hover:text-accent leading-none">{row.name || row.title || 'UNKNOWN'}</div>
                            <div className="text-[10px] font-bold text-muted mt-2 uppercase tracking-tighter truncate max-w-[280px] font-mono group-hover:text-secondary transition-colors">{row.website || row.url || '---'}</div>
                          </td>
                          <td className="py-6 pr-6">
                            <div className="text-sm font-black text-secondary leading-none uppercase tracking-tighter">{row.email || 'NO_E_VECTOR'}</div>
                            <div className="text-[11px] text-muted mt-2 font-medium truncate max-w-[240px] italic">{row.phone || row.address || 'NO_META_DATA'}</div>
                          </td>
                          <td className="py-6 text-right">
                            <div className="inline-flex items-center gap-2 text-[10px] font-black text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-lg uppercase tracking-widest italic shadow-sm">
                                <span className="w-1 h-1 rounded-full bg-accent animate-ping" />
                                Scored
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

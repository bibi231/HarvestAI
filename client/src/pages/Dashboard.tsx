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

  const { status, progress, results, error } = useJobStream(jobId);

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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ── Subheader ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-primary tracking-tight mb-2">Harvest Center</h1>
            <p className="text-secondary text-base">Select your extraction mode and define targets.</p>
          </div>
          <div className="flex gap-1 bg-elevated p-1 rounded-xl border border-default shadow-sm">
            {(['leads', 'extract'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-6 py-2 rounded-lg text-[11px] font-black uppercase transition-all duration-300 ${
                  mode === m 
                    ? 'bg-accent text-black shadow-lg shadow-accent/20' 
                    : 'text-secondary hover:text-primary hover:bg-neutral-800'
                }`}
              >
                {m === 'leads' ? 'Lead Finder' : 'Data Extractor'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left: Controls ── */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bento-card bg-neutral-950/40 backdrop-blur-md">
              <h3 className="section-label mb-6">Execution Parameters</h3>
              <form onSubmit={handleStart} className="space-y-5">
                {mode === 'leads' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Business Category</label>
                      <input 
                        className="w-full bg-base/50 border border-default rounded-lg px-4 py-3 text-sm focus:border-accent outline-none transition-all placeholder:opacity-30"
                        placeholder="e.g. Architectural Firms"
                        value={businessType}
                        onChange={e => setBusinessType(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Target Location</label>
                      <input 
                        className="w-full bg-base/50 border border-default rounded-lg px-4 py-3 text-sm focus:border-accent outline-none transition-all placeholder:opacity-30"
                        placeholder="e.g. Lagos, Abuja"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Target URL</label>
                      <input 
                        className="w-full bg-base/50 border border-default rounded-lg px-4 py-3 text-sm focus:border-accent outline-none transition-all placeholder:opacity-30"
                        placeholder="https://clutch.co/directories/lagos"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Extraction Payload Description</label>
                      <textarea 
                        className="w-full bg-base/50 border border-default rounded-lg px-4 py-3 text-sm focus:border-accent outline-none transition-all placeholder:opacity-30 min-h-[120px] resize-none"
                        placeholder="Identify every business name, contact info, and rating..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                
                <button 
                  disabled={loading || !!jobId && status === 'running' || credits <= 0}
                  className={`btn btn-full py-4 mt-4 transition-all duration-500 ${
                    credits <= 0 ? 'opacity-50 cursor-not-allowed grayscale' : 'btn-primary'
                  }`}
                >
                  {loading ? 'Initializing Engine...' : jobId && status === 'running' ? 'Scanning Sources...' : credits <= 0 ? 'Insufficient Credits' : 'Start Harvesting →'}
                </button>
              </form>
            </div>
            
             <div className="bento-card border-accent/10 bg-accent/[0.02]">
                <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-black text-accent uppercase tracking-widest">System Health: Nominal</span>
                </div>
             </div>
          </div>

          {/* ── Right: Output ── */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Live Monitoring Panel */}
            {jobId && (
              <div className="bento-card border-accent/20 bg-accent/[0.03] animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                      <div className="px-3 py-1 bg-elevated border border-default rounded-md flex items-center gap-2">
                         <span className="text-[10px] font-black text-muted uppercase tracking-tighter">JOB_ID_</span>
                         <span className="text-xs font-mono font-bold text-primary">{jobId.slice(0, 8)}</span>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                        status === 'completed' ? 'bg-success/10 text-success' : 
                        status === 'failed' ? 'bg-error/10 text-error' : 'bg-accent/10 text-accent'
                      }`}>
                        {status}
                      </div>
                   </div>
                   {status === 'completed' && (
                     <button onClick={handleExport} className="btn btn-secondary px-4 py-1.5 text-[10px] uppercase font-black tracking-widest">Download CSV ↓</button>
                   )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Extraction Progressive</span>
                    <span className="text-xl font-black text-primary font-mono">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-default">
                    <div className="h-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(245,166,35,0.4)]" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Results Table */}
            <div className="bento-card flex-grow overflow-hidden bg-neutral-950/20">
              <h3 className="section-label mb-8">Harvested Intelligence</h3>
              {!jobId ? (
                <div className="flex flex-col items-center justify-center py-32 text-center opacity-30 select-none">
                  <div className="text-5xl mb-6">🌾</div>
                  <div className="text-sm font-bold tracking-tight text-primary">Silo is empty.</div>
                  <div className="text-xs mt-2 text-muted uppercase tracking-widest">Connect to a data source to begin.</div>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="spinner mb-6" />
                  <div className="text-sm font-bold tracking-tight text-primary">Navigating Digital Terrain...</div>
                  <div className="text-[10px] text-accent mt-2 uppercase tracking-widest font-black animate-pulse">Running {mode} protocol...</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-spacing-0">
                    <thead>
                      <tr className="border-b border-default text-[10px] font-black text-muted uppercase tracking-widest">
                        <th className="pb-4 pr-4">Identified Entity</th>
                        <th className="pb-4 pr-4">Contact Vectors</th>
                        <th className="pb-4 text-right">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-subtle mt-4 block_table_rows">
                      {results.map((row: any, i: number) => (
                        <tr key={i} className="group hover:bg-white/[0.03] transition-all duration-300">
                          <td className="py-5 pr-4 align-top">
                            <div className="font-extrabold text-primary text-base group-hover:text-accent transition-colors">{row.name || row.title || 'Unknown Object'}</div>
                            <div className="text-[10px] font-bold text-muted mt-1 uppercase tracking-tighter truncate max-w-[250px]">{row.website || row.url || '-'}</div>
                          </td>
                          <td className="py-5 pr-4 align-top">
                            <div className="text-sm font-medium text-secondary">{row.email || 'Email missing'}</div>
                            <div className="text-xs text-muted mt-1">{row.phone || row.address || 'Metadata missing'}</div>
                          </td>
                          <td className="py-5 text-right align-top">
                            <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded uppercase tracking-widest">AI Scored</span>
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

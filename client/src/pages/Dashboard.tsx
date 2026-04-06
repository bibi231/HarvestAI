import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCredits } from '../hooks/useCredits';
import { useJobStream } from '../hooks/useJobStream';
import { api } from '../lib/api';

type Mode = 'leads' | 'extract';

export default function Dashboard() {
  const { user } = useAuth();
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
    <div className="min-h-screen bg-base pb-20">
      <div className="mesh-bg" />
      
      {/* ── Subheader ── */}
      <div className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-primary tracking-tight mb-2">My Workspace</h1>
            <p className="text-secondary">Engineered for precision data harvesting.</p>
          </div>
          <div className="flex gap-2 bg-elevated p-1 rounded-xl border border-default">
            {(['leads', 'extract'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                  mode === m 
                    ? 'bg-accent text-black shadow-lg shadow-accent/20' 
                    : 'text-secondary hover:text-primary'
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
            <div className="bento-card">
              <h3 className="section-label mb-6">Execution Parameters</h3>
              <form onSubmit={handleStart} className="space-y-4">
                {mode === 'leads' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-muted uppercase">Business Category</label>
                      <input 
                        className="w-full bg-base border border-default rounded-md px-4 py-2.5 text-sm focus:border-accent outline-none"
                        placeholder="e.g. Real Estate, Law Firms"
                        value={businessType}
                        onChange={e => setBusinessType(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-muted uppercase">Target Location</label>
                      <input 
                        className="w-full bg-base border border-default rounded-md px-4 py-2.5 text-sm focus:border-accent outline-none"
                        placeholder="e.g. Lagos, Nigeria"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-muted uppercase">Source URL</label>
                      <input 
                        className="w-full bg-base border border-default rounded-md px-4 py-2.5 text-sm focus:border-accent outline-none"
                        placeholder="https://example.com/products"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-muted uppercase">Extraction Instructions</label>
                      <textarea 
                        className="w-full bg-base border border-default rounded-md px-4 py-2.5 text-sm focus:border-accent outline-none min-h-[100px]"
                        placeholder="List every product name, price, and SKU..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                
                <button 
                  disabled={loading || !!jobId && status === 'running'}
                  className="btn btn-primary btn-full mt-4"
                >
                  {loading ? 'Initializing...' : jobId && status === 'running' ? 'Processing...' : 'Start Harvesting →'}
                </button>
              </form>
            </div>

            <div className="bento-card">
              <h3 className="section-label mb-4">Account Pulse</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-black text-accent">{credits}</div>
                  <div className="text-[10px] font-bold text-muted uppercase">Credits Available</div>
                </div>
                <div className={`w-3 h-3 rounded-full ${credits > 0 ? 'bg-success animate-pulse' : 'bg-error'}`} />
              </div>
            </div>
          </div>

          {/* ── Right: Output ── */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Status Panel */}
            {jobId && (
              <div className="bento-card border-accent/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-bold text-primary">Job: <span className="text-accent">{jobId.slice(0, 8)}</span></div>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      status === 'completed' ? 'bg-success/10 text-success' : 
                      status === 'failed' ? 'bg-error/10 text-error' : 'bg-accent/10 text-accent'
                    }`}>
                      {status}
                    </div>
                  </div>
                  {status === 'completed' && (
                    <button onClick={handleExport} className="text-xs font-bold text-accent hover:underline">Download CSV ↓</button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-bold text-muted uppercase">
                    <span>Progressive Extraction</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Results Table */}
            <div className="bento-card flex-grow overflow-hidden">
              <h3 className="section-label mb-6">Harvested Data</h3>
              {!jobId ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <div className="text-4xl mb-4">🌾</div>
                  <div className="text-sm font-medium">Waiting for your first harvest.</div>
                  <div className="text-xs mt-1">Submit the parameters to start extraction.</div>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="spinner mb-4" />
                  <div className="text-sm font-medium">Scanning source pages...</div>
                  <div className="text-xs text-muted mt-1 italic">"{mode === 'leads' ? `Searching ${location} for ${businessType}` : `Parsing ${url}`}"</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-default text-[11px] font-bold text-muted uppercase">
                        <th className="pb-4 pr-4">Identity</th>
                        <th className="pb-4 pr-4">Contact Detail</th>
                        <th className="pb-4 text-right">Reputation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-subtle">
                      {results.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 pr-4">
                            <div className="font-bold text-primary">{row.name || row.title || 'Unknown Entity'}</div>
                            <div className="text-[10px] text-muted overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">{row.website || row.url || '-'}</div>
                          </td>
                          <td className="py-4 pr-4 text-secondary">
                            <div>{row.email || 'no-email@found.com'}</div>
                            <div className="text-xs">{row.phone || '-'}</div>
                          </td>
                          <td className="py-4 text-right">
                            <div className="text-xs font-bold text-accent">{row.score || 'Auto'} Scored</div>
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
    </div>
  );
}

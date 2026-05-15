import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useHarvestStore } from '../store/harvestStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ResultsTable } from '../components/ResultsTable';
import { Navbar } from '../components/Navbar';
import { ExportButton } from '../components/harvest/ExportButton';
import { useHarvest } from '../hooks/useHarvest';
import { HARVEST_MODES } from '../types/index';
import type { HarvestMode } from '../types/index';
import { api } from '../lib/api';
import { useJobStream } from '../hooks/useJobStream';

const SCHEDULE_OPTIONS = [
  { v: 'hourly', l: 'Every hour', icon: '⚡' },
  { v: 'daily', l: 'Every day', icon: '📅' },
  { v: 'weekly', l: 'Every week', icon: '📆' },
  { v: 'monthly', l: 'Monthly', icon: '🗓️' },
];

export default function Dashboard() {
  const { user, credits, openPricing } = useAuthStore();
  const { 
    mode, setMode, 
    isHarvesting, 
    logs, 
    jobId, progress,
    results,
    searchQuery, setSearchQuery
  } = useHarvestStore();
  
  const { 
    startLeadJob, startExtractJob, startSerpJob, startSitemapJob,
    startEmailFinderJob, startPriceCheckJob, startBulkCsvJob, startEnrichmentJob,
    isSubmitting 
  } = useHarvest();
  
  // Existing state
  const [businessType, setBusinessType] = useState('');
  const [location, setLocation] = useState('');
  const [urls, setUrls] = useState('');
  const [extractPrompt, setExtractPrompt] = useState('Extract business name, phone number, email and full address into a table.');
  const [maxResults, setMaxResults] = useState(20);
  const [sources, setSources] = useState<string[]>(['vconnect', 'businesslist']);
  const [templates, setTemplates] = useState<any[]>([]);

  // New state for new modes
  const [domain, setDomain] = useState('');
  const [serpQuery, setSerpQuery] = useState('');
  const [numResults, setNumResults] = useState(30);
  const [maxUrls, setMaxUrls] = useState(50);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [priceSelector, setPriceSelector] = useState('');

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleFreq, setScheduleFreq] = useState<'hourly'|'daily'|'weekly'|'monthly'>('daily');

  const [jobError, setJobError] = useState<string | null>(null);

  // Analytics & History State
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [shareLink, setShareLink] = useState<string|null>(null);
  const [token, setToken] = useState<string|null>(null);

  const { job, isDone } = useJobStream(isHarvesting && jobId ? jobId : null);

  useEffect(() => {
    if (job) {
      if (job.progressMessage) useHarvestStore.getState().addLog(job.progressMessage);
      if (job.progress) useHarvestStore.getState().setProgress(job.progress);
    }
  }, [job]);

  useEffect(() => {
    // Only stop harvesting if we have a terminal status for the CURRENT jobId
    if (isDone && jobId && isHarvesting && job?.id === jobId) {
      const status = job?.status;
      if (status !== 'done' && status !== 'failed') {
        console.log('[Dashboard] Job not terminal yet, status:', status);
        return;
      }

      if (status === 'failed') {
        const errMsg = (job as any)?.error || (job as any)?.errorMessage || 'Job failed. Please try again.';
        setJobError(errMsg);
        useHarvestStore.getState().stopHarvest();
        return;
      }

      setJobError(null);
      setTimeout(() => {
        api.get(`/api/jobs/${jobId}/results`).then(res => {
          const data = Array.isArray(res.data) ? res.data : [];
          useHarvestStore.getState().setResults(data);
          useHarvestStore.getState().stopHarvest();
        }).catch(() => {
          useHarvestStore.getState().stopHarvest();
        });
      }, 300);
    }
  }, [isDone, jobId, isHarvesting, job?.id, job?.status]);

  useEffect(() => {
    if (user) user.getIdToken().then(setToken);
  }, [user]);

  useEffect(() => {
    if (!token) return;
    const fetchDash = async () => {
      try {
        const [jbRes, statRes] = await Promise.all([
          api.get('/api/jobs'),
          api.get('/api/jobs/stats/analytics')
        ]);
        
        setJobs(jbRes.data.jobs || []);
        setStats(statRes.data);

        const tRes = await api.get('/api/templates');
        setTemplates(tRes.data.templates || []);
      } catch (e) {
        console.error(e);
      } finally {
        setDashLoading(false);
      }
    };
    fetchDash();
  }, [token, isHarvesting]);

  // Check URL params for mode deep-linking or viewing job history
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('mode');
    if (m && HARVEST_MODES.find(hm => hm.id === m)) {
      setMode(m as HarvestMode);
    }
    const vJob = params.get('viewJob');
    if (vJob) {
      api.get(`/api/jobs/${vJob}`).then(res => {
         useHarvestStore.getState().setJobId(vJob);
         useHarvestStore.getState().setMode(res.data.mode);
         useHarvestStore.getState().setResults(res.data.resultData || []);
         useHarvestStore.getState().setIsHarvesting(false);
         useHarvestStore.getState().setStatus(res.data.status);
         window.history.replaceState({}, '', '/app');
      }).catch(console.error);
    }
  }, []);

  const toggleSource = (id: string) => {
    setSources(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  function getCreditEstimate(): string {
    switch (mode) {
      case 'leads':       return `${sources.length} credit${sources.length !== 1 ? 's' : ''}`;
      case 'extract':     return `${urls.split('\n').filter(Boolean).length} credits`;
      case 'sitemap':     return `~${Math.ceil(maxUrls / 5)} credits`;
      case 'bulk_csv':    return `${csvFile ? '1 per URL in file' : '—'}`;
      case 'serp':        return '3 credits';
      case 'email_finder':return '5 credits';
      case 'price_check': return `${urls.split('\n').filter(Boolean).length} credits`;
      case 'enrich':      return `${csvFile ? '2 per row' : '—'}`;
      default: return '—';
    }
  }

  function getCurrentInputData(): Record<string, unknown> {
    switch (mode) {
      case 'leads': return { businessType, location, sources, maxResults };
      case 'extract': return { urls: urls.split('\n').filter(Boolean), instruction: extractPrompt };
      case 'sitemap': return { domain, instruction: extractPrompt, maxUrls };
      case 'serp': return { query: serpQuery, location, numResults };
      case 'email_finder': return { domain };
      case 'price_check': return { urls: urls.split('\n').filter(Boolean), selector: priceSelector || null };
      default: return {};
    }
  }

  function isSubmitDisabled(): boolean {
    if (isHarvesting || isSubmitting) return true;
    const total = (credits?.freeRemaining ?? 0) + (credits?.paidCredits ?? 0);
    if (total <= 0) return false; // allow click — will show buy modal
    switch (mode) {
      case 'leads': return !businessType.trim();
      case 'extract': return !urls.trim() || !extractPrompt.trim();
      case 'sitemap': return !domain.trim() || !extractPrompt.trim();
      case 'bulk_csv': return !csvFile || !extractPrompt.trim();
      case 'serp': return !serpQuery.trim();
      case 'email_finder': return !domain.trim();
      case 'price_check': return !urls.trim();
      case 'enrich': return !csvFile;
      default: return true;
    }
  }

  const handleRun = async () => {
    const total = (credits?.freeRemaining ?? 0) + (credits?.paidCredits ?? 0);
    if (total <= 0) { openPricing(); return; }
    let id: string | null = null;
    switch (mode) {
      case 'leads':       id = await startLeadJob({ businessType, location, sources, maxResults }); break;
      case 'extract':     id = await startExtractJob({ urls: urls.split('\n').map(u=>u.trim()).filter(Boolean), instruction: extractPrompt }); break;
      case 'sitemap':     id = await startSitemapJob(domain, extractPrompt, maxUrls); break;
      case 'bulk_csv':    if (csvFile) id = await startBulkCsvJob(csvFile, extractPrompt); break;
      case 'serp':        id = await startSerpJob(serpQuery, location, numResults); break;
      case 'email_finder':id = await startEmailFinderJob(domain); break;
      case 'price_check': id = await startPriceCheckJob(urls.split('\n').map(u=>u.trim()).filter(Boolean), priceSelector || undefined); break;
      case 'enrich':      if (csvFile) id = await startEnrichmentJob(csvFile); break;
    }
    if (id) {
      setJobError(null);
      useHarvestStore.getState().setJobId(id);
      useHarvestStore.getState().setStatus('running');
      useHarvestStore.getState().setResults([]);
      useHarvestStore.getState().clearLogs();
      useHarvestStore.getState().setIsHarvesting(true);
      useHarvestStore.getState().setProgress(1);
    }
  };

  const toggleAll = () => {
    if (selectedJobs.length === jobs.length && jobs.length > 0) setSelectedJobs([]);
    else setSelectedJobs(jobs.map(j => j.id));
  };

  const toggleJob = (id: string) => {
    setSelectedJobs(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedJobs];
    setSelectedJobs([]);
    for (const id of ids) {
      try { await api.delete(`/api/jobs/${id}`); } catch (_) {}
    }
    setJobs(prev => prev.filter(j => !ids.includes(j.id)));
  };

  const deleteJob = async (id: string) => {
    try {
      await api.delete(`/api/jobs/${id}`);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch {
      console.error('Failed to delete job');
    }
  };

  const retryJob = async (id: string) => {
    try {
      await api.post(`/api/jobs/${id}/retry`);
      setTimeout(() => { window.location.reload(); }, 1500);
    } catch (e) {
      console.error(e);
    }
  };

  const shareJob = async (id: string) => {
    try {
      const res = await api.post(`/api/jobs/${id}/share`);
      const { shareUrl } = res.data;
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch (_) {}
      setShareLink(shareUrl);
      setTimeout(() => setShareLink(null), 4000);
    } catch {
      console.error('Failed to generate share link');
    }
  };

  const handleSaveTemplate = async () => {
    const name = `Template ${new Date().toLocaleDateString()}`;
    const inputData = getCurrentInputData();
    try {
      const res = await api.post('/api/templates', { name, mode, inputData });
      setTemplates(s => [res.data, ...s]);
    } catch (e) {
      console.error(e);
    }
  };

  const applyTemplate = async (t: any) => {
    setMode(t.mode);
    const d = t.inputData || {};
    setBusinessType(d.businessType || '');
    setLocation(d.location || '');
    setSources(d.sources || []);
    setMaxResults(d.maxResults || 20);
    setUrls(Array.isArray(d.urls) ? d.urls.join('\n') : (d.urls || ''));
    setExtractPrompt(d.instruction || '');
    setDomain(d.domain || '');
    setSerpQuery(d.query || '');
    setNumResults(d.numResults || 30);
    setMaxUrls(d.maxUrls || 50);
    try {
      await api.post(`/api/templates/${t.id}/use`);
    } catch (e) {
      console.error(e);
    }
  };

  const totalCredits = (credits?.freeRemaining ?? 0) + (credits?.paidCredits ?? 0);

  const displayedJobs = useMemo(() => {
    return jobs.filter(j => 
      filter === 'all' || j.mode === filter || (filter === 'extract' && j.mode === 'scrape')
    );
  }, [jobs, filter]);

  const modeAnim = { initial: { opacity: 0, x: 8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -8 }, transition: { duration: 0.18 } };

  // Memoize workspace analytics so it doesn't cause typing lag
  const workspaceAnalytics = useMemo(() => {
    if (dashLoading || !stats) return null;
    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white font-d">Workspace Analytics</h2>
          {shareLink && <div className="text-xs text-[var(--amber)] bg-[var(--amber-d)] px-3 py-1.5 rounded-md border border-[var(--border-a)]">Public Link Copied!</div>}
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-card-v">{stats.totalJobs}</div>
            <div className="analytics-card-l">Total Jobs Run</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-card-v text-green-400">{stats.totalResults}</div>
            <div className="analytics-card-l">Rows Extracted</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-card-v">{stats.successRate}<span className="text-[18px] text-[var(--text-3)] ml-1">%</span></div>
            <div className="analytics-card-l">API Success Rate</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-card-v text-[var(--amber)]">{stats.totalCreditsUsed}</div>
            <div className="analytics-card-l">Credits Utilized</div>
          </div>
        </div>

        {stats.dailyActivity && (
          <div className="activity-chart mb-10 w-full opacity-60">
            {stats.dailyActivity.map((d: any, i: number) => {
              const h = Math.max(4, (d.count / (Math.max(...stats.dailyActivity.map((x:any)=>x.count)) || 1)) * 60);
              return (
                <div key={i} className="activity-bar-wrap group relative">
                  <div className="activity-bar" style={{ height: `${h}px` }} />
                  <div className="absolute bottom-[-20px] activity-bar-label opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="dash-filters !mb-0">
            <button className={`dash-filter ${filter==='all'?'on':''}`} onClick={()=>setFilter('all')}>All Jobs</button>
            <button className={`dash-filter ${filter==='leads'?'on':''}`} onClick={()=>setFilter('leads')}>Leads</button>
            <button className={`dash-filter ${filter==='extract'?'on':''}`} onClick={()=>setFilter('extract')}>Extracts</button>
            <button className={`dash-filter ${filter==='serp'?'on':''}`} onClick={()=>setFilter('serp')}>SERP</button>
            <button className={`dash-filter ${filter==='email_finder'?'on':''}`} onClick={()=>setFilter('email_finder')}>Emails</button>
          </div>
          {selectedJobs.length > 0 && (
            <button onClick={handleBulkDelete} className="text-red-500 font-bold text-xs hover:text-[var(--bg)] hover:bg-red-500 px-3 py-1.5 rounded-md transition-all border border-red-500/20">
              Delete Selected ({selectedJobs.length})
            </button>
          )}
        </div>

        <div className="border border-border-1 rounded-xl overflow-hidden bg-bg-2 shadow-shadow">
          <table className="tbl tbl-premium w-full text-left">
            <thead className="tbl-header-glassy">
              <tr>
                <th className="p-4 w-10 text-center"><input type="checkbox" onChange={toggleAll} checked={selectedJobs.length === displayedJobs.length && displayedJobs.length > 0} className="accent-amber rounded-sm cursor-pointer" /></th>
                <th className="p-4">Job ID</th>
                <th className="p-4">Mode</th>
                <th className="p-4">Status</th>
                <th className="p-4">Results</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedJobs.map(j => {
                const modeInfo = HARVEST_MODES.find(m => m.id === j.mode);
                return (
                  <tr key={j.id} className="group">
                    <td className="p-4 text-center"><input type="checkbox" checked={selectedJobs.includes(j.id)} onChange={()=>toggleJob(j.id)} className="accent-amber rounded-sm cursor-pointer" /></td>
                    <td className="p-4 font-mono text-xs">{j.id.slice(0,8)}</td>
                    <td className="p-4 text-[13px] font-semibold text-white/80">
                      <span style={{ marginRight: 4 }}>{modeInfo?.icon}</span>
                      {modeInfo?.label ?? j.mode}
                    </td>
                    <td className="p-4 capitalize">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${j.status==='done'?'bg-[#10b9811a] text-[#10b981]':j.status==='failed'?'bg-[#ef44441a] text-[#ef4444]':'bg-amber-d text-amber'}`}>{j.status}</span>
                    </td>
                    <td className="p-4 font-mono text-xs">{j.resultCount || 0}</td>
                    <td className="p-4 text-[12px] text-white/30">{new Date(j.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <button
                        onClick={() => window.location.href = '/app?viewJob=' + j.id}
                        style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: 'var(--bg-4)', border: '1px solid var(--border-2)', color: 'var(--text-1)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >View</button>
                      {j.status === 'failed' && (
                        <button
                          onClick={() => retryJob(j.id)}
                          style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.3)', color: '#f5a623', cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >Retry</button>
                      )}
                      <button
                        onClick={() => deleteJob(j.id)}
                        style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >Delete</button>
                    </td>
                  </tr>
                );
              })}
              {displayedJobs.length === 0 && (
                <tr><td colSpan={7} className="p-12 text-center text-white/20 text-sm italic">No extraction history found. Run a job to see it here.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }, [stats, filter, selectedJobs, jobs, displayedJobs, shareLink, dashLoading]);

  return (
    <div className="app-shell">
      <Navbar />
      
      <main className="app-body">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-inner">
            <div className="field">
              <span className="field-label">Harvest Mode</span>
              {/* 8-mode grid selector */}
              <div className="mode-grid-selector">
                {HARVEST_MODES.map(m => (
                  <button
                    key={m.id}
                    className={`mode-grid-btn${mode === m.id ? ' on' : ''}`}
                    onClick={() => { setMode(m.id); useHarvestStore.getState().setJobId(null); }}
                  >
                    <span className="mode-grid-icon">{m.icon}</span>
                    <span className="mode-grid-label">{m.label}</span>
                    {m.badge && <span className="mode-grid-badge">{m.badge}</span>}
                  </button>
                ))}
              </div>
              <div className="mode-credit-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {HARVEST_MODES.find(m => m.id === mode)?.creditNote}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* LEADS */}
              {mode === 'leads' && (
                <motion.div key="lead-inputs" {...modeAnim} className="space-y-4">
                  <div className="field">
                    <span className="field-label">Business Type</span>
                    <input className="input" placeholder="e.g. Solar installers, Pharmacy" value={businessType} onChange={e => setBusinessType(e.target.value)} />
                  </div>
                  <div className="field">
                    <span className="field-label">Location</span>
                    <input className="input" placeholder="e.g. Lagos, Abuja, Port Harcourt" value={location} onChange={e => setLocation(e.target.value)} />
                  </div>
                  <div className="field">
                    <span className="field-label">Target Sources</span>
                    <div className="sources">
                      {[
                        { id: 'vconnect', label: 'VConnect Nigeria', flag: '🇳🇬' },
                        { id: 'businesslist', label: 'BusinessList.com.ng', flag: '🇳🇬' },
                        { id: 'google', label: 'Google Maps / Local', flag: '🌍' },
                      ].map(s => (
                        <button key={s.id} className={`source ${sources.includes(s.id) ? 'on' : ''}`} onClick={() => toggleSource(s.id)}>
                          <span>{s.flag}</span>{s.label}{sources.includes(s.id) && <span className="source-check">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* EXTRACT */}
              {mode === 'extract' && (
                <motion.div key="scrape-inputs" {...modeAnim} className="space-y-4">
                  <div className="field">
                    <span className="field-label">URLs to Scrape</span>
                    <textarea className="textarea" rows={5} placeholder="Enter one URL per line..." value={urls} onChange={e => setUrls(e.target.value)} />
                  </div>
                  <div className="field">
                    <span className="field-label">Extraction Prompt</span>
                    <textarea className="textarea" rows={3} placeholder="What data should we find?" value={extractPrompt} onChange={e => setExtractPrompt(e.target.value)} />
                  </div>
                </motion.div>
              )}

              {/* SITEMAP CRAWLER */}
              {mode === 'sitemap' && (
                <motion.div key="sitemap" {...modeAnim} className="space-y-4">
                  <div className="field">
                    <span className="field-label">Website domain</span>
                    <input className="input" value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. example.com or shop.example.com" />
                  </div>
                  <div className="field">
                    <span className="field-label">What to extract from each page</span>
                    <textarea className="textarea" value={extractPrompt} onChange={e => setExtractPrompt(e.target.value.slice(0,500))} placeholder="e.g. Extract all product names and prices" rows={3} />
                  </div>
                  <div className="field">
                    <span className="field-label">Max pages to crawl</span>
                    <div className="max-row">
                      {[25, 50, 100, 200].map(n => (
                        <button key={n} className={`max-btn${maxUrls === n ? ' on' : ''}`} onClick={() => setMaxUrls(n)}>{n}</button>
                      ))}
                    </div>
                    <div className="field-hint">1 credit per 5 pages · {Math.ceil(maxUrls / 5)} credits estimated</div>
                  </div>
                </motion.div>
              )}

              {/* BULK CSV */}
              {mode === 'bulk_csv' && (
                <motion.div key="bulk_csv" {...modeAnim} className="space-y-4">
                  <div className="field">
                    <span className="field-label">Upload CSV file</span>
                    <div
                      className={`csv-dropzone${csvFile ? ' has-file' : ''}`}
                      onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.name.endsWith('.csv')) setCsvFile(f); }}
                      onDragOver={e => e.preventDefault()}
                      onClick={() => document.getElementById('csv-input')?.click()}
                    >
                      <input id="csv-input" type="file" accept=".csv" style={{ display:'none' }} onChange={e => setCsvFile(e.target.files?.[0] ?? null)} />
                      {csvFile ? (
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:14, fontWeight:600, color:'var(--text-1)', marginBottom:4 }}>📄 {csvFile.name}</div>
                          <div style={{ fontSize:12, color:'var(--text-3)' }}>{(csvFile.size / 1024).toFixed(1)} KB</div>
                        </div>
                      ) : (
                        <div style={{ textAlign:'center', color:'var(--text-3)' }}>
                          <div style={{ fontSize:22, marginBottom:8 }}>📁</div>
                          <div style={{ fontSize:13 }}>Drop a CSV here or click to browse</div>
                          <div style={{ fontSize:11, marginTop:4 }}>Must have a "url" or "link" column</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="field">
                    <span className="field-label">What to extract from each URL</span>
                    <textarea className="textarea" value={extractPrompt} onChange={e => setExtractPrompt(e.target.value.slice(0,500))} placeholder="e.g. Get the product name, price, and description" rows={3} />
                  </div>
                </motion.div>
              )}

              {/* GOOGLE SERP */}
              {mode === 'serp' && (
                <motion.div key="serp" {...modeAnim} className="space-y-4">
                  <div className="field">
                    <span className="field-label">Search query</span>
                    <input className="input" value={serpQuery} onChange={e => setSerpQuery(e.target.value)} placeholder="e.g. best Nigerian fintech companies 2024" />
                  </div>
                  <div className="field">
                    <span className="field-label">Location (optional)</span>
                    <input className="input" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Nigeria, Lagos, United Kingdom" />
                  </div>
                  <div className="field">
                    <span className="field-label">Number of results</span>
                    <div className="max-row">
                      {[10, 20, 30, 50].map(n => (
                        <button key={n} className={`max-btn${numResults === n ? ' on' : ''}`} onClick={() => setNumResults(n)}>{n}</button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* EMAIL FINDER */}
              {mode === 'email_finder' && (
                <motion.div key="email_finder" {...modeAnim} className="space-y-4">
                  <div className="field">
                    <span className="field-label">Company domain</span>
                    <input className="input" value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. flutterwave.com or paystack.com" />
                    <div className="field-hint">HarvestAI scans the website, team page, and contact page for all discoverable emails</div>
                  </div>
                  <div className="info-card">
                    <div className="info-card-title">What you get</div>
                    <div className="info-card-row"><span className="badge badge-green">confirmed</span> Actually found on the website</div>
                    <div className="info-card-row"><span className="badge badge-amber">pattern</span> Generated from names (firstname@domain)</div>
                  </div>
                </motion.div>
              )}

              {/* PRICE MONITOR */}
              {mode === 'price_check' && (
                <motion.div key="price_check" {...modeAnim} className="space-y-4">
                  <div className="field">
                    <span className="field-label">Product URLs</span>
                    <textarea
                      className="textarea"
                      value={urls}
                      onChange={e => setUrls(e.target.value)}
                      placeholder={'https://jumia.com.ng/product-name\nhttps://konga.com/product-name'}
                      rows={5}
                      style={{ fontFamily: 'var(--font-m)', fontSize: 13 }}
                    />
                    <div className="field-hint">{urls.split('\n').filter(Boolean).length} products · 1 credit each</div>
                  </div>
                  <div className="field">
                    <span className="field-label">CSS selector (optional)</span>
                    <input className="input" value={priceSelector} onChange={e => setPriceSelector(e.target.value)} placeholder="e.g. .price, #product-price" style={{ fontFamily: 'var(--font-m)' }} />
                    <div className="field-hint">Leave blank — AI will find the price automatically</div>
                  </div>
                </motion.div>
              )}

              {/* ENRICHMENT */}
              {mode === 'enrich' && (
                <motion.div key="enrich" {...modeAnim} className="space-y-4">
                  <div className="field">
                    <span className="field-label">Upload company list (CSV)</span>
                    <div
                      className={`csv-dropzone${csvFile ? ' has-file' : ''}`}
                      onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.name.endsWith('.csv')) setCsvFile(f); }}
                      onDragOver={e => e.preventDefault()}
                      onClick={() => document.getElementById('enrich-csv-input')?.click()}
                    >
                      <input id="enrich-csv-input" type="file" accept=".csv" style={{ display:'none' }} onChange={e => setCsvFile(e.target.files?.[0] ?? null)} />
                      {csvFile ? (
                        <div style={{ textAlign:'center' }}>
                          <div style={{ fontSize:14, fontWeight:600, color:'var(--text-1)' }}>📄 {csvFile.name}</div>
                        </div>
                      ) : (
                        <div style={{ textAlign:'center', color:'var(--text-3)' }}>
                          <div style={{ fontSize:22, marginBottom:8 }}>✨</div>
                          <div style={{ fontSize:13 }}>CSV with company names in first column</div>
                          <div style={{ fontSize:11, marginTop:4 }}>e.g. company_name, Flutterwave, Paystack, …</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-card-title">Each row will be enriched with</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
                      {['Website', 'Email', 'Phone', 'LinkedIn', 'Industry', 'Location', 'Size', 'Description'].map(t => (
                        <span key={t} className="mode-chip">{t}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Max results — only for leads */}
            {mode === 'leads' && (
              <div className="field">
                <span className="field-label">Maximum Results</span>
                <div className="max-row">
                  {[20, 50, 100].map(m => (
                    <button key={m} className={`max-btn ${maxResults === m ? 'on' : ''}`} onClick={() => setMaxResults(m)}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {templates.length > 0 && (
              <div className="field">
                <span className="field-label">Saved Templates</span>
                <div className="flex flex-col gap-2">
                  {templates.slice(0,3).map(t => (
                    <button key={t.id} onClick={() => applyTemplate(t)} className="text-left text-xs bg-[var(--bg-3)] hover:bg-[var(--bg-4)] border border-[var(--border-1)] hover:border-[var(--border-2)] transition-colors p-2 rounded-md truncate font-medium text-[var(--text-1)]">
                      ⚡ {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button 
                className={`harvest-btn ${isHarvesting ? 'running' : ''}`}
                disabled={isSubmitDisabled()}
                onClick={handleRun}
              >
                <div className="harvest-btn-inner">
                  {isHarvesting || isSubmitting ? (
                    <div className="harvest-run-row">
                      <span className="spin spin-sm" /><span>Harvesting...</span>
                    </div>
                  ) : (
                    <>
                      <span>Start Harvest Job</span>
                      <span className="harvest-cost">ESTIMATED: {getCreditEstimate()}</span>
                    </>
                  )}
                </div>
              </button>
              
              {!isHarvesting && (
                <button onClick={handleSaveTemplate} className="w-full mt-3 text-xs text-[var(--text-3)] hover:text-white transition-colors bg-[var(--bg-3)] border border-[var(--border-1)] rounded-lg py-2 font-bold">
                  Save as Template
                </button>
              )}
            </div>

            <div className="credits-row">
              <div className={`credits-dot ${totalCredits > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{totalCredits} credits available</span>
              {totalCredits <= 0 && (
                <button
                  onClick={openPricing}
                  className="ml-2 text-xs text-amber-400 underline hover:text-amber-300"
                >
                  Buy credits →
                </button>
              )}
            </div>
          </div>
        </aside>

        <section className="output">
          {!isHarvesting && !jobId ? (
            <div className="p-8 w-full max-w-[1000px] mx-auto">
              {!dashLoading && stats && workspaceAnalytics}
            </div>
          ) : (
            <div className="w-full flex flex-col h-full overflow-hidden">
              <div className="results-header-container sticky top-0 z-30 border-b border-border-1 bg-bg-2/80 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 py-3">
                  <div className="flex items-center gap-6">
                    <h1 className="results-n-title text-2xl font-black italic tracking-tighter text-white">
                      {isHarvesting ? 'Harvesting...' : 'Live Workspace'}
                      {jobId && <span className="job-id-pill-tag bg-bg-3 border border-border-1 px-3 py-1 rounded-full text-[10px] text-amber/80 font-mono tracking-widest ml-4">{jobId.substring(0, 8)}</span>}
                    </h1>
                    
                    {!isHarvesting && results.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-amber/10 border border-amber/20 rounded-lg">
                        <span className="text-amber font-black text-sm">{results.length}</span>
                        <span className="text-[10px] font-bold text-amber/60 uppercase tracking-widest">Items Found</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {!isHarvesting && jobId && (
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                          <input 
                            type="text" 
                            placeholder="Live Search..."
                            className="input !bg-bg-3 !border-border-1 !py-2 !pl-10 !text-xs !rounded-xl w-full"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                          />
                          <svg className="absolute left-3 top-2.5 text-white/20" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </div>
                        <ExportButton data={results} mode={mode} jobId={jobId} />
                        <button
                          className="btn btn-secondary btn-sm !rounded-xl !border-border-1 h-[36px]"
                          onClick={() => setShowScheduleModal(true)}
                        >
                          ⏰ Schedule
                        </button>
                      </div>
                    )}
                    
                    {isHarvesting && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 20 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f5a623', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', fontFamily: 'monospace' }}>{progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-0 flex-1 overflow-hidden relative">
                {isHarvesting ? (
                  <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, rgba(245,166,35,0.07), transparent 60%)', pointerEvents: 'none' }} />

                    <motion.div
                      style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 500 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* Progress ring + icon */}
                      <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 24 }}>
                        <svg width="100" height="100" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                          <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(245,166,35,0.12)" strokeWidth="3" />
                          <circle
                            cx="50" cy="50" r="44"
                            fill="none"
                            stroke="#f5a623"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 44 * progress / 100} ${2 * Math.PI * 44}`}
                            style={{ transition: 'stroke-dasharray 0.6s ease' }}
                          />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber)', lineHeight: 1, fontFamily: 'monospace' }}>{progress}%</span>
                        </div>
                      </div>

                      {/* Title */}
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 6 }}>
                        {HARVEST_MODES.find(m => m.id === mode)?.label ?? 'Harvesting'}
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)', marginBottom: 20, letterSpacing: '-0.01em' }}>
                        {progress > 1 ? 'Collecting your data…' : 'Starting up…'}
                      </div>

                      {/* Progress bar */}
                      <div style={{ width: '100%', marginBottom: 24 }}>
                        <div style={{ height: 5, background: 'var(--bg-4)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--border-1)' }}>
                          <motion.div
                            style={{ height: '100%', background: 'linear-gradient(90deg, #f5a623, #fbbf24)', borderRadius: 99 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-3)', minHeight: 18 }}>
                          {logs.length > 0 ? logs[logs.length - 1]?.message : 'Initialising…'}
                        </div>
                      </div>

                      {/* Activity log */}
                      <div style={{ width: '100%', background: 'var(--bg-3)', border: '1px solid var(--border-1)', borderRadius: 'var(--r-l)', overflow: 'hidden' }}>
                        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
                          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-3)' }}>Live Activity</span>
                        </div>
                        <div style={{ height: 200, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {logs.length === 0 && (
                            <span style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>Waiting for activity…</span>
                          )}
                          {logs.map((log: any, i: number) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace', flexShrink: 0 }}>{log.timestamp}</span>
                              <span style={{ fontSize: 12, lineHeight: 1.5, color: log.message.toLowerCase().includes('err') || log.message.toLowerCase().includes('fail') ? '#f87171' : log.message.toLowerCase().includes('done') || log.message.toLowerCase().includes('succ') || log.message.toLowerCase().includes('complete') ? '#4ade80' : 'var(--text-2)' }}>
                                {log.message}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ) : jobError ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>✕</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-1)', marginBottom: 8 }}>Job Failed</div>
                    <div style={{ fontSize: 13, color: '#f87171', maxWidth: 420, lineHeight: 1.6, marginBottom: 24, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 16px' }}>{jobError}</div>
                    <button className="btn btn-secondary" style={{ borderRadius: 20 }} onClick={() => setJobError(null)}>Dismiss</button>
                  </div>
                ) : (
                  <ResultsTable />
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <motion.div
            className="modal"
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h2 style={{ fontFamily:'var(--font-d)', fontSize:20, fontWeight:900, color:'var(--text-1)', marginBottom:6 }}>Schedule this harvest</h2>
            <p style={{ fontSize:14, color:'var(--text-2)', marginBottom:20, lineHeight:1.65 }}>
              Run this exact harvest automatically on a recurring schedule.
            </p>
            <div className="field" style={{ marginBottom:16 }}>
              <span className="field-label">Job name</span>
              <input className="input" value={scheduleName} onChange={e => setScheduleName(e.target.value)} placeholder="e.g. Weekly Lagos law firms" />
            </div>
            <div className="field" style={{ marginBottom:20 }}>
              <span className="field-label">Frequency</span>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
                {SCHEDULE_OPTIONS.map(s => (
                  <button
                    key={s.v}
                    className={`settings-radio-btn${scheduleFreq === s.v ? ' on' : ''}`}
                    onClick={() => setScheduleFreq(s.v as any)}
                    style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'flex-start' }}
                  >
                    <span>{s.icon}</span> {s.l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowScheduleModal(false)}>Cancel</button>
              <button
                className="btn btn-primary btn-md"
                disabled={!scheduleName.trim()}
                onClick={async () => {
                  try {
                    await api.post('/api/scheduled', {
                      name: scheduleName,
                      mode,
                      inputData: getCurrentInputData(),
                      schedule: scheduleFreq,
                    });
                    setShowScheduleModal(false);
                    setScheduleName('');
                  } catch (e) { console.error(e); }
                }}
              >
                Schedule harvest
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Navbar } from '../components/Navbar';

interface Job {
  id: string;
  mode: string;
  status: string;
  resultCount: number;
  creditsUsed: number;
  inputData: any;
  createdAt: string;
}

const MODE_META: Record<string, { label: string; icon: string }> = {
  leads:        { label: 'Lead Finder',    icon: '🎯' },
  extract:      { label: 'Data Extractor', icon: '🔍' },
  scrape:       { label: 'Data Extractor', icon: '🔍' },
  serp:         { label: 'Google Search',  icon: '🌐' },
  email_finder: { label: 'Email Finder',   icon: '📧' },
  site_crawl:   { label: 'Site Crawler',   icon: '🗺️' },
  bulk_upload:  { label: 'Bulk Upload',    icon: '📂' },
  price_check:  { label: 'Price Monitor',  icon: '💰' },
  enrichment:   { label: 'Enrichment',     icon: '✨' },
};

function getMeta(mode: string) {
  return MODE_META[mode] ?? { label: mode.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), icon: '⚡' };
}

function jobTitle(job: Job) {
  const d = job.inputData ?? {};
  if (d.businessType && d.location) return `${d.businessType} in ${d.location}`;
  if (d.businessType) return d.businessType;
  if (d.query) return d.query;
  if (Array.isArray(d.urls) && d.urls[0]) return d.urls[0].replace(/^https?:\/\//, '');
  if (d.instruction) return d.instruction.slice(0, 60);
  return 'Untitled job';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ── View / Export modal ─────────────────────────────────────────── */
function ViewModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [sharing, setSharing] = useState(false);
  const meta = getMeta(job.mode);

  useEffect(() => {
    api.get(`/api/jobs/${job.id}/results`)
      .then(({ data }) => setResults(Array.isArray(data) ? data : []))
      .catch(() => setErr('Could not load results.'))
      .finally(() => setLoading(false));
  }, [job.id]);

  const downloadCSV = () => {
    if (!results?.length) return;
    const headers = Object.keys(results[0]).join(',');
    const rows = results.map(r =>
      Object.values(r).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harvestai_${job.id.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJSON = () => {
    if (!results?.length) return;
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getShareLink = async () => {
    setSharing(true);
    try {
      const { data } = await api.post(`/api/jobs/${job.id}/share`);
      setShareUrl(data.shareUrl);
      try { await navigator.clipboard.writeText(data.shareUrl); } catch (_) {}
    } catch {
      setErr('Could not generate share link.');
    } finally {
      setSharing(false);
    }
  };

  const columns = results?.length ? Object.keys(results[0]) : [];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--border-2)',
        borderRadius: 20, width: '100%', maxWidth: 900, maxHeight: '88vh',
        display: 'flex', flexDirection: 'column', boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        overflow: 'hidden',
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid var(--border-1)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>{meta.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--amber)' }}>
                {meta.label}
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3 }}>
              {jobTitle(job)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
              {formatDate(job.createdAt)} · {job.resultCount ?? 0} results
            </div>
          </div>
          <button onClick={onClose} className="modal-x" style={{ marginLeft: 12, flexShrink: 0 }}>✕</button>
        </div>

        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px',
          borderBottom: '1px solid var(--border-1)', flexWrap: 'wrap',
        }}>
          <button
            onClick={downloadCSV}
            disabled={!results?.length}
            className="btn btn-primary"
            style={{ height: 34, fontSize: 12, padding: '0 14px', fontWeight: 700 }}
          >
            ↓ Download CSV
          </button>
          <button
            onClick={copyJSON}
            disabled={!results?.length}
            className="btn btn-secondary"
            style={{ height: 34, fontSize: 12, padding: '0 14px', fontWeight: 700 }}
          >
            {copied ? '✓ Copied' : 'Copy JSON'}
          </button>
          <button
            onClick={getShareLink}
            disabled={sharing}
            className="btn btn-secondary"
            style={{ height: 34, fontSize: 12, padding: '0 14px', fontWeight: 700 }}
          >
            {sharing ? 'Generating…' : shareUrl ? '✓ Link copied' : '🔗 Share link'}
          </button>
          {shareUrl && (
            <span style={{ fontSize: 12, color: 'var(--amber)', opacity: 0.8, fontFamily: 'monospace', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {shareUrl}
            </span>
          )}
        </div>

        {/* Results body */}
        <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="spinner" />
            </div>
          )}
          {err && (
            <div style={{ color: '#f87171', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>{err}</div>
          )}
          {results && results.length === 0 && !err && (
            <div style={{ color: 'var(--text-3)', fontSize: 14, textAlign: 'center', padding: '60px 0' }}>
              No results available for this job.
            </div>
          )}
          {results && results.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    {columns.map(col => (
                      <th key={col} style={{
                        textAlign: 'left', padding: '0 16px 12px 0',
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                        textTransform: 'uppercase', color: 'var(--text-3)',
                        whiteSpace: 'nowrap',
                      }}>
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 200).map((row, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border-1)' }}>
                      {columns.map(col => (
                        <td key={col} style={{
                          padding: '11px 16px 11px 0',
                          color: 'var(--text-2)', maxWidth: 220,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {String(row[col] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {results.length > 200 && (
                <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 16 }}>
                  Showing first 200 of {results.length} rows. Download CSV for full data.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────── */
function JobSkeleton() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 140px 120px 120px 80px 120px',
      alignItems: 'center', gap: 16, padding: '16px 24px',
      borderTop: '1px solid var(--border-1)',
    }}>
      {[70, 50, 40, 30, 20, 40].map((w, i) => (
        <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, borderRadius: 6 }} />
      ))}
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────── */
export default function History() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewJob, setViewJob] = useState<Job | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/api/jobs');
      setJobs(data.jobs ?? data ?? []);
    } catch {
      setError('Could not load job history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 8 }}>
              History
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', margin: 0, lineHeight: 1 }}>
              Job History
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 8 }}>
              View, export, and share results from past harvests.
            </p>
          </div>
          <button
            onClick={fetchJobs}
            className="btn btn-secondary"
            style={{ height: 36, fontSize: 13, padding: '0 16px', fontWeight: 600 }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-2)', border: '1px solid var(--border-2)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          {/* Card header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 24px', borderBottom: '1px solid var(--border-1)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {loading ? 'Loading…' : `${jobs.length} job${jobs.length !== 1 ? 's' : ''}`}
            </span>
            {error && (
              <span style={{ fontSize: 12, color: '#f87171' }}>
                {error} <button onClick={fetchJobs} style={{ color: '#f87171', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}>Retry</button>
              </span>
            )}
          </div>

          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 150px 130px 100px 80px 130px',
            gap: 8, padding: '10px 24px',
            borderBottom: '1px solid var(--border-1)',
          }}>
            {['Job', 'Type', 'Date', 'Status', 'Results', 'Actions'].map((h, i) => (
              <div key={h} style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'var(--text-3)',
                textAlign: i === 5 ? 'right' : 'left',
              }}>{h}</div>
            ))}
          </div>

          {/* Skeleton rows */}
          {loading && [1,2,3,4,5].map(i => <JobSkeleton key={i} />)}

          {/* Empty state */}
          {!loading && jobs.length === 0 && !error && (
            <div style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-2)', marginBottom: 6 }}>No jobs yet</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Run your first harvest to see results here.</div>
            </div>
          )}

          {/* Job rows */}
          {!loading && jobs.map(job => {
            const meta = getMeta(job.mode);
            const isDone = job.status === 'done';
            const isFailed = job.status === 'failed';
            return (
              <div
                key={job.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 150px 130px 100px 80px 130px',
                  gap: 8, alignItems: 'center',
                  padding: '14px 24px',
                  borderTop: '1px solid var(--border-1)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                {/* Job title */}
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: 'var(--text-1)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: 280,
                  }} title={jobTitle(job)}>
                    {jobTitle(job)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace', marginTop: 2 }}>
                    {job.id.slice(0, 8)}
                  </div>
                </div>

                {/* Type */}
                <div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 11, fontWeight: 600,
                    padding: '4px 10px', borderRadius: 8,
                    background: 'var(--bg-4)', border: '1px solid var(--border-2)',
                    color: 'var(--text-2)', whiteSpace: 'nowrap',
                  }}>
                    <span>{meta.icon}</span>
                    {meta.label}
                  </span>
                </div>

                {/* Date */}
                <div style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                  {formatDate(job.createdAt)}
                </div>

                {/* Status */}
                <div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontSize: 11, fontWeight: 700,
                    padding: '4px 10px', borderRadius: 8,
                    ...(isDone
                      ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }
                      : isFailed
                      ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }
                      : { background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', color: 'var(--amber)' }
                    ),
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: isDone ? '#4ade80' : isFailed ? '#f87171' : 'var(--amber)',
                      ...((!isDone && !isFailed) ? { animation: 'pulse 1.5s ease infinite' } : {}),
                    }} />
                    {isDone ? 'Done' : isFailed ? 'Failed' : 'Running'}
                  </span>
                </div>

                {/* Results */}
                <div style={{
                  fontSize: 13, fontWeight: 600, fontFamily: 'monospace',
                  color: (job.resultCount ?? 0) > 0 ? 'var(--text-1)' : 'var(--text-3)',
                }}>
                  {job.resultCount ?? 0}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {isDone ? (
                    <button
                      onClick={() => setViewJob(job)}
                      className="btn btn-primary"
                      style={{ height: 32, fontSize: 12, padding: '0 14px', fontWeight: 700 }}
                    >
                      View & Export →
                    </button>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {viewJob && <ViewModal job={viewJob} onClose={() => setViewJob(null)} />}
    </div>
  );
}

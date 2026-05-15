import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { useAuthStore } from '../store/authStore';
import { HARVEST_MODES } from '../types/index';
import type { ScheduledJob } from '../types/index';
import { api } from '../lib/api';

const SCHEDULE_OPTIONS = [
  { v: 'hourly', l: 'Every hour', icon: '⚡' },
  { v: 'daily', l: 'Every day', icon: '📅' },
  { v: 'weekly', l: 'Every week', icon: '📆' },
  { v: 'monthly', l: 'Monthly', icon: '🗓️' },
];

export default function Scheduled() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const user = useAuthStore.getState().user;
    if (user) user.getIdToken().then((t: string) => setToken(t));
  }, []);

  useEffect(() => {
    if (!token) return;
    api.get('/api/scheduled')
      .then(res => setJobs(res.data.jobs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function toggleActive(id: string, isActive: boolean) {
    try {
      await api.patch(`/api/scheduled/${id}`, { isActive });
      setJobs(prev => prev.map(j => j.id === id ? { ...j, isActive } : j));
    } catch (e) {
      console.error(e);
    }
  }

  async function deleteJob(id: string) {
    if (!confirm('Delete this scheduled job?')) return;
    try {
      await api.delete(`/api/scheduled/${id}`);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '78px 24px 60px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <div>
            <h1 style={{ fontFamily:'var(--font-d)', fontSize:26, fontWeight:900, color:'var(--text-1)', letterSpacing:'-0.02em' }}>
              Scheduled Harvests
            </h1>
            <p style={{ fontSize:14, color:'var(--text-2)', marginTop:5 }}>
              Recurring jobs run automatically and deliver results by webhook or email.
            </p>
          </div>
          <a href="/app" className="btn btn-primary btn-md">+ New harvest</a>
        </div>

        {/* How to create note */}
        <div className="info-card" style={{ marginBottom:24 }}>
          <div className="info-card-title">How to schedule a harvest</div>
          <p style={{ fontSize:13, color:'var(--text-2)', lineHeight:1.65 }}>
            Run any harvest from the <a href="/app" style={{ color:'var(--amber)' }}>app page</a>, then click "⏰ Schedule" when results appear. 
            You can also set a webhook in <a href="/settings" style={{ color:'var(--amber)' }}>Settings → API</a> to receive results automatically.
          </p>
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[0,1,2].map(i => <div key={i} className="skel" style={{ height:80, borderRadius:'var(--r-l)' }} />)}
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontSize:36, marginBottom:14 }}>⏰</div>
            <div style={{ fontSize:17, fontWeight:700, color:'var(--text-2)', marginBottom:8 }}>No scheduled harvests yet</div>
            <div style={{ fontSize:14, color:'var(--text-3)', maxWidth:320, margin:'0 auto 24px', lineHeight:1.65 }}>
              Schedule any harvest to run automatically on a daily, weekly, or monthly basis.
            </div>
            <a href="/app" className="btn btn-primary btn-md">Start a harvest</a>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <AnimatePresence>
            {jobs.map((j, i) => {
              const modeInfo = HARVEST_MODES.find(m => m.id === j.mode);
              const input = j.inputData as any;
              const summary = j.mode === 'leads'
                ? `${input.businessType} in ${input.location}`
                : j.mode === 'serp'
                ? `"${input.query}"`
                : j.mode === 'email_finder'
                ? `${input.domain}`
                : j.mode === 'sitemap'
                ? `${input.domain}`
                : `${(input.urls as string[] ?? []).length} URLs`;

              return (
                <motion.div
                  key={j.id}
                  initial={{ opacity:0, y:10 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, x:-20 }}
                  transition={{ delay: i * 0.04 }}
                  className="sched-job-card"
                >
                  <div className="sched-job-left">
                    <span className="sched-job-icon">{modeInfo?.icon}</span>
                    <div>
                      <div className="sched-job-name">{j.name}</div>
                      <div className="sched-job-summary">{modeInfo?.label} · {summary}</div>
                      <div className="sched-job-meta">
                        <span>{SCHEDULE_OPTIONS.find(s => s.v === j.schedule)?.l}</span>
                        {j.lastRunAt && <span>· Last run {new Date(j.lastRunAt).toLocaleDateString('en-NG', { month:'short', day:'numeric' })}</span>}
                        {j.nextRunAt && j.isActive && <span>· Next {new Date(j.nextRunAt).toLocaleDateString('en-NG', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</span>}
                        <span>· {j.runCount} run{j.runCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="sched-job-right">
                    <span className={`badge ${j.isActive ? 'badge-green' : 'badge-gray'}`}>{j.isActive ? 'Active' : 'Paused'}</span>
                    <button
                      className="btn btn-secondary btn-xs"
                      onClick={() => toggleActive(j.id, !j.isActive)}
                    >
                      {j.isActive ? 'Pause' : 'Resume'}
                    </button>
                    <button className="btn btn-danger btn-xs" onClick={() => deleteJob(j.id)}>Delete</button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

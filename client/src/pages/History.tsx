import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface Job {
  id: string;
  type: 'leads' | 'extract';
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  metadata: any;
}

export default function History() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get('/api/jobs');
        setJobs(data);
      } catch (err) {
        console.error('Failed to fetch jobs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleDownload = async (jobId: string) => {
    try {
      const { data } = await api.get(`/api/jobs/${jobId}`);
      if (!data.results || data.results.length === 0) return alert('No results found for this job');
      
      const headers = Object.keys(data.results[0]).join(',');
      const rows = data.results.map((r: any) => Object.values(r).join(',')).join('\n');
      const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `harvestai_job_${jobId.slice(0, 8)}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert('Failed to download results');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black text-primary tracking-tight mb-2">Job History</h1>
        <p className="text-secondary text-base">Access your legacy harvests and audit past extractions.</p>
      </div>

      <div className="bento-card overflow-hidden">
        <h3 className="section-label mb-6">Execution Log</h3>
        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <div className="text-4xl mb-4">📜</div>
            <div className="text-sm font-medium">Your historical archive is empty.</div>
            <div className="text-xs mt-1">Completed harvests will appear here automatically.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-default text-[11px] font-bold text-muted uppercase">
                  <th className="pb-4 pr-4">Identifer</th>
                  <th className="pb-4 pr-4">Mode</th>
                  <th className="pb-4 pr-4">Timestamp</th>
                  <th className="pb-4 pr-4">Status</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {jobs.map((job) => (
                  <tr key={job.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-primary flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent/20" />
                        {job.id.slice(0, 8)}
                      </div>
                      <div className="text-[10px] text-muted truncate max-w-[150px]">
                        {job.metadata?.businessType || job.metadata?.urls?.[0]}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                       <span className="text-[10px] font-black uppercase text-secondary bg-elevated px-2 py-0.5 rounded border border-default">
                        {job.type}
                       </span>
                    </td>
                    <td className="py-4 pr-4 text-muted text-xs">
                      {new Date(job.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 pr-4">
                       <div className={`text-[10px] font-bold uppercase ${
                          job.status === 'completed' ? 'text-success' : 
                          job.status === 'failed' ? 'text-error' : 'text-accent'
                       }`}>
                        {job.status}
                       </div>
                    </td>
                    <td className="py-4 text-right">
                      {job.status === 'completed' && (
                        <button 
                          onClick={() => handleDownload(job.id)}
                          className="text-accent hover:underline text-xs font-bold"
                        >
                          Download ↓
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

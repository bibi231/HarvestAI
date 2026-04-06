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
    <div className="space-y-12 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <h1 className="text-5xl font-black text-primary tracking-tighter mb-3 italic uppercase">Execution History</h1>
          <p className="text-secondary text-sm font-medium uppercase tracking-widest opacity-60">Audit and retrieve past extractions.</p>
        </div>
      </div>

      <div className="bento-card overflow-hidden bg-white/[0.01]">
        <div className="flex items-center justify-between mb-10">
           <span className="section-label mb-0">System Log Archive</span>
           <span className="text-[10px] font-black text-muted uppercase tracking-widest font-mono">TOTAL_RECORDS_{jobs.length}</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
             <div className="spinner mb-6" />
             <div className="text-xs font-black text-accent uppercase tracking-widest animate-pulse italic">Reading Silo Layers...</div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center opacity-20">
            <div className="text-6xl mb-8 select-none">📜</div>
            <div className="text-sm font-black tracking-widest uppercase italic text-primary">Archive is empty</div>
            <div className="text-[9px] mt-3 text-muted uppercase tracking-[0.4em] font-medium leading-none">AWAITING COMPLETED PROTOCOLS</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-black text-muted uppercase tracking-[0.3em] italic">
                  <th className="pb-6 pr-6 pl-0">Identifer</th>
                  <th className="pb-6 pr-6">Engine Mode</th>
                  <th className="pb-6 pr-6">Timestamp</th>
                  <th className="pb-6 pr-6">Status</th>
                  <th className="pb-6 text-right">Manifest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {jobs.map((job) => (
                  <tr key={job.id} className="group hover:bg-white/[0.02]">
                    <td className="py-6 pr-6 pl-0">
                      <div className="font-extrabold text-primary text-xl tracking-tighter italic group-hover:text-accent transition-colors flex items-center gap-4">
                        <span className="w-2 h-2 rounded-full bg-accent/20 border border-accent/40" />
                        {job.id.slice(0, 8)}
                      </div>
                      <div className="text-[10px] text-muted font-bold mt-2 uppercase tracking-tighter truncate max-w-[200px] font-mono group-hover:text-secondary transition-colors">
                        {job.metadata?.businessType || job.metadata?.urls?.[0]}
                      </div>
                    </td>
                    <td className="py-6 pr-6">
                       <span className="text-[10px] font-black uppercase text-secondary bg-elevated px-3 py-1.5 rounded-lg border border-white/5 transition-all group-hover:bg-accent group-hover:text-black">
                        {job.type.toUpperCase()}
                       </span>
                    </td>
                    <td className="py-6 pr-6 text-muted text-xs font-mono font-bold italic opacity-60 group-hover:opacity-100 uppercase tracking-tighter">
                      {new Date(job.createdAt).toLocaleString().split(',').join(' _ ')}
                    </td>
                    <td className="py-6 pr-6">
                       <div className={`text-[10px] font-black uppercase tracking-widest italic border border-white/5 px-2 py-0.5 rounded flex items-center gap-2 ${
                          job.status === 'completed' ? 'text-success bg-success/10 border-success/20' : 
                          job.status === 'failed' ? 'text-error bg-error/10 border-error/20' : 'text-accent bg-accent/10 border-accent/20'
                       }`}>
                        <span className={`w-1 h-1 rounded-full ${job.status === 'completed' ? 'bg-success' : job.status === 'failed' ? 'bg-error' : 'bg-accent animate-pulse'}`} />
                        {job.status}
                       </div>
                    </td>
                    <td className="py-6 text-right">
                      {job.status === 'completed' ? (
                        <button 
                          onClick={() => handleDownload(job.id)}
                          className="btn-secondary px-4 py-2 text-[9px] font-black tracking-widest uppercase transition-all hover:bg-white/10"
                        >
                          DOWNLOAD ↓
                        </button>
                      ) : (
                        <span className="text-[9px] font-black text-muted uppercase tracking-widest opacity-30">NOT_RETRIEVABLE</span>
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

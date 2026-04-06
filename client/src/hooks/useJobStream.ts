import { useState, useEffect, useRef } from 'react';
import { getIdToken } from '../lib/firebase.js';
import type { HarvestJob } from '../types/index.js';

export function useJobStream(jobId: string | null) {
  const [job, setJob] = useState<Partial<HarvestJob> | null>(null);
  const [isDone, setIsDone] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!jobId) return;

    setJob(null);
    setIsDone(false);

    let active = true;

    async function connect() {
      const token = await getIdToken();
      if (!token || !active) return;

      const apiUrl = import.meta.env.VITE_API_URL;
      const url = `${apiUrl}/api/jobs/${jobId}/stream`;

      // EventSource doesn't support custom headers — pass token as query param
      const es = new EventSource(`${url}?token=${token}`);
      esRef.current = es;

      es.onmessage = e => {
        if (!active) return;
        try {
          const data = JSON.parse(e.data);
          setJob(prev => ({ ...prev, ...data, id: jobId }));
          if (data.status === 'done' || data.status === 'failed') {
            setIsDone(true);
            es.close();
          }
        } catch {}
      };

      es.onerror = () => { es.close(); };
    }

    connect();
    return () => {
      active = false;
      esRef.current?.close();
    };
  }, [jobId]);

  return { job, isDone };
}

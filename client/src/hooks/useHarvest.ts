import { useState } from 'react';
import { api } from '../lib/api.js';
import type { LeadFinderInput, ExtractInput, HarvestJob } from '../types/index.js';

export function useHarvest() {
  const [currentJob, setCurrentJob] = useState<HarvestJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startLeadJob(input: LeadFinderInput): Promise<string | null> {
    setIsSubmitting(true);
    setError(null);
    setCurrentJob(null);
    try {
      const { data } = await api.post<{ jobId: string }>('/api/harvest/leads', input);
      return data.jobId;
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to start job');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function startExtractJob(input: ExtractInput): Promise<string | null> {
    setIsSubmitting(true);
    setError(null);
    setCurrentJob(null);
    try {
      const { data } = await api.post<{ jobId: string }>('/api/harvest/extract', input);
      return data.jobId;
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed to start job');
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { currentJob, setCurrentJob, isSubmitting, error, startLeadJob, startExtractJob };
}

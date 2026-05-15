import { useState } from 'react';
import { api } from '../lib/api';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type { LeadFinderInput, ExtractInput, HarvestJob } from '../types';

export function useHarvest() {
  const [currentJob, setCurrentJob] = useState<HarvestJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getIdToken = async (): Promise<string> => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Not authenticated');
    return user.getIdToken();
  };

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

  async function startSerpJob(query: string, location: string, numResults: number): Promise<string | null> {
    setIsSubmitting(true); setError(null);
    try {
      const { data } = await api.post<{ jobId: string }>('/api/harvest/serp', { query, location, numResults });
      return data.jobId;
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed');
      return null;
    } finally { setIsSubmitting(false); }
  }

  async function startSitemapJob(domain: string, instruction: string, maxUrls: number): Promise<string | null> {
    setIsSubmitting(true); setError(null);
    try {
      const { data } = await api.post<{ jobId: string }>('/api/harvest/sitemap', { domain, instruction, maxUrls });
      return data.jobId;
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed');
      return null;
    } finally { setIsSubmitting(false); }
  }

  async function startEmailFinderJob(domain: string): Promise<string | null> {
    setIsSubmitting(true); setError(null);
    try {
      const { data } = await api.post<{ jobId: string }>('/api/harvest/email-finder', { domain });
      return data.jobId;
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed');
      return null;
    } finally { setIsSubmitting(false); }
  }

  async function startPriceCheckJob(urls: string[], selector?: string): Promise<string | null> {
    setIsSubmitting(true); setError(null);
    try {
      const { data } = await api.post<{ jobId: string }>('/api/harvest/price-check', { urls, selector });
      return data.jobId;
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed');
      return null;
    } finally { setIsSubmitting(false); }
  }

  async function startBulkCsvJob(file: File, instruction: string): Promise<string | null> {
    setIsSubmitting(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('instruction', instruction);
      const token = await getIdToken();
      const { data } = await axios.post<{ jobId: string; urlCount: number }>(
        `${import.meta.env.VITE_API_URL}/api/harvest/bulk-csv`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } },
      );
      return data.jobId;
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed');
      return null;
    } finally { setIsSubmitting(false); }
  }

  async function startEnrichmentJob(file: File): Promise<string | null> {
    setIsSubmitting(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = await getIdToken();
      const { data } = await axios.post<{ jobId: string }>(
        `${import.meta.env.VITE_API_URL}/api/harvest/enrich`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } },
      );
      return data.jobId;
    } catch (err: any) {
      setError(err.response?.data?.message ?? err.message ?? 'Failed');
      return null;
    } finally { setIsSubmitting(false); }
  }

  return {
    currentJob, setCurrentJob, isSubmitting, error,
    startLeadJob, startExtractJob, startSerpJob, startSitemapJob,
    startEmailFinderJob, startPriceCheckJob, startBulkCsvJob, startEnrichmentJob,
  };
}

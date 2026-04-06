import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { requireCredits } from '../middleware/checkCredits.js';
import { harvestRateLimit } from '../middleware/rateLimit.js';
import { db } from '../db/index.js';
import { harvestJobs } from '../db/schema.js';
import { runLeadJob } from '../services/leadService.js';
import { runExtractJob } from '../services/extractService.js';

const router = Router();

// POST /api/harvest/leads
router.post('/leads', verifyFirebaseToken, requireCredits, harvestRateLimit, async (req, res) => {
  const { businessType, location, sources, maxResults } = req.body as {
    businessType: string;
    location: string;
    sources: string[];
    maxResults: number;
  };

  if (!businessType?.trim()) return res.status(400).json({ error: 'businessType is required' });
  if (!location?.trim()) return res.status(400).json({ error: 'location is required' });
  if (!Array.isArray(sources) || sources.length === 0) return res.status(400).json({ error: 'Select at least one source' });
  if (sources.length > 5) return res.status(400).json({ error: 'Maximum 5 sources per job' });

  const max = Math.min(Math.max(10, Number(maxResults) || 25), 100);

  const [job] = await db.insert(harvestJobs).values({
    userId: req.user!.uid,
    mode: 'leads',
    inputData: { businessType, location, sources, maxResults: max },
    status: 'running',
  }).returning();

  // Run async — do not await
  runLeadJob(job.id, req.user!.uid, businessType, location, sources, max).catch(console.error);

  res.json({ jobId: job.id, message: 'Job started' });
});

// POST /api/harvest/extract
router.post('/extract', verifyFirebaseToken, requireCredits, harvestRateLimit, async (req, res) => {
  const { urls, instruction } = req.body as { urls: string[]; instruction: string };

  if (!Array.isArray(urls) || urls.length === 0) return res.status(400).json({ error: 'urls array is required' });
  if (urls.length > 20) return res.status(400).json({ error: 'Maximum 20 URLs per job' });
  if (!instruction?.trim()) return res.status(400).json({ error: 'instruction is required' });

  // Validate URLs
  const validUrls = urls.filter(u => { try { new URL(u); return true; } catch { return false; } });
  if (validUrls.length === 0) return res.status(400).json({ error: 'No valid URLs provided' });

  const [job] = await db.insert(harvestJobs).values({
    userId: req.user!.uid,
    mode: 'extract',
    inputData: { urls: validUrls, instruction },
    status: 'running',
  }).returning();

  runExtractJob(job.id, req.user!.uid, validUrls, instruction).catch(console.error);

  res.json({ jobId: job.id, message: 'Job started' });
});

export default router;

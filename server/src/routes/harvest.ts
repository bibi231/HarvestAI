import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { requireCredits } from '../middleware/checkCredits.js';
import { harvestRateLimit } from '../middleware/rateLimit.js';
import { db } from '../db/index.js';
import { harvestJobs } from '../db/schema.js';
import { runLeadJob } from '../services/leadService.js';
import { runExtractJob, runSitemapJob } from '../services/extractService.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/harvest/leads
router.post('/leads', verifyFirebaseToken, requireCredits, harvestRateLimit, async (req: any, res: any) => {
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
    userId: (req as any).user!.uid,
    mode: 'leads',
    inputData: { businessType, location, sources, maxResults: max },
    status: 'running',
  }).returning();

  // Run async — do not await
  runLeadJob(job.id, (req as any).user!.uid, businessType, location, sources, max).catch(console.error);

  res.json({ jobId: job.id, message: 'Job started' });
});

// POST /api/harvest/extract
router.post('/extract', verifyFirebaseToken, requireCredits, harvestRateLimit, async (req: any, res: any) => {
  const { urls, instruction } = req.body as { urls: string[]; instruction: string };

  if (!Array.isArray(urls) || urls.length === 0) return res.status(400).json({ error: 'urls array is required' });
  if (urls.length > 20) return res.status(400).json({ error: 'Maximum 20 URLs per job' });
  if (!instruction?.trim()) return res.status(400).json({ error: 'instruction is required' });

  // Validate URLs
  const validUrls = urls.filter(u => { try { new URL(u); return true; } catch { return false; } });
  if (validUrls.length === 0) return res.status(400).json({ error: 'No valid URLs provided' });

  const [job] = await db.insert(harvestJobs).values({
    userId: (req as any).user!.uid,
    mode: 'extract',
    inputData: { urls: validUrls, instruction },
    status: 'running',
  }).returning();

  runExtractJob(job.id, (req as any).user!.uid, validUrls, instruction).catch(console.error);

  res.json({ jobId: job.id, message: 'Job started' });
});

// POST /api/harvest/bulk-csv
router.post('/bulk-csv', verifyFirebaseToken, requireCredits, upload.single('file'), async (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: 'No CSV file uploaded' });
  const { instruction } = req.body as { instruction: string };
  if (!instruction?.trim()) return res.status(400).json({ error: 'instruction is required' });

  const { extractUrlsFromCsv } = await import('../services/bulkCsvService.js');
  const csvText = req.file.buffer.toString('utf-8');
  const urls = extractUrlsFromCsv(csvText);

  if (urls.length === 0) return res.status(400).json({ error: 'No valid URLs found in the CSV. Ensure a column is named "url" or "link".' });

  const [job] = await db.insert(harvestJobs).values({
    userId: req.user!.uid,
    mode: 'bulk_csv',
    inputData: { urls, instruction, originalFilename: req.file.originalname, urlCount: urls.length },
    status: 'running',
  }).returning();

  runExtractJob(job.id, req.user!.uid, urls, instruction).catch(console.error);

  res.json({ jobId: job.id, urlCount: urls.length, message: `Found ${urls.length} URLs — starting extraction` });
});

// POST /api/harvest/serp
router.post('/serp', verifyFirebaseToken, requireCredits, harvestRateLimit, async (req: any, res: any) => {
  const { query, location, numResults } = req.body as { query: string; location?: string; numResults?: number };
  if (!query?.trim()) return res.status(400).json({ error: 'query is required' });

  const num = Math.min(Math.max(10, Number(numResults) || 30), 100);

  const [job] = await db.insert(harvestJobs).values({
    userId: req.user!.uid,
    mode: 'serp',
    inputData: { query, location: location ?? '', numResults: num },
    status: 'running',
  }).returning();

  const { runSerpJob } = await import('../services/serpJobService.js');
  runSerpJob(job.id, req.user!.uid, query, location ?? '', num).catch(console.error);
  res.json({ jobId: job.id });
});

// POST /api/harvest/sitemap
router.post('/sitemap', verifyFirebaseToken, requireCredits, harvestRateLimit, async (req: any, res: any) => {
  const { domain, instruction, maxUrls } = req.body as { domain: string; instruction: string; maxUrls?: number };
  if (!domain?.trim()) return res.status(400).json({ error: 'domain is required' });
  if (!instruction?.trim()) return res.status(400).json({ error: 'instruction is required' });

  const max = Math.min(Math.max(10, Number(maxUrls) || 50), 200);

  const [job] = await db.insert(harvestJobs).values({
    userId: req.user!.uid,
    mode: 'sitemap',
    inputData: { domain, instruction, maxUrls: max },
    status: 'running',
  }).returning();

  runSitemapJob(job.id, req.user!.uid, domain, instruction, max).catch(console.error);
  res.json({ jobId: job.id });
});

// POST /api/harvest/email-finder
router.post('/email-finder', verifyFirebaseToken, requireCredits, harvestRateLimit, async (req: any, res: any) => {
  const { domain } = req.body as { domain: string };
  if (!domain?.trim()) return res.status(400).json({ error: 'domain is required' });

  const [job] = await db.insert(harvestJobs).values({
    userId: req.user!.uid,
    mode: 'email_finder',
    inputData: { domain: domain.trim() },
    status: 'running',
  }).returning();

  const { runEmailFinderJob } = await import('../services/emailFinderService.js');
  runEmailFinderJob(job.id, req.user!.uid, domain.trim()).catch(console.error);
  res.json({ jobId: job.id });
});

// POST /api/harvest/price-check
router.post('/price-check', verifyFirebaseToken, requireCredits, harvestRateLimit, async (req: any, res: any) => {
  const { urls, selector } = req.body as { urls: string[]; selector?: string };
  if (!Array.isArray(urls) || urls.length === 0) return res.status(400).json({ error: 'urls array required' });
  if (urls.length > 20) return res.status(400).json({ error: 'Max 20 URLs per price check' });

  const [job] = await db.insert(harvestJobs).values({
    userId: req.user!.uid,
    mode: 'price_check',
    inputData: { urls, selector: selector ?? null },
    status: 'running',
  }).returning();

  const { runPriceCheckJob } = await import('../services/priceService.js');
  runPriceCheckJob(job.id, req.user!.uid, urls, selector).catch(console.error);
  res.json({ jobId: job.id });
});

// POST /api/harvest/enrich
router.post('/enrich', verifyFirebaseToken, requireCredits, upload.single('file'), async (req: any, res: any) => {
  const csvText = req.file?.buffer.toString('utf-8') ?? req.body.items;
  if (!csvText) return res.status(400).json({ error: 'Provide a CSV file or items in the request body' });

  // Parse first column as items to enrich
  const lines = String(csvText).trim().split('\n').slice(1); // skip header
  const items = lines.map((l: string) => l.split(',')[0].trim().replace(/"/g, '')).filter(Boolean).slice(0, 100);
  if (items.length === 0) return res.status(400).json({ error: 'No items found in CSV' });

  const [job] = await db.insert(harvestJobs).values({
    userId: req.user!.uid,
    mode: 'enrich',
    inputData: { items, source: 'csv' },
    status: 'running',
  }).returning();

  const { runEnrichmentJob } = await import('../services/enrichmentService.js');
  runEnrichmentJob(job.id, req.user!.uid, items).catch(console.error);
  res.json({ jobId: job.id, itemCount: items.length });
});

export default router;

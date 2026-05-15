import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { db } from '../db/index.js';
import { harvestJobs } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { requireCredits } from '../middleware/checkCredits.js';
import { runLeadJob } from '../services/leadService.js';
import { runExtractJob } from '../services/extractService.js';
import { randomBytes } from 'crypto';

const router = Router();

// GET /api/jobs/:id — poll job status
router.get('/:id', verifyFirebaseToken, async (req: any, res: any) => {
  const [job] = await db
    .select()
    .from(harvestJobs)
    .where(and(eq(harvestJobs.id, req.params.id), eq(harvestJobs.userId, req.user!.uid)))
    .limit(1);

  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// GET /api/jobs/:id/stream — SSE real-time progress
router.get('/:id/stream', verifyFirebaseToken, async (req: any, res: any) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  const jobId = req.params.id;
  const userId = req.user!.uid;

  const poll = setInterval(async () => {
    try {
      const [job] = await db
        .select()
        .from(harvestJobs)
        .where(and(eq(harvestJobs.id, jobId), eq(harvestJobs.userId, userId)))
        .limit(1);

      if (!job) { send({ error: 'Not found' }); clearInterval(poll); res.end(); return; }

      send({
        status: job.status,
        progress: job.progress,
        progressMessage: job.progressMessage,
        resultCount: job.resultCount,
        creditsUsed: job.creditsUsed,
        error: job.errorMessage,
      });

      if (job.status === 'done' || job.status === 'failed') {
        clearInterval(poll);
        setTimeout(() => res.end(), 500);
      }
    } catch {
      clearInterval(poll);
      res.end();
    }
  }, 1500);

  req.on('close', () => clearInterval(poll));
});

// GET /api/jobs/:id/results — fetch job result data
router.get('/:id/results', verifyFirebaseToken, async (req, res) => {
  const [job] = await db
    .select()
    .from(harvestJobs)
    .where(and(eq(harvestJobs.id, req.params.id), eq(harvestJobs.userId, req.user!.uid)))
    .limit(1);

  if (!job) return res.status(404).json({ error: 'Job not found' });
  // Frontend expects a plain array (calls .filter() on res.data directly)
  res.json(job.resultData ?? []);
});

// GET /api/jobs — list user's recent jobs
router.get('/', verifyFirebaseToken, async (req: any, res: any) => {
  const jobs = await db
    .select({
      id: harvestJobs.id,
      mode: harvestJobs.mode,
      status: harvestJobs.status,
      resultCount: harvestJobs.resultCount,
      creditsUsed: harvestJobs.creditsUsed,
      inputData: harvestJobs.inputData,
      createdAt: harvestJobs.createdAt,
    })
    .from(harvestJobs)
    .where(eq(harvestJobs.userId, req.user!.uid))
    .orderBy(desc(harvestJobs.createdAt))
    .limit(20);

  res.json({ jobs });
});

// DELETE /api/jobs/:id — delete a single job
router.delete('/:id', verifyFirebaseToken, async (req: any, res: any) => {
  if (req.params.id === 'all') return res.status(400).json({ error: 'invalid route execution' });
  const [job] = await db.select().from(harvestJobs)
    .where(and(eq(harvestJobs.id, req.params.id as string), eq(harvestJobs.userId, req.user!.uid)))
    .limit(1);
  if (!job) return res.status(404).json({ error: 'Not found' });
  await db.delete(harvestJobs).where(eq(harvestJobs.id, req.params.id as string));
  res.json({ success: true });
});

// DELETE /api/jobs/all — delete all jobs for user
router.delete('/all/delete', verifyFirebaseToken, async (req: any, res: any) => {
  await db.delete(harvestJobs).where(eq(harvestJobs.userId, req.user!.uid));
  res.json({ success: true });
});

// POST /api/jobs/:id/retry — clone a failed job and re-run it
router.post('/:id/retry', verifyFirebaseToken, requireCredits, async (req: any, res: any) => {
  const [original] = await db.select().from(harvestJobs)
    .where(and(eq(harvestJobs.id, req.params.id as string), eq(harvestJobs.userId, req.user!.uid)))
    .limit(1);
  if (!original || original.status !== 'failed') return res.status(400).json({ error: 'Job not retryable' });
  
  const [newJob] = await db.insert(harvestJobs).values({
    userId: req.user!.uid,
    mode: original.mode,
    inputData: original.inputData,
    status: 'running',
  }).returning();

  if (original.mode === 'leads') {
    const { businessType, location, sources, maxResults } = original.inputData as any;
    runLeadJob(newJob.id, req.user!.uid, businessType, location, sources, maxResults).catch(console.error);
  } else {
    const { urls, instruction } = original.inputData as any;
    runExtractJob(newJob.id, req.user!.uid, urls, instruction).catch(console.error);
  }

  res.json({ jobId: newJob.id });
});

// POST /api/jobs/:id/share Generate Share Token
router.post('/:id/share', verifyFirebaseToken, async (req: any, res: any) => {
  const token = randomBytes(16).toString('hex');
  await db.update(harvestJobs).set({ shareToken: token, isShared: true })
    .where(and(eq(harvestJobs.id, req.params.id as string), eq(harvestJobs.userId, req.user!.uid)));
  res.json({ shareUrl: `${process.env.CLIENT_URL}/shared/${token}` });
});

// GET /api/jobs/shared/:token — public, no auth
router.get('/shared/:token', async (req: any, res: any) => {
  const [job] = await db.select().from(harvestJobs)
    .where(and(eq(harvestJobs.shareToken, req.params.token as string), eq(harvestJobs.isShared, true)))
    .limit(1);
  if (!job) return res.status(404).json({ error: 'Not found or not shared' });
  res.json({ mode: job.mode, resultData: job.resultData, resultCount: job.resultCount, createdAt: job.createdAt });
});

// GET /api/jobs/stats/analytics
router.get('/stats/analytics', verifyFirebaseToken, async (req: any, res: any) => {
  const allJobs = await db.select({
    mode: harvestJobs.mode,
    status: harvestJobs.status,
    resultCount: harvestJobs.resultCount,
    creditsUsed: harvestJobs.creditsUsed,
    createdAt: harvestJobs.createdAt,
  }).from(harvestJobs).where(eq(harvestJobs.userId, req.user!.uid));

  const totalJobs = allJobs.length;
  const totalResults = allJobs.reduce((s, j) => s + (j.resultCount ?? 0), 0);
  const totalCreditsUsed = allJobs.reduce((s, j) => s + (j.creditsUsed ?? 0), 0);
  const successRate = totalJobs > 0 ? Math.round((allJobs.filter(j => j.status === 'done').length / totalJobs) * 100) : 0;

  const now = new Date();
  const days: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = allJobs.filter(j => j.createdAt && j.createdAt.toISOString().slice(0, 10) === dateStr).length;
    days.push({ date: dateStr, count });
  }

  res.json({ totalJobs, totalResults, totalCreditsUsed, successRate, dailyActivity: days });
});

export default router;

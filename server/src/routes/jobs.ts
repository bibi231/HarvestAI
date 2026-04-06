import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { db } from '../db/index.js';
import { harvestJobs } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// GET /api/jobs/:id — poll job status
router.get('/:id', verifyFirebaseToken, async (req, res) => {
  const [job] = await db
    .select()
    .from(harvestJobs)
    .where(and(eq(harvestJobs.id, req.params.id), eq(harvestJobs.userId, req.user!.uid)))
    .limit(1);

  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

// GET /api/jobs/:id/stream — SSE real-time progress
router.get('/:id/stream', verifyFirebaseToken, async (req, res) => {
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

// GET /api/jobs — list user's recent jobs
router.get('/', verifyFirebaseToken, async (req, res) => {
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

export default router;

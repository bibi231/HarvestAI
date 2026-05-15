import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { db } from '../db/index.js';
import { scheduledJobs } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { getNextRunAt } from '../services/schedulerService.js';

const router = Router();

// GET /api/scheduled — list all scheduled jobs
router.get('/', verifyFirebaseToken, async (req: any, res: any) => {
  const jobs = await db.select().from(scheduledJobs)
    .where(eq(scheduledJobs.userId, req.user!.uid))
    .orderBy(desc(scheduledJobs.createdAt));
  res.json({ jobs });
});

// POST /api/scheduled — create a new scheduled job
router.post('/', verifyFirebaseToken, async (req: any, res: any) => {
  const { name, mode, inputData, schedule } = req.body;
  const validSchedules = ['hourly', 'daily', 'weekly', 'monthly'];
  if (!validSchedules.includes(schedule)) return res.status(400).json({ error: 'Invalid schedule. Use: hourly, daily, weekly, monthly' });
  if (!name || !mode || !inputData) return res.status(400).json({ error: 'Missing required fields: name, mode, inputData' });

  const [sj] = await db.insert(scheduledJobs).values({
    userId: req.user!.uid,
    name,
    mode,
    inputData,
    schedule,
    nextRunAt: new Date(), // run immediately on first trigger
    isActive: true,
  }).returning();

  res.json(sj);
});

// PATCH /api/scheduled/:id — pause/resume or update
router.patch('/:id', verifyFirebaseToken, async (req: any, res: any) => {
  const { isActive, name, schedule } = req.body;
  const updates: Record<string, unknown> = {};
  if (isActive !== undefined) updates.isActive = isActive;
  if (name) updates.name = name;
  if (schedule) {
    updates.schedule = schedule;
    updates.nextRunAt = getNextRunAt(schedule);
  }

  await db.update(scheduledJobs).set(updates)
    .where(and(eq(scheduledJobs.id, req.params.id), eq(scheduledJobs.userId, req.user!.uid)));
  res.json({ success: true });
});

// DELETE /api/scheduled/:id — delete a scheduled job
router.delete('/:id', verifyFirebaseToken, async (req: any, res: any) => {
  await db.delete(scheduledJobs)
    .where(and(eq(scheduledJobs.id, req.params.id), eq(scheduledJobs.userId, req.user!.uid)));
  res.json({ success: true });
});

export default router;

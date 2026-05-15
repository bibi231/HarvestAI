import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { db } from '../db/index.js';
import { jobTemplates } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

router.get('/', verifyFirebaseToken, async (req, res) => {
  const templates = await db.select().from(jobTemplates)
    .where(eq(jobTemplates.userId, (req as any).user!.uid))
    .orderBy(desc(jobTemplates.useCount));
  res.json({ templates });
});

router.post('/', verifyFirebaseToken, async (req, res) => {
  const { name, mode, inputData } = req.body;
  if (!name || !mode || !inputData) return res.status(400).json({ error: 'Missing fields' });
  const [t] = await db.insert(jobTemplates).values({
    userId: (req as any).user!.uid, name, mode, inputData,
  }).returning();
  res.json(t);
});

router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  await db.delete(jobTemplates)
    .where(and(eq(jobTemplates.id, req.params.id as string), eq(jobTemplates.userId, (req as any).user!.uid)));
  res.json({ success: true });
});

router.post('/:id/use', verifyFirebaseToken, async (req, res) => {
  const [t] = await db.select().from(jobTemplates)
    .where(and(eq(jobTemplates.id, req.params.id as string), eq(jobTemplates.userId, (req as any).user!.uid))).limit(1);
  if (!t) return res.status(404).json({ error: 'Not found' });
  await db.update(jobTemplates).set({ useCount: (t.useCount ?? 0) + 1 }).where(eq(jobTemplates.id, t.id));
  res.json(t);
});

export default router;

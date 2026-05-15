import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

const router = Router();

// GET /api/settings — fetch user settings
router.get('/', verifyFirebaseToken, async (req, res) => {
  const [user] = await db.select().from(users).where(eq(users.id, (req as any).user!.uid)).limit(1);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    notificationsEmail: user.notificationsEmail,
    notificationsJobComplete: user.notificationsJobComplete,
    defaultMode: user.defaultMode,
    defaultMaxResults: user.defaultMaxResults,
    defaultSources: user.defaultSources,
    timezone: user.timezone,
    hasApiKey: !!user.apiKey,
    apiKeyCreatedAt: user.apiKeyCreatedAt,
    email: user.email,
    displayName: user.displayName,
    photoUrl: user.photoUrl,
    createdAt: user.createdAt,
    totalJobs: user.totalJobs,
    currency: user.currency,
    webhookUrl: user.webhookUrl,
    webhookSecret: user.webhookSecret ? '••••••••' : null,
  });
});

// PATCH /api/settings — update user settings
router.patch('/', verifyFirebaseToken, async (req, res) => {
  const allowed = ['notificationsEmail', 'notificationsJobComplete', 'defaultMode', 'defaultMaxResults', 'defaultSources', 'timezone', 'displayName', 'webhookUrl', 'webhookSecret'];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No valid fields to update' });
  await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, (req as any).user!.uid));
  res.json({ success: true });
});

// POST /api/settings/generate-api-key
router.post('/generate-api-key', verifyFirebaseToken, async (req, res) => {
  const apiKey = `hai_${randomBytes(24).toString('hex')}`;
  await db.update(users).set({ apiKey, apiKeyCreatedAt: new Date() }).where(eq(users.id, (req as any).user!.uid));
  res.json({ apiKey }); // only returned once — never again
});

// DELETE /api/settings/api-key
router.delete('/api-key', verifyFirebaseToken, async (req, res) => {
  await db.update(users).set({ apiKey: null, apiKeyCreatedAt: null }).where(eq(users.id, (req as any).user!.uid));
  res.json({ success: true });
});

// DELETE /api/settings/account
router.delete('/account', verifyFirebaseToken, async (req, res) => {
  const uid = (req as any).user!.uid;
  const { harvestJobs, payments } = await import('../db/schema.js');
  await db.delete(harvestJobs).where(eq(harvestJobs.userId, uid));
  await db.delete(payments).where(eq(payments.userId, uid));
  await db.delete(users).where(eq(users.id, uid));
  
  // Also delete from Firebase
  const admin = (await import('firebase-admin')).default;
  await admin.auth().deleteUser(uid).catch(() => {});
  
  res.json({ success: true });
});

export default router;

import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { upsertUser, checkCredits } from '../services/creditsService.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { sendWelcomeEmail } from '../lib/email/send.js';

const router = Router();

router.post('/sync', verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user!;

    const [existingUser] = await db.select({ id: users.id }).from(users).where(eq(users.id, uid)).limit(1);
    const isNew = !existingUser;

    await upsertUser(uid, email ?? '', name, picture);

    if (isNew && email) {
      sendWelcomeEmail(uid, email, name, 'https://harvestai.com.ng').catch(console.error);
    }

    const credits = await checkCredits(uid);
    res.json({ uid, email, credits });
  } catch {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

export default router;

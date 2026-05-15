import { Router } from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { upsertUser, checkCredits } from '../services/creditsService.js';

const router = Router();

router.post('/sync', verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user!;
    await upsertUser(uid, email ?? "", name, picture);
    const credits = await checkCredits(uid);
    res.json({ uid, email, credits });
  } catch (err) {
    res.status(500).json({ error: 'SERVER_ERROR' });
  }
});

export default router;

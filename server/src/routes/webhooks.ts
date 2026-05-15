import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// Credit pack mapping
const PACK_CREDITS: Record<string, number> = {
  starter: 100,
  pro: 300,
  power: 1000,
};

// Derive pack from NGN amount
function packFromAmount(amountNGN: number): { pack: string; credits: number } {
  if (amountNGN >= 15000) return { pack: 'power', credits: 1000 };
  if (amountNGN >= 5000) return { pack: 'pro', credits: 300 };
  return { pack: 'starter', credits: 100 };
}

// ── GTSquad webhook ───────────────────────────────────────────────────────────
router.post('/gtsquad', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-gtsquad-signature'] as string;
    const secret = process.env.GTSQUAD_SECRET_KEY || '';
    const rawBody = (req as any).rawBody instanceof Buffer
      ? (req as any).rawBody
      : Buffer.from(JSON.stringify(req.body));
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    if (!signature || signature !== expected) {
      console.warn('GTSquad: invalid signature');
      return res.status(401).send('Invalid signature');
    }

    const event = JSON.parse(rawBody.toString());

    if (event.Event === 'payment.completed' && event.Body?.transaction_status === 'success') {
      const { customer_email, transaction_ref } = event.Body;
      const packName = (event.Body.meta_data?.pack as string) || 'starter';
      const credits = PACK_CREDITS[packName] ?? 100;

      const [user] = await db.select().from(users).where(eq(users.email, customer_email));
      if (!user) {
        console.warn(`GTSquad: user not found for ${customer_email}`);
        return res.status(200).send('User not found, ignoring');
      }

      await db.update(users)
        .set({ paidCredits: sql`${users.paidCredits} + ${credits}` })
        .where(eq(users.id, user.id));

      console.log(`GTSquad: added ${credits} credits to ${customer_email} (ref: ${transaction_ref})`);
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('GTSquad webhook error', err);
    return res.status(500).send('Internal error');
  }
});

// ── Monnify webhook ───────────────────────────────────────────────────────────
router.post('/monnify', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['monnify-signature']
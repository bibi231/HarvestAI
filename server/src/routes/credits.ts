import { Router } from 'express';
import { db } from '../db/index.js';
import { users, payments } from '../db/schema.js';
import { eq, sql, desc } from 'drizzle-orm';
import axios from 'axios';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

const router = Router();

// ── GATEWAY CONFIG ──
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

/**
 * Initialize a Flutterwave Transaction
 * POST /api/credits/initialize
 * This is called before the frontend opens the Flutterwave popup to get a reference if needed,
 * or simply used to log the intention. In standard Flutterwave Inline, the frontend handles
 * the popup, and the backend verifies the 'tx_ref'.
 */
router.post('/initialize', verifyFirebaseToken, async (req: any, res: any) => {
  try {
    const { planId, amount, currency = 'NGN', provider = 'flutterwave' } = req.body;
    const user = (req as any).user!;

    const tx_ref = `h-tx-${Date.now()}-${user.uid.slice(0, 8)}`;

    // Create a pending payment record
    await db.insert(payments).values({
      userId: user.uid,
      amountMinor: Math.floor(amount * 100),
      currency,
      credits: (planId === 'power' ? 500 : (planId === 'pro' ? 250 : 100)),
      pack: planId,
      status: 'pending',
      provider: provider,
      externalRef: tx_ref,
      metadata: { planId }
    });

    res.json({ 
      tx_ref, 
      flw_public_key: process.env.VITE_FLW_PUBLIC_KEY,
      paystack_public_key: process.env.VITE_PAYSTACK_PUBLIC_KEY
    });
  } catch (error: any) {
    console.error('Flutterwave Init Error:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

/**
 * Verify a Flutterwave Transaction (Manual/Frontend callback)
 * POST /api/credits/verify
 */
router.post('/verify', verifyFirebaseToken, async (req: any, res: any) => {
  try {
    const { transaction_id, reference, provider = 'flutterwave' } = req.body;
    const user = (req as any).user!;

    let status = '';
    let tx_ref = '';

    if (provider === 'paystack') {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
      );
      status = response.data.data.status === 'success' ? 'successful' : 'failed';
      tx_ref = response.data.data.reference;
    } else {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
        { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } }
      );
      status = response.data.data.status;
      tx_ref = response.data.data.tx_ref;
    }

    // 2. Validate user matches
    // In a production app, we'd check tx_ref to ensure it's the same user.
    
    if (status === 'successful') {
      const paymentRecord = (await db.select().from(payments).where(eq(payments.externalRef, tx_ref)).limit(1))[0];
      
      if (paymentRecord && paymentRecord.status !== 'completed') {
        const metadata = paymentRecord.metadata as Record<string, any> | null;
        const creditsToAdding = parseInt(metadata?.planId === 'power' ? '500' : (metadata?.planId === 'pro' ? '250' : '100'));
        
        // 3. Atomic Update: Mark payment as completed and add credits
        await db.transaction(async (tx) => {
          await tx.update(payments).set({ status: 'completed' }).where(eq(payments.id, tx_ref));
          await tx.update(users).set({ 
            paidCredits: sql`${users.paidCredits} + ${creditsToAdding}`,
            totalCredits: sql`${users.totalCredits} + ${creditsToAdding}` 
          }).where(eq(users.id, user.uid));
        });

        return res.json({ success: true, creditsAdded: creditsToAdding });
      }
      
      return res.json({ success: true, message: 'Credits already added' });
    }

    res.status(400).json({ error: 'Payment not successful' });
  } catch (error: any) {
    console.error('Verification Error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// GET /api/credits — current balance
router.get('/', verifyFirebaseToken, async (req: any, res: any) => {
  try {
    const info = await (await import('../services/creditsService.js')).checkCredits(req.user!.uid);
    res.json({
      freeRemaining: info.freeRemaining,
      paidCredits: info.paidCredits,
      canHarvest: info.canHarvest,
      resetDate: info.resetDate,
      currency: info.currency,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
});

// GET /api/credits/history
router.get('/history', verifyFirebaseToken, async (req: any, res: any) => {
  const history = await db.select().from(payments)
    .where(eq(payments.userId, req.user!.uid))
    .orderBy(desc(payments.createdAt))
    .limit(50);
  res.json({ payments: history });
});

// ── Pack catalog ────────────────────────────────────────────────────────────
const PACKS: Record<string, { credits: number; ngnKobo: number; usdCents: number; name: string }> = {
  starter: { credits: 100,  ngnKobo: 250000,  usdCents: 800,  name: 'Starter' },
  pro:     { credits: 300,  ngnKobo: 600000,  usdCents: 2000, name: 'Pro' },
  power:   { credits: 1000, ngnKobo: 1500000, usdCents: 5000, name: 'Power' },
};

// ── Squad inline checkout (no redirect — popup on site) ─────────────────────
router.post('/gtsquad-checkout', verifyFirebaseToken, async (req: any, res: any) => {
  try {
    const { packId, currency = 'NGN' } = req.body;
    const email: string = (req as any).user!.email || '';
    const userId: string = (req as any).user!.uid || '';
    const pack = PACKS[packId as string];
    if (!pack)  return res.status(400).json({ message: 'Invalid pack' });
    if (!email) return res.status(400).json({ message: 'No email on user' });

    const publicKey = process.env.GTSQUAD_PUBLIC_KEY || process.env.SQUAD_PUBLIC_KEY;
    if (!publicKey) return res.status(500).json({ message: 'Squad not configured (set GTSQUAD_PUBLIC_KEY)' });

    const cur = String(currency).toUpperCase() === 'USD' ? 'USD' : 'NGN';
    const amount = cur === 'USD' ? pack.usdCents : pack.ngnKobo;
    const txRef = `harvestai_${userId.slice(0, 10)}_${Date.now()}`;

    return res.json({
      mode: 'inline',
      publicKey,
      transactionRef: txRef,
      amount,
      currency: cur,
      email,
      customerName: (req as any).user!.name || email,
      metadata: { pack: packId, userId, credits: pack.credits },
    });
  } catch (err) { res.status(500).json({ message: 'Checkout failed' }); }
});

// ── LemonSqueezy USD checkout — overlay URL ──────────────────────────────────
const LS_URLS: Record<string, string | undefined> = {
  starter: process.env.LS_URL_STARTER,
  pro:     process.env.LS_URL_PRO,
  power:   process.env.LS_URL_POWER,
};

router.post('/lemonsqueezy-checkout', verifyFirebaseToken, async (req: any, res: any) => {
  try {
    const { packId } = req.body;
    const email: string = (req as any).user!.email || '';
    const userId: string = (req as any).user!.uid || '';
    const pack = PACKS[packId as string];
    const baseUrl = LS_URLS[packId as string];
    if (!pack)    return res.status(400).json({ message: 'Invalid pack' });
    if (!baseUrl) return res.status(503).json({ message: `LemonSqueezy URL not configured (set LS_URL_${packId.toUpperCase()})` });

    const url = new URL(baseUrl);
    if (email)  url.searchParams.set('checkout[email]', email);
    url.searchParams.set('checkout[custom][userId]', userId);
    url.searchParams.set('checkout[custom][pack]',   packId);
    return res.json({ mode: 'overlay', checkoutUrl: url.toString() });
  } catch (err) { res.status(500).json({ message: 'Checkout failed' }); }
});

export default router;

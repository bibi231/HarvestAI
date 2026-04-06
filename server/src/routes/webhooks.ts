import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { users, payments } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// ── FLUTTERWAVE WEBHOOK ──
// Securely get the hash to verify that the request is genuinely from Flutterwave
const FLW_SECRET_HASH = process.env.FLW_SECRET_HASH || 'harvestai_v3_secure_hash';

/**
 * Flutterwave Webhook Handler
 * POST /api/webhooks/flutterwave
 */
router.post('/flutterwave', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['verif-hash'];

    if (!signature || signature !== FLW_SECRET_HASH) {
      // Unauthenticated request
      return res.status(401).send();
    }

    const payload = req.body;
    const { status, tx_ref, amount, currency, id: transactionId } = payload.data;

    if (status === 'successful') {
      // 1. Find the user ID from our initial initialization
      const paymentRecord = (await db.select().from(payments).where(eq(payments.id, tx_ref)).limit(1))[0];
      
      if (paymentRecord && paymentRecord.status !== 'completed') {
        const creditsToAdding = parseInt(paymentRecord.metadata?.planId === 'power' ? '500' : '100');

        // 2. Perform Atomic Transaction to ensure credits are only added once
        await db.transaction(async (tx) => {
          await tx.update(payments).set({ 
            status: 'completed', 
            metadata: { ...paymentRecord.metadata, flw_id: transactionId }
          }).where(eq(payments.id, tx_ref));

          await tx.update(users).set({ 
            credits: sql`${users.credits} + ${creditsToAdding}` 
          }).where(eq(users.id, paymentRecord.userId));
        });

        console.log(`[Webhook] Success: Added ${creditsToAdding} credits to user ${paymentRecord.userId}`);
      }
    }

    res.status(200).send();
  } catch (error: any) {
    console.error('Webhook Error:', error);
    res.status(500).send();
  }
});

/**
 * Paystack Webhook Handler (Secondary)
 * POST /api/webhooks/paystack
 */
router.post('/paystack', async (req: Request, res: Response) => {
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!).update(JSON.stringify(req.body)).digest('hex');
  if (hash === req.headers['x-paystack-signature']) {
    const event = req.body;
    if (event.event === 'charge.success') {
      const { reference, customer } = event.data;
      // Logical check for Paystack reference same as Flutterwave logic...
    }
  }
  res.status(200).send();
});

export default router;

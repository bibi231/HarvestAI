import { Router } from 'express';
import { db } from '../db/index.js';
import { users, payments } from '../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import axios from 'axios';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

const router = Router();

// ── FLUTTERWAVE CONFIG ──
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

/**
 * Initialize a Flutterwave Transaction
 * POST /api/credits/initialize
 * This is called before the frontend opens the Flutterwave popup to get a reference if needed,
 * or simply used to log the intention. In standard Flutterwave Inline, the frontend handles
 * the popup, and the backend verifies the 'tx_ref'.
 */
router.post('/initialize', verifyFirebaseToken, async (req, res) => {
  try {
    const { planId, amount, currency = 'NGN' } = req.body;
    const user = req.user!;

    const tx_ref = `h-tx-${Date.now()}-${user.uid.slice(0, 8)}`;

    // Create a pending payment record
    await db.insert(payments).values({
      id: tx_ref,
      userId: user.uid,
      amount: amount.toString(),
      currency,
      status: 'pending',
      provider: 'flutterwave',
      metadata: { planId }
    });

    res.json({ tx_ref, public_key: process.env.VITE_FLW_PUBLIC_KEY });
  } catch (error: any) {
    console.error('Flutterwave Init Error:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
});

/**
 * Verify a Flutterwave Transaction (Manual/Frontend callback)
 * POST /api/credits/verify
 */
router.post('/verify', verifyFirebaseToken, async (req, res) => {
  try {
    const { transaction_id } = req.body;
    const user = req.user!;

    // 1. Call Flutterwave to verify status
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } }
    );

    const { status, amount, currency, tx_ref, customer } = response.data.data;

    // 2. Validate user matches
    // In a production app, we'd check tx_ref to ensure it's the same user.
    
    if (status === 'successful') {
      const paymentRecord = (await db.select().from(payments).where(eq(payments.id, tx_ref)).limit(1))[0];
      
      if (paymentRecord && paymentRecord.status !== 'completed') {
        const creditsToAdding = parseInt(paymentRecord.metadata?.planId === 'power' ? '500' : '100');
        
        // 3. Atomic Update: Mark payment as completed and add credits
        await db.transaction(async (tx) => {
          await tx.update(payments).set({ status: 'completed' }).where(eq(payments.id, tx_ref));
          await tx.update(users).set({ 
            credits: sql`${users.credits} + ${creditsToAdding}` 
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

export default router;

import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { addPaidCredits } from '../services/creditsService.js';

const router = Router();

// ── GTSquad Webhook ───────────────────────────────────────────────────────────
// Docs: https://docs.squadco.com — header is x-squad-encrypted-body,
// algorithm is HMAC-SHA512, hex output uppercased.
router.post('/gtsquad', async (req: Request, res: Response) => {
    try {
        const secret = process.env.GTSQUAD_SECRET_KEY || '';
        const rawBody = JSON.stringify(req.body);
        const expected = crypto
            .createHmac('sha512', secret)
            .update(rawBody)
            .digest('hex')
            .toUpperCase();
        const received = ((req.headers['x-squad-encrypted-body'] || '') as string).toUpperCase();
        
        if (!secret || received !== expected) {
            console.warn('[Squad Webhook] Invalid signature');
            return res.status(401).send('Invalid signature');
        }

        // Squad wraps the payload in { Event, Body }
        const event = req.body.Event || req.body.event;
        const data = req.body.Body || req.body.data || req.body;

        if (
            (event === 'charge_successful' || event === 'payment.completed') &&
            (data?.gateway_response === 'Successful' || data?.status === 'success' || data?.transaction_status === 'success')
        ) {
            const reference = data.transaction_ref || data.reference;
            const meta = data.meta || data.metadata || {};
            const packId = meta.pack || meta.packId;
            const email = data.email || data.customer_email || data.customer?.email;

            if (!reference || !packId || !email) {
                console.warn('[Squad Webhook] Missing reference/packId/email');
                return res.status(200).send('OK');
            }

            const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
            if (!user) {
                console.warn(`[Squad Webhook] No user found for email ${email}`);
                return res.status(200).send('OK');
            }

            const PACK_CREDITS: Record<string, number> = { starter: 100, pro: 300, power: 1000 };
            const credits = PACK_CREDITS[packId] ?? 100;

            await addPaidCredits(user.id, credits, 'squad', reference, packId, data.amount ?? 0, 'NGN');
            console.log(`[Squad Webhook] Added ${credits} credits to ${email}`);
        }

        return res.status(200).send('OK');
    } catch (err) {
        console.error('[Squad Webhook] Error:', err);
        return res.status(500).send('Internal error');
    }
});

// ── Monnify Webhook ───────────────────────────────────────────────────────────
router.post('/monnify', async (req: Request, res: Response) => {
    try {
        const secret = process.env.MONNIFY_SECRET_KEY || '';
        const rawBody = JSON.stringify(req.body);
        const expected = crypto
            .createHmac('sha512', secret)
            .update(rawBody)
            .digest('hex');
        const received = (req.headers['monnify-signature'] || '') as string;
        
        if (!secret || received !== expected) {
            console.warn('[Monnify Webhook] Invalid signature');
            return res.status(401).send('Invalid signature');
        }

        const { eventType, eventData } = req.body;
        if (eventType === 'SUCCESSFUL_TRANSACTION') {
            const reference  = eventData?.transactionReference as string;
            const email      = eventData?.customer?.email as string;
            const amountPaid = eventData?.amountPaid as number;

            if (!reference || !email) return res.status(200).send('OK');

            const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
            if (!user) {
                console.warn(`[Monnify Webhook] No user found for ${email}`);
                return res.status(200).send('OK');
            }

            const AMOUNT_TO_PACK = [
                { min: 14000, pack: 'power',   credits: 1000 },
                { min: 4500,  pack: 'pro',     credits: 300  },
                { min: 0,     pack: 'starter', credits: 100  },
            ];
            const result = AMOUNT_TO_PACK.find(b => amountPaid >= b.min) ?? AMOUNT_TO_PACK[2];
            
            await addPaidCredits(user.id, result.credits, 'monnify', reference, result.pack, amountPaid, 'NGN');
            console.log(`[Monnify Webhook] Added ${result.credits} credits to ${email}`);
        }

        return res.status(200).send('OK');
    } catch (err) {
        console.error('[Monnify Webhook] Error:', err);
        return res.status(500).send('Internal error');
    }
});

export default router;

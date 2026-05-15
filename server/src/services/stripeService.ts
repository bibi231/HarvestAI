import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' });

export { stripe };

export const STRIPE_PACKS: Record<string, { credits: number; amountCents: number; name: string }> = {
  starter: { credits: 100, amountCents: 500,  name: 'HarvestAI Starter — 100 credits' },
  pro:     { credits: 300, amountCents: 1200, name: 'HarvestAI Pro — 300 credits' },
  power:   { credits: 1000, amountCents: 2900, name: 'HarvestAI Power — 1000 credits' },
};

export async function createCheckoutSession(
  userId: string,
  email: string,
  pack: string,
  successUrl: string,
  cancelUrl: string,
): Promise<string> {
  const packData = STRIPE_PACKS[pack];
  if (!packData) throw new Error(`Unknown pack: ${pack}`);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: email,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: packData.name },
        unit_amount: packData.amountCents,
      },
      quantity: 1,
    }],
    metadata: { userId, pack, credits: String(packData.credits) },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session.url!;
}

import crypto from 'crypto';

export function verifyPaystackSignature(rawBody: Buffer, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
}

export function getPackCredits(pack: string): number {
  const packs: Record<string, number> = { starter: 100, pro: 300, power: 1000 };
  return packs[pack] ?? 0;
}

export function getPackAmountKobo(pack: string): number {
  const packs: Record<string, number> = { starter: 200000, pro: 500000, power: 1200000 };
  return packs[pack] ?? 0;
}

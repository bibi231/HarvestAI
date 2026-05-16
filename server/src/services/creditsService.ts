import { db } from '../db/index.js';
import { users, payments } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const FREE_CREDITS_LIMIT = 30;

function isNewMonth(date: Date | null): boolean {
  if (!date) return true;
  const now = new Date();
  return date.getFullYear() !== now.getFullYear() || date.getMonth() !== now.getMonth();
}

export async function upsertUser(
  uid: string,
  email: string,
  displayName?: string,
  photoUrl?: string,
): Promise<void> {
  await db
    .insert(users)
    .values({ id: uid, email, displayName, photoUrl })
    .onConflictDoUpdate({
      target: users.id,
      set: { email, displayName, photoUrl, updatedAt: new Date() },
    });
}

export async function checkCredits(userId: string): Promise<{
  canHarvest: boolean;
  freeRemaining: number;
  paidCredits: number;
  resetDate: Date | null;
  reason?: string;
  currency: string;
}> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error('User not found');

  let freeUsed = user.freeCreditsUsed ?? 0;
  const resetDate = user.freeCreditsResetAt;

  if (isNewMonth(resetDate)) {
    freeUsed = 0;
    await db.update(users).set({ freeCreditsUsed: 0, freeCreditsResetAt: new Date() }).where(eq(users.id, userId));
  }

  const freeRemaining = Math.max(0, FREE_CREDITS_LIMIT - freeUsed);
  const paidCredits = user.paidCredits ?? 0;
  const canHarvest = freeRemaining > 0 || paidCredits > 0;

  return {
    canHarvest,
    freeRemaining,
    paidCredits,
    resetDate: resetDate ?? null,
    reason: canHarvest ? undefined : 'No credits remaining',
    currency: user.currency ?? 'NGN',
  };
}

export async function deductCredits(userId: string, amount: number): Promise<{
  creditType: 'free' | 'paid';
  freeRemaining: number;
  paidCredits: number;
}> {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) throw new Error('User not found');

  let freeUsed = user.freeCreditsUsed ?? 0;
  if (isNewMonth(user.freeCreditsResetAt)) freeUsed = 0;

  const freeRemaining = Math.max(0, FREE_CREDITS_LIMIT - freeUsed);
  let creditType: 'free' | 'paid' = 'free';

  if (freeRemaining >= amount) {
    await db.update(users).set({
      freeCreditsUsed: freeUsed + amount,
      freeCreditsResetAt: user.freeCreditsResetAt ?? new Date(),
      totalJobs: (user.totalJobs ?? 0) + 1,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));
    creditType = 'free';
    return { creditType, freeRemaining: freeRemaining - amount, paidCredits: user.paidCredits ?? 0 };
  } else {
    const paid = user.paidCredits ?? 0;
    if (paid < amount) throw new Error('INSUFFICIENT_CREDITS');
    await db.update(users).set({
      paidCredits: paid - amount,
      totalJobs: (user.totalJobs ?? 0) + 1,
      updatedAt: new Date(),
    }).where(eq(users.id, userId));
    creditType = 'paid';
    return { creditType, freeRemaining: 0, paidCredits: paid - amount };
  }
}

export async function addPaidCredits(
  userId: string,
  credits: number,
  provider: 'paystack' | 'stripe' | 'squad' | 'monnify' | 'lemonsqueezy' | string,
  externalRef: string,
  pack: string,
  amountMinor: number,
  currency: string,
): Promise<void> {
  await db.insert(payments).values({
    userId,
    provider,
    externalRef,
    amountMinor,
    currency,
    credits,
    pack,
    status: 'success',
  });
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  await db.update(users).set({
    paidCredits: (user.paidCredits ?? 0) + credits,
    currency: currency as 'NGN' | 'USD',
    updatedAt: new Date(),
  }).where(eq(users.id, userId));
}

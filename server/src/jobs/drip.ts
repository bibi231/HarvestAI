import cron from 'node-cron';
import { db } from '../db/index.js';
import { users, emailLog } from '../db/schema.js';
import { and, eq } from 'drizzle-orm';
import { sendOnboardingEmail, sendReengageEmail } from '../lib/email/send.js';

const DAY_MS = 24 * 60 * 60 * 1000;

async function runOnboardingDrip() {
  const allUsers = await db.select({
    id: users.id,
    email: users.email,
    displayName: users.displayName,
    createdAt: (users as any).createdAt,
  }).from(users);

  const now = Date.now();
  for (const user of allUsers) {
    if (!user.createdAt) continue;
    const ageDays = (now - new Date(user.createdAt).getTime()) / DAY_MS;
    for (const day of [1, 3, 5, 7] as const) {
      if (ageDays >= day && ageDays < day + 1) {
        await sendOnboardingEmail(user.id, user.email, day, user.displayName ?? undefined);
      }
    }
  }
}

async function runReengagementDrip() {
  const allUsers = await db.select({
    id: users.id,
    email: users.email,
    displayName: users.displayName,
    updatedAt: (users as any).updatedAt,
  }).from(users);

  const now = Date.now();
  for (const user of allUsers) {
    const lastSeen = user.updatedAt ? new Date(user.updatedAt).getTime() : 0;
    const inactiveDays = (now - lastSeen) / DAY_MS;

    for (const day of [14, 21, 28] as const) {
      if (inactiveDays >= day && inactiveDays < day + 1) {
        const [alreadySent] = await db.select().from(emailLog)
          .where(and(eq(emailLog.userId, user.id), eq(emailLog.flow, `reengage_day${day}`)))
          .limit(1);
        if (!alreadySent) {
          await sendReengageEmail(user.id, user.email, day, { name: user.displayName ?? undefined });
        }
      }
    }
  }
}

export function startDripJobs() {
  cron.schedule('5 * * * *', () => { runOnboardingDrip().catch(console.error); });
  cron.schedule('0 8 * * *', () => { runReengagementDrip().catch(console.error); });
  console.log('[drip] Cron jobs started');
}

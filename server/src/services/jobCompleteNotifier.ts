import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { deliverWebhook } from './webhookService.js';
import { sendJobCompleteEmail } from './emailService.js';

/**
 * Shared helper: fires webhook + email after any job completes successfully.
 * Call this at the end of every job runner's "done" block.
 */
export async function notifyJobComplete(
  userId: string,
  jobId: string,
  mode: string,
  resultData: unknown[],
  resultCount: number,
): Promise<void> {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return;

    // Webhook delivery
    if (user.webhookUrl) {
      deliverWebhook(user.webhookUrl, user.webhookSecret, jobId, mode, resultData, resultCount)
        .catch(err => console.error('[webhook] delivery failed:', err.message));
    }

    // Email notification
    if (user.notificationsJobComplete && user.email) {
      sendJobCompleteEmail(user.email, jobId, mode, resultCount, `${process.env.CLIENT_URL}/results/${jobId}`)
        .catch(() => {});
    }
  } catch (err) {
    console.error('[notifyJobComplete] error:', err);
  }
}

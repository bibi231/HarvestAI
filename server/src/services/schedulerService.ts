import { db } from '../db/index.js';
import { scheduledJobs, harvestJobs, users } from '../db/schema.js';
import { eq, lte, and } from 'drizzle-orm';
import { runExtractJob, runSitemapJob } from './extractService.js';
import { runLeadJob } from './leadService.js';
import { runSerpJob } from './serpJobService.js';
import { runEmailFinderJob } from './emailFinderService.js';
import { runPriceCheckJob } from './priceService.js';

export function getNextRunAt(schedule: string, from = new Date()): Date {
  const next = new Date(from);
  switch (schedule) {
    case 'hourly':  next.setHours(next.getHours() + 1); break;
    case 'daily':   next.setDate(next.getDate() + 1); break;
    case 'weekly':  next.setDate(next.getDate() + 7); break;
    case 'monthly': next.setMonth(next.getMonth() + 1); break;
    default:        next.setDate(next.getDate() + 1);
  }
  return next;
}

/**
 * Run all scheduled jobs that are due.
 * Call this on a timer (every 5 minutes) or via a cron-like mechanism.
 */
export async function runDueScheduledJobs(): Promise<void> {
  const now = new Date();
  const due = await db.select().from(scheduledJobs)
    .where(and(
      eq(scheduledJobs.isActive, true),
      lte(scheduledJobs.nextRunAt, now),
    ));

  for (const sj of due) {
    try {
      // Check user has credits
      const [user] = await db.select().from(users).where(eq(users.id, sj.userId!)).limit(1);
      if (!user) continue;
      const freeLeft = Math.max(0, 5 - (user.freeCreditsUsed ?? 0));
      if (freeLeft === 0 && (user.paidCredits ?? 0) === 0) {
        // Skip this run — no credits
        await db.update(scheduledJobs).set({
          nextRunAt: getNextRunAt(sj.schedule),
        }).where(eq(scheduledJobs.id, sj.id));
        continue;
      }

      // Create a new harvest job
      const [newJob] = await db.insert(harvestJobs).values({
        userId: sj.userId,
        mode: sj.mode,
        inputData: sj.inputData,
        status: 'running',
      }).returning();

      // Update scheduled job metadata
      await db.update(scheduledJobs).set({
        lastRunAt: now,
        nextRunAt: getNextRunAt(sj.schedule),
        runCount: (sj.runCount ?? 0) + 1,
        lastJobId: newJob.id,
      }).where(eq(scheduledJobs.id, sj.id));

      // Fire the appropriate job runner
      const input = sj.inputData as any;
      switch (sj.mode) {
        case 'leads':
          runLeadJob(newJob.id, sj.userId!, input.businessType, input.location, input.sources, input.maxResults).catch(console.error);
          break;
        case 'extract':
          runExtractJob(newJob.id, sj.userId!, input.urls, input.instruction).catch(console.error);
          break;
        case 'serp':
          runSerpJob(newJob.id, sj.userId!, input.query, input.location, input.numResults).catch(console.error);
          break;
        case 'email_finder':
          runEmailFinderJob(newJob.id, sj.userId!, input.domain).catch(console.error);
          break;
        case 'price_check':
          runPriceCheckJob(newJob.id, sj.userId!, input.urls, input.selector).catch(console.error);
          break;
        case 'sitemap':
          runSitemapJob(newJob.id, sj.userId!, input.domain, input.instruction, input.maxUrls).catch(console.error);
          break;
      }

      console.log(`[scheduler] Fired scheduled job ${sj.id} → new jobId ${newJob.id}`);
    } catch (err) {
      console.error(`[scheduler] Failed to run scheduled job ${sj.id}:`, err);
    }
  }
}

/**
 * Start the scheduler polling loop.
 * Checks every 5 minutes for due jobs.
 */
export function startScheduler(): void {
  console.log('[scheduler] Started — checking every 5 minutes');
  setInterval(() => {
    runDueScheduledJobs().catch(err => console.error('[scheduler] error:', err));
  }, 5 * 60 * 1000);

  // Also run immediately on startup
  runDueScheduledJobs().catch(console.error);
}

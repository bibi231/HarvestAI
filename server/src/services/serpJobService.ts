import { db } from '../db/index.js';
import { harvestJobs } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { searchGoogle } from './serpService.js';
import { deductCredits } from './creditsService.js';
import { notifyJobComplete } from './jobCompleteNotifier.js';

export async function runSerpJob(jobId: string, userId: string, query: string, location: string, numResults: number): Promise<void> {
  try {
    await db.update(harvestJobs).set({ progress: 20, progressMessage: `Searching Google for "${query}"…` }).where(eq(harvestJobs.id, jobId));

    const serpData = await searchGoogle(query, location, numResults);

    const rows = serpData.results.map(r => ({
      position: r.position,
      title: r.title,
      url: r.url,
      domain: r.domain,
      description: r.description,
      type: r.type,
    }));

    await deductCredits(userId, 3).catch(() => {});

    await db.update(harvestJobs).set({
      status: 'done',
      progress: 100,
      progressMessage: `Found ${rows.length} search results`,
      resultData: rows as any,
      resultCount: rows.length,
      creditsUsed: 3,
      completedAt: new Date(),
    }).where(eq(harvestJobs.id, jobId));

    notifyJobComplete(userId, jobId, 'serp', rows, rows.length).catch(() => {});

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await db.update(harvestJobs).set({ status: 'failed', errorMessage: msg, completedAt: new Date() }).where(eq(harvestJobs.id, jobId));
  }
}

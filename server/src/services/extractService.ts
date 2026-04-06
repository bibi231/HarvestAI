import { db } from '../db/index.js';
import { harvestJobs } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { scrapeUrl } from './scraperService.js';
import { scrapeWithPlaywright } from './playwrightService.js';
import { extractData, type ExtractRow } from './aiService.js';

function looksJsHeavy(url: string): boolean {
  const jsHeavyDomains = ['twitter.com', 'x.com', 'linkedin.com', 'instagram.com', 'facebook.com', 'airbnb.com', 'booking.com'];
  try {
    const host = new URL(url).hostname.replace('www.', '');
    return jsHeavyDomains.some(d => host.includes(d));
  } catch { return false; }
}

export async function runExtractJob(
  jobId: string,
  userId: string,
  urls: string[],
  instruction: string,
): Promise<void> {
  const allRows: ExtractRow[] = [];

  try {
    await db.update(harvestJobs).set({ progress: 5, progressMessage: 'Starting extraction…' }).where(eq(harvestJobs.id, jobId));

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const progress = 5 + Math.floor((i / urls.length) * 85);

      await db.update(harvestJobs).set({
        progress,
        progressMessage: `Scraping ${new URL(url).hostname}…`,
      }).where(eq(harvestJobs.id, jobId));

      let scrapeResult;
      if (looksJsHeavy(url)) {
        scrapeResult = await scrapeWithPlaywright(url);
      } else {
        scrapeResult = await scrapeUrl(url);
        // If static scrape returns almost no text, retry with Playwright
        if (scrapeResult.success && scrapeResult.text.length < 500) {
          scrapeResult = await scrapeWithPlaywright(url);
        }
      }

      if (!scrapeResult.success || !scrapeResult.text) {
        allRows.push({ url, error: scrapeResult.error ?? 'Failed to scrape page' });
        continue;
      }

      await db.update(harvestJobs).set({
        progress: progress + 5,
        progressMessage: `Extracting data from ${new URL(url).hostname}…`,
      }).where(eq(harvestJobs.id, jobId));

      const rows = await extractData(scrapeResult.text, url, instruction);
      allRows.push(...rows.map(r => ({ ...r, _source_url: url })));

      await db.update(harvestJobs).set({
        progress: progress + 10,
        progressMessage: `Got ${allRows.length} rows so far…`,
        resultData: allRows as any,
        resultCount: allRows.length,
      }).where(eq(harvestJobs.id, jobId));
    }

    await db.update(harvestJobs).set({
      status: 'done',
      progress: 100,
      progressMessage: `Complete — ${allRows.length} rows extracted`,
      resultData: allRows as any,
      resultCount: allRows.length,
      creditsUsed: urls.length,
      completedAt: new Date(),
    }).where(eq(harvestJobs.id, jobId));

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await db.update(harvestJobs).set({
      status: 'failed',
      errorMessage: msg,
      completedAt: new Date(),
    }).where(eq(harvestJobs.id, jobId));
  }
}

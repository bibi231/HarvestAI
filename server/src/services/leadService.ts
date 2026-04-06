import { db } from '../db/index.js';
import { harvestJobs } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { scrapeUrl } from './scraperService.js';
import { scrapeWithPlaywright } from './playwrightService.js';
import { extractLeads, type LeadRow } from './aiService.js';

// URL builders for each directory source
function buildSourceUrl(sourceId: string, businessType: string, location: string): string {
  const q = encodeURIComponent(businessType);
  const l = encodeURIComponent(location);
  const sources: Record<string, string> = {
    vconnect: `https://www.vconnect.com/search-results?q=${q}&location=${l}`,
    businesslist: `https://www.businesslist.com.ng/companies/${encodeURIComponent(businessType.toLowerCase().replace(/\s+/g, '-'))}/${encodeURIComponent(location.toLowerCase())}`,
    yellowpages_ng: `https://www.yellowpages.com.ng/search?keyword=${q}&location=${l}`,
    kompass: `https://gb.kompass.com/searchCompanies/?activity=${q}&country=NGA`,
    google_maps: `https://www.google.com/maps/search/${q}+${l}`,
  };
  return sources[sourceId] ?? `https://www.google.com/search?q=${q}+${l}+contact+email`;
}

function needsPlaywright(sourceId: string): boolean {
  return sourceId === 'google_maps';
}

async function updateJobProgress(
  jobId: string,
  progress: number,
  message: string,
  partial?: { resultData?: LeadRow[]; resultCount?: number },
): Promise<void> {
  await db.update(harvestJobs).set({
    progress,
    progressMessage: message,
    ...(partial?.resultData !== undefined ? { resultData: partial.resultData as any } : {}),
    ...(partial?.resultCount !== undefined ? { resultCount: partial.resultCount } : {}),
  }).where(eq(harvestJobs.id, jobId));
}

export async function runLeadJob(
  jobId: string,
  userId: string,
  businessType: string,
  location: string,
  sources: string[],
  maxResults: number,
): Promise<void> {
  const allLeads: LeadRow[] = [];
  const seen = new Set<string>(); // deduplicate by business name

  try {
    await updateJobProgress(jobId, 5, 'Starting lead search…');

    for (let i = 0; i < sources.length; i++) {
      const sourceId = sources[i];
      const sourceLabel = sourceId.replace(/_/g, ' ');
      const progress = 5 + Math.floor((i / sources.length) * 80);

      await updateJobProgress(jobId, progress, `Scraping ${sourceLabel}…`);

      const url = buildSourceUrl(sourceId, businessType, location);
      let scrapeResult;

      if (needsPlaywright(sourceId)) {
        scrapeResult = await scrapeWithPlaywright(url);
      } else {
        scrapeResult = await scrapeUrl(url);
      }

      if (!scrapeResult.success || !scrapeResult.text) {
        await updateJobProgress(jobId, progress + 5, `${sourceLabel} — no results found, trying next…`);
        continue;
      }

      const leads = await extractLeads(scrapeResult.text, businessType, location, sourceLabel);

      for (const lead of leads) {
        const key = lead.name.toLowerCase().trim();
        if (!seen.has(key) && allLeads.length < maxResults) {
          seen.add(key);
          allLeads.push(lead);
        }
      }

      await updateJobProgress(
        jobId,
        progress + 10,
        `Found ${allLeads.length} leads so far…`,
        { resultData: allLeads, resultCount: allLeads.length },
      );
    }

    // Sort by relevance score descending
    allLeads.sort((a, b) => b.relevanceScore - a.relevanceScore);

    await db.update(harvestJobs).set({
      status: 'done',
      progress: 100,
      progressMessage: `Complete — ${allLeads.length} leads found`,
      resultData: allLeads as any,
      resultCount: allLeads.length,
      creditsUsed: sources.length,
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

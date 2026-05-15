import { scrapeUrl } from './scraperService.js';
import { searchGoogle } from './serpService.js';
import { findDomainEmails } from './emailFinderService.js';
import { extractData } from './aiService.js';

export interface EnrichedRow {
  _input: string;
  company_name: string;
  website: string;
  email: string;
  phone: string;
  linkedin: string;
  industry: string;
  location: string;
  company_size: string;
  description: string;
  enriched: boolean;
}

export async function enrichRow(input: string): Promise<EnrichedRow> {
  const base: EnrichedRow = {
    _input: input,
    company_name: input,
    website: '',
    email: '',
    phone: '',
    linkedin: '',
    industry: '',
    location: '',
    company_size: '',
    description: '',
    enriched: false,
  };

  try {
    // 1. Find website via Google
    const serp = await searchGoogle(`${input} official website`, '', 5);
    const topResult = serp.results.find(r => !r.url.includes('google') && !r.url.includes('wikipedia'));
    if (!topResult) return base;

    base.website = topResult.url;
    const domain = new URL(topResult.url).hostname;

    // 2. Scrape homepage for basic info
    const scrape = await scrapeUrl(topResult.url);
    if (scrape.success) {
      const aiData = await extractData(
        scrape.text,
        topResult.url,
        'Extract: company name, phone number, email address, LinkedIn URL, industry/sector, location/headquarters, company size (employees), and one-sentence description.',
      ).catch(() => []);

      const row = (aiData[0] as any) ?? {};
      base.company_name = String(row.company_name ?? input);
      base.phone = String(row.phone ?? row.phone_number ?? '');
      base.email = String(row.email ?? row.email_address ?? '');
      base.linkedin = String(row.linkedin ?? row.linkedin_url ?? '');
      base.industry = String(row.industry ?? row.sector ?? '');
      base.location = String(row.location ?? row.headquarters ?? '');
      base.company_size = String(row.company_size ?? row.employees ?? '');
      base.description = String(row.description ?? '');
    }

    // 3. If no email found, try email finder
    if (!base.email) {
      const emails = await findDomainEmails(domain).catch(() => []);
      const confirmed = emails.find(e => e.confidence === 'confirmed');
      if (confirmed) base.email = confirmed.email;
    }

    base.enriched = true;
    return base;
  } catch {
    return base;
  }
}

export async function runEnrichmentJob(jobId: string, userId: string, items: string[]): Promise<void> {
  const { db } = await import('../db/index.js');
  const { harvestJobs } = await import('../db/schema.js');
  const { deductCredits } = await import('./creditsService.js');
  const { eq } = await import('drizzle-orm');

  const results: EnrichedRow[] = [];
  const creditCost = items.length * 2;

  try {
    for (let i = 0; i < items.length; i++) {
      await db.update(harvestJobs).set({
        progress: Math.floor((i / items.length) * 90),
        progressMessage: `Enriching ${i + 1}/${items.length}: ${items[i]}…`,
      }).where(eq(harvestJobs.id, jobId));

      const enriched = await enrichRow(items[i]);
      results.push(enriched);

      await db.update(harvestJobs).set({
        resultData: results as any,
        resultCount: results.length,
      }).where(eq(harvestJobs.id, jobId));
    }

    await deductCredits(userId, creditCost).catch(() => {});
    await db.update(harvestJobs).set({
      status: 'done', progress: 100,
      progressMessage: `Enriched ${results.filter(r => r.enriched).length}/${items.length} items`,
      resultData: results as any,
      resultCount: results.length,
      creditsUsed: creditCost,
      completedAt: new Date(),
    }).where(eq(harvestJobs.id, jobId));

    const { notifyJobComplete } = await import('./jobCompleteNotifier.js');
    notifyJobComplete(userId, jobId, 'enrich', results, results.length).catch(() => {});

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await db.update(harvestJobs).set({ status: 'failed', errorMessage: msg, completedAt: new Date() }).where(eq(harvestJobs.id, jobId));
  }
}

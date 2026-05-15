import { scrapeUrl } from './scraperService.js';
import { scrapeWithPlaywright } from './playwrightService.js';
import { extractData } from './aiService.js';

export interface EmailFindResult {
  email: string;
  source: string;
  confidence: 'confirmed' | 'pattern' | 'possible';
  name?: string;
  title?: string;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const CONTACT_PAGE_PATTERNS = [
  '/contact', '/contact-us', '/about', '/about-us', '/team', '/our-team',
  '/people', '/staff', '/leadership', '/management', '/company', '/who-we-are',
];

export async function findDomainEmails(domain: string): Promise<EmailFindResult[]> {
  const base = domain.startsWith('http') ? domain : `https://${domain}`;
  const confirmed = new Set<string>();
  const results: EmailFindResult[] = [];

  // 1. Scrape homepage + contact pages
  const pagesToCheck = [base, ...CONTACT_PAGE_PATTERNS.map(p => `${base}${p}`)];

  for (const url of pagesToCheck) {
    const scrape = await scrapeUrl(url);
    if (!scrape.success) continue;

    const emails = scrape.html.match(EMAIL_REGEX) ?? [];
    for (const email of emails) {
      const e = email.toLowerCase();
      if (!confirmed.has(e) && e.includes(domain.replace('www.', '').split('.')[0])) {
        confirmed.add(e);
        results.push({ email: e, source: url, confidence: 'confirmed' });
      }
    }

    // Also ask AI to extract names + emails from team/about pages
    if (url.includes('team') || url.includes('about') || url.includes('people')) {
      const aiRows = await extractData(
        scrape.text,
        url,
        'Extract all person names, job titles, and email addresses visible on this page. If no emails shown, leave email blank.',
      ).catch(() => []);

      for (const row of aiRows as any[]) {
        if (row.email && !confirmed.has(row.email.toLowerCase())) {
          const e = String(row.email).toLowerCase().trim();
          confirmed.add(e);
          results.push({ email: e, source: url, confidence: 'confirmed', name: row.name, title: row.title });
        }
        // Generate pattern guesses from found names
        if (row.name && !row.email) {
          const parts = String(row.name).toLowerCase().trim().split(/\s+/);
          if (parts.length >= 2) {
            const domainPart = domain.replace('www.', '');
            const guesses = [
              `${parts[0]}@${domainPart}`,
              `${parts[0]}.${parts[parts.length-1]}@${domainPart}`,
              `${parts[0][0]}${parts[parts.length-1]}@${domainPart}`,
            ];
            for (const g of guesses) {
              if (!confirmed.has(g)) {
                confirmed.add(g);
                results.push({ email: g, source: 'pattern', confidence: 'pattern', name: row.name, title: row.title });
              }
            }
          }
        }
      }
    }
  }

  // 2. Always add standard patterns
  const domainPart = domain.replace('www.', '');
  const standards = ['info', 'contact', 'hello', 'support', 'sales', 'admin', 'team', 'hi'];
  for (const prefix of standards) {
    const email = `${prefix}@${domainPart}`;
    if (!confirmed.has(email)) {
      confirmed.add(email);
      results.push({ email, source: 'standard pattern', confidence: 'pattern' });
    }
  }

  return results.slice(0, 100);
}

export async function runEmailFinderJob(jobId: string, userId: string, domain: string): Promise<void> {
  const { db } = await import('../db/index.js');
  const { harvestJobs } = await import('../db/schema.js');
  const { deductCredits } = await import('./creditsService.js');
  const { eq } = await import('drizzle-orm');

  try {
    await db.update(harvestJobs).set({ progress: 10, progressMessage: `Scanning ${domain} for email addresses…` }).where(eq(harvestJobs.id, jobId));
    const emailResults = await findDomainEmails(domain);
    await deductCredits(userId, 5).catch(() => {});
    await db.update(harvestJobs).set({
      status: 'done', progress: 100,
      progressMessage: `Found ${emailResults.length} emails for ${domain}`,
      resultData: emailResults as any,
      resultCount: emailResults.length,
      creditsUsed: 5,
      completedAt: new Date(),
    }).where(eq(harvestJobs.id, jobId));

    const { notifyJobComplete } = await import('./jobCompleteNotifier.js');
    notifyJobComplete(userId, jobId, 'email_finder', emailResults, emailResults.length).catch(() => {});

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await db.update(harvestJobs).set({ status: 'failed', errorMessage: msg, completedAt: new Date() }).where(eq(harvestJobs.id, jobId));
  }
}

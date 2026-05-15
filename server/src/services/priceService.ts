import { scrapeUrl } from './scraperService.js';
import { scrapeWithPlaywright } from './playwrightService.js';
import { extractData } from './aiService.js';
import * as cheerio from 'cheerio';

export interface PriceResult {
  url: string;
  domain: string;
  productName: string;
  price: string;
  currency: string;
  originalPrice?: string;
  discount?: string;
  availability: string;
  scrapedAt: string;
}

export async function scrapeProductPrice(url: string, selector?: string): Promise<PriceResult> {
  let scrape = await scrapeUrl(url);
  if (!scrape.success || scrape.text.length < 200) {
    scrape = await scrapeWithPlaywright(url, selector);
  }

  if (!scrape.success) throw new Error(`Failed to fetch ${url}`);

  const $ = cheerio.load(scrape.html);

  // If a CSS selector is provided, extract directly
  if (selector) {
    const el = $(selector).first();
    if (el.length) {
      return {
        url,
        domain: new URL(url).hostname.replace('www.', ''),
        productName: $('h1').first().text().trim() || $('title').text().trim(),
        price: el.text().trim(),
        currency: detectCurrency(el.text()),
        availability: 'unknown',
        scrapedAt: new Date().toISOString(),
      };
    }
  }

  // AI extraction — more reliable for diverse e-commerce sites
  const rows = await extractData(
    scrape.text,
    url,
    'Extract: product name, current price, original price (if discounted), discount percentage, availability/stock status. Return one JSON object.',
  );

  const row = (rows[0] as any) ?? {};
  return {
    url,
    domain: new URL(url).hostname.replace('www.', ''),
    productName: String(row.product_name ?? row.name ?? $('h1').first().text().trim()),
    price: String(row.current_price ?? row.price ?? 'Not found'),
    currency: detectCurrency(String(row.current_price ?? row.price ?? '')),
    originalPrice: row.original_price ? String(row.original_price) : undefined,
    discount: row.discount ? String(row.discount) : undefined,
    availability: String(row.availability ?? row.stock ?? 'unknown'),
    scrapedAt: new Date().toISOString(),
  };
}

function detectCurrency(priceStr: string): string {
  if (priceStr.includes('₦')) return 'NGN';
  if (priceStr.includes('$')) return 'USD';
  if (priceStr.includes('£')) return 'GBP';
  if (priceStr.includes('€')) return 'EUR';
  if (priceStr.includes('₹')) return 'INR';
  return 'unknown';
}

export async function runPriceCheckJob(jobId: string, userId: string, urls: string[], selector?: string): Promise<void> {
  const { db } = await import('../db/index.js');
  const { harvestJobs } = await import('../db/schema.js');
  const { deductCredits } = await import('./creditsService.js');
  const { eq } = await import('drizzle-orm');

  try {
    const results: PriceResult[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      await db.update(harvestJobs).set({
        progress: Math.floor((i / urls.length) * 90),
        progressMessage: `Checking price on ${new URL(url).hostname}…`,
      }).where(eq(harvestJobs.id, jobId));

      const result = await scrapeProductPrice(url, selector).catch(err => ({
        url, domain: new URL(url).hostname, productName: 'Error',
        price: 'Failed', currency: 'unknown', availability: 'error',
        scrapedAt: new Date().toISOString(),
        _error: err.message,
      } as PriceResult));

      results.push(result);
    }

    await deductCredits(userId, urls.length).catch(() => {});

    await db.update(harvestJobs).set({
      status: 'done', progress: 100,
      progressMessage: `Checked prices on ${results.length} product${results.length !== 1 ? 's' : ''}`,
      resultData: results as any,
      resultCount: results.length,
      creditsUsed: urls.length,
      completedAt: new Date(),
    }).where(eq(harvestJobs.id, jobId));

    const { notifyJobComplete } = await import('./jobCompleteNotifier.js');
    notifyJobComplete(userId, jobId, 'price_check', results, results.length).catch(() => {});

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await db.update(harvestJobs).set({ status: 'failed', errorMessage: msg, completedAt: new Date() }).where(eq(harvestJobs.id, jobId));
  }
}

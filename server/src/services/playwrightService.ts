import { chromium, type Browser, type BrowserContext } from 'playwright';
import { scrapeAllowed, recordScrape } from './scrapeGuard.js';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    });
  }
  return browser;
}

export interface PlaywrightScrapeResult {
  url: string;
  html: string;
  text: string;
  title: string;
  success: boolean;
  error?: string;
}

/**
 * Scrape a JS-rendered page using Playwright headless Chromium.
 * Use this for Google Maps, React apps, or any site where static fetch returns empty content.
 */
export async function scrapeWithPlaywright(
  url: string,
  waitForSelector?: string,
  timeoutMs = 30000,
): Promise<PlaywrightScrapeResult> {
  let context: BrowserContext | null = null;

  // Bandwidth guardrail: refuse once the daily scrape cap is hit, so a runaway
  // job can't blow the host's bandwidth quota.
  if (!scrapeAllowed()) {
    return { url, html: '', text: '', title: '', success: false, error: 'DAILY_SCRAPE_CAP_REACHED' };
  }

  try {
    const b = await getBrowser();
    context = await b.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
    });

    const page = await context.newPage();

    // Bandwidth saver: abort heavy resources we don't need for HTML/text
    // scraping (images, media, fonts, stylesheets). Matching by resourceType
    // catches everything regardless of extension/URL (webp, avif, CDN URLs with
    // no extension, video, etc.) — typically 70-90% of a page's transfer.
    // Scripts are kept so JS-rendered pages still hydrate.
    const BLOCKED_RESOURCE_TYPES = new Set(['image', 'media', 'font', 'stylesheet']);
    await page.route('**/*', (route) => {
      if (BLOCKED_RESOURCE_TYPES.has(route.request().resourceType())) {
        return route.abort();
      }
      return route.continue();
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    recordScrape();

    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 10000 }).catch(() => {});
    } else {
      // Wait for network to settle
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    }

    const title = await page.title().catch(() => '');
    const html = await page.content();

    // Extract visible text
    const text = await page.evaluate(() => {
      const elements = document.querySelectorAll('p, h1, h2, h3, h4, li, td, span, div');
      const texts: string[] = [];
      elements.forEach(el => {
        const t = (el as HTMLElement).innerText?.trim();
        if (t && t.length > 10) texts.push(t);
      });
      return texts.join(' ').slice(0, 50000);
    }).catch(() => '');

    return { url, html, text, title, success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { url, html: '', text: '', title: '', success: false, error: msg };
  } finally {
    await context?.close().catch(() => {});
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await browser?.close().catch(() => {});
});

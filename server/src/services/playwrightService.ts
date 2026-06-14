import { chromium, type Browser, type BrowserContext } from 'playwright';
import { scrapeAllowed, recordScrape } from './scrapeGuard.js';
import dns from 'dns/promises';
import net from 'net';

let browser: Browser | null = null;

// SSRF guard: block requests to internal / private / cloud-metadata addresses.
function isPrivateIp(ip: string): boolean {
  if (net.isIP(ip) === 4) {
    const p = ip.split('.').map(Number);
    return p[0] === 0 || p[0] === 10 || p[0] === 127
      || (p[0] === 172 && p[1] >= 16 && p[1] <= 31)
      || (p[0] === 192 && p[1] === 168)
      || (p[0] === 169 && p[1] === 254); // link-local incl. cloud metadata
  }
  const l = ip.toLowerCase();
  return l === '::1' || l === '::' || l.startsWith('fc') || l.startsWith('fd') || l.startsWith('fe80') || l.startsWith('::ffff:127.') || l.startsWith('::ffff:10.') || l.startsWith('::ffff:169.254.');
}

/** Throws if the URL is not a public http(s) address. Mitigates SSRF + DNS rebinding. */
export async function assertPublicUrl(raw: string): Promise<void> {
  let u: URL;
  try { u = new URL(raw); } catch { throw new Error('Invalid URL'); }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('Only http(s) URLs are allowed');
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal') || host === 'metadata.google.internal') {
    throw new Error('Blocked host');
  }
  let addrs: string[];
  if (net.isIP(host)) addrs = [host];
  else {
    try { addrs = (await dns.lookup(host, { all: true })).map((a) => a.address); }
    catch { throw new Error('DNS resolution failed'); }
  }
  if (addrs.length === 0 || addrs.some(isPrivateIp)) throw new Error('Blocked private/internal address');
}

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

  // SSRF guard: never let a user-supplied URL reach internal/metadata addresses.
  try {
    await assertPublicUrl(url);
  } catch (e) {
    return { url, html: '', text: '', title: '', success: false, error: 'BLOCKED_URL: ' + (e instanceof Error ? e.message : 'invalid') };
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

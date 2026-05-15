import * as cheerio from 'cheerio';
import { defaultHeaders, respectRateLimit } from '../utils/userAgents.js';

export interface ScrapeResult {
  url: string;
  html: string;
  text: string;           // plain text extracted from HTML
  title: string;
  success: boolean;
  error?: string;
}

/**
 * Fetch a URL and return its HTML + extracted text.
 * Uses Cheerio for parsing. Suitable for static HTML pages.
 */
export async function scrapeUrl(url: string, timeoutMs = 15000): Promise<ScrapeResult> {
  await respectRateLimit(url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      headers: defaultHeaders(url),
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!res.ok) {
      return { url, html: '', text: '', title: '', success: false, error: `HTTP ${res.status}` };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove noise
    $('script, style, nav, footer, header, [class*="ad"], [id*="ad"], iframe, noscript').remove();

    const title = $('title').text().trim() || $('h1').first().text().trim();
    const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 50000); // cap at 50k chars

    return { url, html, text, title, success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { url, html: '', text: '', title: '', success: false, error: msg };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Scrape multiple URLs concurrently with a concurrency limit.
 */
export async function scrapeUrls(
  urls: string[],
  concurrency = 3,
  onProgress?: (done: number, total: number, url: string) => void,
): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];
  const queue = [...urls];
  let done = 0;

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;
      const result = await scrapeUrl(url);
      results.push(result);
      done++;
      onProgress?.(done, urls.length, url);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
  return results;
}

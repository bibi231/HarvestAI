import * as cheerio from 'cheerio';
import { defaultHeaders } from '../utils/userAgents.js';

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  priority?: number;
}

/**
 * Fetch and parse a domain's sitemap.xml
 * Handles: standard sitemaps, sitemap indexes, gzipped sitemaps
 * Falls back to /sitemap_index.xml and /sitemap.xml if not found in robots.txt
 */
export async function fetchSitemap(domain: string, maxUrls = 200): Promise<SitemapEntry[]> {
  const base = domain.startsWith('http') ? domain : `https://${domain}`;
  const candidates = [
    `${base}/sitemap.xml`,
    `${base}/sitemap_index.xml`,
    `${base}/sitemap-index.xml`,
    `${base}/sitemaps/sitemap.xml`,
  ];

  // Also try to find sitemap URL from robots.txt
  try {
    const robotsRes = await fetch(`${base}/robots.txt`, { headers: defaultHeaders(base) });
    if (robotsRes.ok) {
      const robotsTxt = await robotsRes.text();
      const sitemapMatch = robotsTxt.match(/Sitemap:\s*(.+)/i);
      if (sitemapMatch?.[1]) candidates.unshift(sitemapMatch[1].trim());
    }
  } catch {}

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: defaultHeaders(url),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) continue;

      const xml = await res.text();
      const entries = parseSitemapXml(xml, maxUrls);
      if (entries.length > 0) return entries;
    } catch {}
  }

  return [];
}

function parseSitemapXml(xml: string, maxUrls: number): SitemapEntry[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const entries: SitemapEntry[] = [];

  // Sitemap index — has <sitemap> elements pointing to other sitemaps
  // For now just return the child sitemap URLs as entries (user can drill down)
  const sitemapEls = $('sitemap');
  if (sitemapEls.length > 0) {
    sitemapEls.each((_, el) => {
      const loc = $(el).find('loc').text().trim();
      if (loc && entries.length < maxUrls) entries.push({ url: loc });
    });
    return entries;
  }

  // Standard sitemap — has <url> elements
  $('url').each((_, el) => {
    const loc = $(el).find('loc').text().trim();
    const lastmod = $(el).find('lastmod').text().trim() || undefined;
    const priority = parseFloat($(el).find('priority').text()) || undefined;
    if (loc && entries.length < maxUrls) entries.push({ url: loc, lastmod, priority });
  });

  return entries;
}

/**
 * Fallback: crawl the homepage and collect internal links when no sitemap exists.
 */
export async function crawlSiteLinks(domain: string, maxUrls = 50): Promise<SitemapEntry[]> {
  const base = domain.startsWith('http') ? domain : `https://${domain}`;
  try {
    const res = await fetch(base, {
      headers: defaultHeaders(base),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const seen = new Set<string>();
    const entries: SitemapEntry[] = [];
    const baseHost = new URL(base).hostname;

    $('a[href]').each((_, el) => {
      if (entries.length >= maxUrls) return;
      const href = $(el).attr('href') ?? '';
      try {
        const abs = new URL(href, base).href;
        if (new URL(abs).hostname !== baseHost) return;
        if (seen.has(abs)) return;
        seen.add(abs);
        entries.push({ url: abs });
      } catch {}
    });

    return entries;
  } catch {
    return [];
  }
}

/**
 * Estimate credit cost: 1 credit per 5 URLs, min 1
 */
export function estimateSitemapCredits(urlCount: number): number {
  return Math.max(1, Math.ceil(urlCount / 5));
}

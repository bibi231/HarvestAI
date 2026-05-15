import { scrapeWithPlaywright } from './playwrightService.js';
import * as cheerio from 'cheerio';

export interface SerpResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  description: string;
  type: 'organic' | 'featured' | 'local' | 'image';
}

export interface SerpResponse {
  query: string;
  location: string;
  totalResults: number;
  results: SerpResult[];
  relatedSearches: string[];
  peopleAlsoAsk: string[];
}

/**
 * Scrape Google search results for a query.
 * Uses SerpApi if SERPAPI_KEY env is set, otherwise scrapes directly.
 */
export async function searchGoogle(query: string, location = '', numResults = 30): Promise<SerpResponse> {
  // Try SerpApi first (more reliable)
  if (process.env.SERPAPI_KEY) {
    return searchViaSerpApi(query, location, numResults);
  }
  // Fall back to direct scraping
  return searchViaPlaywright(query, location, numResults);
}

async function searchViaSerpApi(query: string, location: string, num: number): Promise<SerpResponse> {
  const params = new URLSearchParams({
    q: query,
    num: String(Math.min(num, 100)),
    api_key: process.env.SERPAPI_KEY!,
    ...(location ? { location } : {}),
  });

  const res = await fetch(`https://serpapi.com/search.json?${params}`);
  if (!res.ok) throw new Error(`SerpApi error: ${res.status}`);
  const data = await res.json() as any;

  const results: SerpResult[] = (data.organic_results ?? []).map((r: any, i: number) => ({
    position: i + 1,
    title: r.title ?? '',
    url: r.link ?? '',
    domain: r.displayed_link ?? '',
    description: r.snippet ?? '',
    type: 'organic' as const,
  }));

  return {
    query,
    location,
    totalResults: data.search_information?.total_results ?? 0,
    results,
    relatedSearches: (data.related_searches ?? []).map((r: any) => r.query),
    peopleAlsoAsk: (data.related_questions ?? []).map((r: any) => r.question),
  };
}

async function searchViaPlaywright(query: string, location: string, num: number): Promise<SerpResponse> {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + (location ? ` ${location}` : ''))}&num=${Math.min(num, 100)}&hl=en`;

  const scrape = await scrapeWithPlaywright(searchUrl, '[data-ved]', 12000);
  if (!scrape.success) throw new Error('Failed to scrape Google results');

  const $ = cheerio.load(scrape.html);
  const results: SerpResult[] = [];

  // Organic results — Google renders them in divs with class="g"
  $('div.g, div[data-hveid]').each((i, el) => {
    const titleEl = $(el).find('h3').first();
    const linkEl = $(el).find('a[href]').first();
    const descEl = $(el).find('[data-sncf], [style*="line-clamp"], .VwiC3b').first();

    const title = titleEl.text().trim();
    const url = linkEl.attr('href') ?? '';
    const description = descEl.text().trim();

    if (title && url.startsWith('http') && !url.includes('google.com')) {
      results.push({
        position: results.length + 1,
        title,
        url,
        domain: new URL(url).hostname.replace('www.', ''),
        description,
        type: 'organic',
      });
    }
  });

  // Related searches
  const relatedSearches: string[] = [];
  $('a[href*="search?q"]').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 10 && text.length < 100 && !relatedSearches.includes(text)) {
      relatedSearches.push(text);
    }
  });

  return { query, location, totalResults: results.length, results: results.slice(0, num), relatedSearches: relatedSearches.slice(0, 8), peopleAlsoAsk: [] };
}

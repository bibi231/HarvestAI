export type HarvestMode =
  | 'leads'
  | 'extract'
  | 'bulk_csv'
  | 'serp'
  | 'sitemap'
  | 'email_finder'
  | 'price_check'
  | 'enrich';

export type JobStatus = 'pending' | 'running' | 'done' | 'failed';

export type Currency = 'NGN' | 'USD';

// Lead Finder result row
export interface LeadRow {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  industry: string;
  source: string;
  relevanceScore: number;
}

// Data Extractor result row — dynamic keys
export interface ExtractRow {
  [key: string]: string | number | null;
}

export type ResultRow = LeadRow | ExtractRow;

export interface HarvestJob {
  id: string;
  mode: HarvestMode;
  status: JobStatus;
  progress: number;
  progressMessage: string | null;
  resultData: ResultRow[] | null;
  resultCount: number;
  creditsUsed: number;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface LeadFinderInput {
  businessType: string;
  location: string;
  sources: string[];
  maxResults: number;
}

export interface ExtractInput {
  urls: string[];
  instruction: string;
}

export interface CreditsInfo {
  freeRemaining: number;
  paidCredits: number;
  canHarvest: boolean;
  resetDate: string | null;
  currency: Currency;
}

export type PackId = 'starter' | 'pro' | 'power';

export interface CreditPack {
  id: PackId;
  name: string;
  credits: number;
  priceNGN: number;
  priceUSD: number;
  popular?: boolean;
}

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'starter', name: 'Starter', credits: 100, priceNGN: 2000, priceUSD: 5 },
  { id: 'pro', name: 'Pro', credits: 300, priceNGN: 5000, priceUSD: 12, popular: true },
  { id: 'power', name: 'Power', credits: 1000, priceNGN: 12000, priceUSD: 29 },
];

export const LEAD_SOURCES = [
  { id: 'vconnect', label: 'VConnect Nigeria', flag: '🇳🇬' },
  { id: 'businesslist', label: 'BusinessList Nigeria', flag: '🇳🇬' },
  { id: 'google_maps', label: 'Google Maps', flag: '🌍' },
  { id: 'yellowpages_ng', label: 'Yellow Pages Nigeria', flag: '🇳🇬' },
  { id: 'kompass', label: 'Kompass Global', flag: '🌍' },
];

export const MAX_RESULTS_OPTIONS = [10, 25, 50, 100];

// Scheduled job type
export interface ScheduledJob {
  id: string;
  name: string;
  mode: HarvestMode;
  inputData: Record<string, unknown>;
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  runCount: number;
  createdAt: string;
}

// SERP result type
export interface SerpResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  description: string;
  type: string;
}

// Email finder result
export interface EmailFindResult {
  email: string;
  source: string;
  confidence: 'confirmed' | 'pattern' | 'possible';
  name?: string;
  title?: string;
}

// Price result
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

// Mode metadata for UI
export const HARVEST_MODES: {
  id: HarvestMode;
  label: string;
  icon: string;
  desc: string;
  creditNote: string;
  badge?: string;
}[] = [
  { id: 'leads',        icon: '🎯', label: 'Lead Finder',     desc: 'Find businesses from directories',       creditNote: '1 credit per source' },
  { id: 'extract',      icon: '🔍', label: 'Data Extractor',  desc: 'Extract data from any URLs',             creditNote: '1 credit per URL' },
  { id: 'sitemap',      icon: '🗺️', label: 'Site Crawler',    desc: 'Crawl an entire website via sitemap',    creditNote: '1 per 5 pages',     badge: 'NEW' },
  { id: 'bulk_csv',     icon: '📁', label: 'Bulk Upload',     desc: 'Upload a CSV of URLs to extract',        creditNote: '1 credit per URL',  badge: 'NEW' },
  { id: 'serp',         icon: '🔎', label: 'Google Search',   desc: 'Harvest Google search results',          creditNote: '3 credits per query', badge: 'NEW' },
  { id: 'email_finder', icon: '📧', label: 'Email Finder',    desc: 'Find all emails for a domain',           creditNote: '5 credits per domain', badge: 'NEW' },
  { id: 'price_check',  icon: '💰', label: 'Price Monitor',   desc: 'Check product prices across sites',      creditNote: '1 credit per product', badge: 'NEW' },
  { id: 'enrich',       icon: '✨', label: 'Enrichment',      desc: 'Enrich a company list with contacts',    creditNote: '2 credits per row', badge: 'NEW' },
];

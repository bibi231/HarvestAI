export type HarvestMode = 'leads' | 'extract';

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
  source: string;         // which directory it came from
  relevanceScore: number; // 1-10 AI quality score
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
  businessType: string;    // e.g. "law firms", "restaurants"
  location: string;        // e.g. "Lagos", "Abuja", "London"
  sources: string[];       // which directories to scrape
  maxResults: number;      // 10 | 25 | 50 | 100
}

export interface ExtractInput {
  urls: string[];          // one or more URLs
  instruction: string;     // plain English: "get all product names and prices"
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

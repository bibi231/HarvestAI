// Soft daily cap on Playwright scrapes, to protect a metered / free-tier host
// from runaway bandwidth. In-memory and per-UTC-day; resets on restart, which
// is fine for a guardrail. Configure with DAILY_SCRAPE_CAP (0 = unlimited).
const DAILY_CAP = parseInt(process.env.DAILY_SCRAPE_CAP ?? '4000', 10);

let day = '';
let count = 0;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function rollIfNewDay(): void {
  const d = today();
  if (d !== day) {
    day = d;
    count = 0;
  }
}

/** True if another scrape is allowed under today's cap. */
export function scrapeAllowed(): boolean {
  if (DAILY_CAP <= 0) return true;
  rollIfNewDay();
  return count < DAILY_CAP;
}

/** Count one scrape against today's cap. */
export function recordScrape(): void {
  rollIfNewDay();
  count++;
}

export function scrapeStats() {
  rollIfNewDay();
  return { day, count, cap: DAILY_CAP, remaining: DAILY_CAP <= 0 ? Infinity : Math.max(0, DAILY_CAP - count) };
}

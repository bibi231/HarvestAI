/**
 * Parse a CSV string and extract all URLs found in any column.
 * Looks for columns named: url, urls, link, links, href, website, site, webpage
 * Falls back to finding any cell that starts with http
 */
export function extractUrlsFromCsv(csvText: string): string[] {
  const lines = csvText.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().trim());
  const urlColIndex = headers.findIndex(h =>
    ['url', 'urls', 'link', 'links', 'href', 'website', 'site', 'webpage', 'address', 'domain'].includes(h)
  );

  const urls: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    if (urlColIndex >= 0) {
      const val = cells[urlColIndex]?.trim();
      if (val && isValidUrl(val)) urls.push(normalizeUrl(val));
    } else {
      // Scan all cells for URLs
      for (const cell of cells) {
        const val = cell.trim();
        if (isValidUrl(val)) { urls.push(normalizeUrl(val)); break; }
      }
    }
  }

  return [...new Set(urls)].slice(0, 500); // deduplicate + cap
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; continue; }
    if (char === ',' && !inQuotes) { cells.push(current); current = ''; continue; }
    current += char;
  }
  cells.push(current);
  return cells;
}

function isValidUrl(str: string): boolean {
  try { new URL(str.startsWith('http') ? str : `https://${str}`); return true; } catch { return false; }
}

function normalizeUrl(str: string): string {
  return str.startsWith('http') ? str : `https://${str}`;
}

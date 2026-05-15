import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { randomUUID } from 'crypto';

// ── Types ──────────────────────────────────────────────────────────

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

export interface ExtractRow {
  [key: string]: string | number | null;
}

export class AIParseError extends Error {
  constructor(msg: string) { super(msg); this.name = 'AIParseError'; }
}

export class AIAllModelsFailedError extends Error {
  constructor(public modelErrors: string[]) {
    super('All models failed: ' + modelErrors.join(' | '));
    this.name = 'AIAllModelsFailedError';
  }
}

// ── Prompt builders ────────────────────────────────────────────────

function buildLeadExtractionPrompt(text: string, businessType: string, location: string, source: string): string {
  return `You are a business data extraction specialist. Extract business lead information from the following web page content.

Business type being searched: "${businessType}"
Location: "${location}"
Source directory: "${source}"

Web page content:
---
${text.slice(0, 15000)}
---

Extract ALL businesses you can find. For each business return:
- name: business name (string)
- email: email address or "" if not found
- phone: phone number or "" if not found  
- website: website URL or "" if not found
- address: full address or "" if not found
- industry: business category/industry
- source: "${source}"
- relevanceScore: 1-10, how well it matches "${businessType}" in "${location}"

Return ONLY a valid JSON array. No markdown. No explanation.
If no businesses found, return [].

Schema: [{"name":"","email":"","phone":"","website":"","address":"","industry":"","source":"${source}","relevanceScore":8}]`;
}

function buildDataExtractionPrompt(text: string, url: string, instruction: string): string {
  return `You are a web data extraction specialist. Extract structured data from the following web page.

URL: ${url}
Extraction instruction: "${instruction}"

Web page content:
---
${text.slice(0, 15000)}
---

Extract the data exactly as described in the instruction. Return a JSON array where each object represents one row of data. Use snake_case for field names. Keep values as strings or numbers.

Return ONLY a valid JSON array. No markdown. No explanation. No backticks.
If nothing matches the instruction, return [].

Example for "get all product names and prices":
[{"product_name":"Widget A","price":"₦4,500"},{"product_name":"Widget B","price":"₦8,000"}]`;
}

// ── Parse helper ───────────────────────────────────────────────────

function parseJsonArray(raw: string): unknown[] {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Find the first [ to last ] to extract just the array
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1) throw new AIParseError(`No JSON array found in: ${cleaned.slice(0, 200)}`);

  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(parsed)) throw new AIParseError('Not an array');
    return parsed;
  } catch (e) {
    throw new AIParseError(`JSON.parse failed: ${String(e).slice(0, 100)}`);
  }
}

// ── Model callers ──────────────────────────────────────────────────

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function callGemini(model: string, prompt: string): Promise<unknown[]> {
  const m = genAI.getGenerativeModel({
    model,
    generationConfig: { maxOutputTokens: 4096, temperature: 0.2 }, // low temp for structured extraction
  });
  const result = await m.generateContent(prompt);
  return parseJsonArray(result.response.text());
}

async function callGroq(prompt: string): Promise<unknown[]> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4096,
    temperature: 0.2,
  });
  const text = completion.choices[0]?.message?.content ?? '';
  if (!text) throw new AIParseError('Groq returned empty content');
  return parseJsonArray(text);
}

// ── Main AI extraction with fallback ──────────────────────────────

async function extractWithFallback(prompt: string): Promise<unknown[]> {
  const errors: string[] = [];
  const isDev = process.env.NODE_ENV === 'development';

  for (const model of ['gemini-2.0-flash', 'gemini-1.5-flash']) {
    try {
      const result = await callGemini(model, prompt);
      if (isDev) console.log(`[AI] ${model} ✓`);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${model}: ${msg.slice(0, 100)}`);
      if (isDev) console.warn(`[AI] ${model} ✗`, msg);
    }
  }

  if (process.env.GROQ_API_KEY) {
    try {
      const result = await callGroq(prompt);
      if (isDev) console.log('[AI] groq/llama-3.3-70b ✓ (fallback)');
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`groq: ${msg.slice(0, 100)}`);
    }
  }

  throw new AIAllModelsFailedError(errors);
}

// ── Exported functions ─────────────────────────────────────────────

export async function extractLeads(
  pageText: string,
  businessType: string,
  location: string,
  source: string,
): Promise<LeadRow[]> {
  const prompt = buildLeadExtractionPrompt(pageText, businessType, location, source);
  const raw = await extractWithFallback(prompt);
  return (raw as LeadRow[]).map(row => ({
    name: String(row.name || ''),
    email: String(row.email || ''),
    phone: String(row.phone || ''),
    website: String(row.website || ''),
    address: String(row.address || ''),
    industry: String(row.industry || ''),
    source: String(row.source || source),
    relevanceScore: Number(row.relevanceScore) || 5,
  })).filter(r => r.name.length > 0);
}

export async function extractData(
  pageText: string,
  url: string,
  instruction: string,
): Promise<ExtractRow[]> {
  const prompt = buildDataExtractionPrompt(pageText, url, instruction);
  const raw = await extractWithFallback(prompt);
  return raw as ExtractRow[];
}

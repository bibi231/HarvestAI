import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

const rawUrl = process.env.DATABASE_URL || '';
// Neon HTTP driver doesn't need libpq connection parameters and they can cause Auth/Parsing issues
const cleanUrl = rawUrl.includes('?') ? rawUrl.substring(0, rawUrl.indexOf('?')) : rawUrl;

const sql = neon(cleanUrl);
export const db = drizzle({ client: sql, schema });


import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

async function test() {
  const url = process.env.DATABASE_URL || '';
  const cleanUrl = url.includes('?') ? url.substring(0, url.indexOf('?')) : url;
  console.log('Testing connection to:', cleanUrl.replace(/:[^:@]+@/, ':****@'));
  
  try {
    const sql = neon(cleanUrl);
    const db = drizzle(sql);
    // Simple query
    const result = await sql`SELECT 1 as connected`;
    console.log('Successfully connected:', result);
    process.exit(0);
  } catch (err: any) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
}

test();

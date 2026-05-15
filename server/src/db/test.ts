import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function testConnection() {
  const rawUrl = process.env.DATABASE_URL || '';
  const cleanUrl = rawUrl.includes('?') ? rawUrl.substring(0, rawUrl.indexOf('?')) : rawUrl;
  
  console.log('Testing with clean URL. Length:', cleanUrl.length);
  
  try {
    const sql = neon(cleanUrl);
    const result = await sql`SELECT 1 as test_val`;
    console.log('Connection successful!', result);
  } catch (err: any) {
    console.error('Connection failed:');
    console.error('ErrorMessage:', err.message);
    if (err.cause) console.error('Cause:', err.cause);
  }
}

testConnection();

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

async function run() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);
  
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './src/db/migrations' });
  console.log('Migrations complete!');
  process.exit(0);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

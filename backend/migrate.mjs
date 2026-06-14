import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Client } = pg;

// Try pooler (session mode) — works for newer Supabase projects
// Set SUPABASE_DB_PASSWORD env var before running: $env:SUPABASE_DB_PASSWORD="..."
const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error('Set SUPABASE_DB_PASSWORD env var first');
  process.exit(1);
}

// Direct Supabase connection (classic format)
// (rejectUnauthorized:false needed for one-time migration script)
const client = new Client({
  host: 'db.wylzdzycmsbpfdodfklt.supabase.co',
  port: 5432,
  user: 'postgres',
  password,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log('Connected to Supabase');

  const schema = readFileSync(join(__dirname, 'database.sql'), 'utf8');
  console.log('Running schema...');
  await client.query(schema);
  console.log('Schema applied');

  const seed = readFileSync(join(__dirname, 'seed-demo-data.sql'), 'utf8');
  console.log('Running seed data...');
  await client.query(seed);
  console.log('Seed data applied');

  console.log('\nDone! You can now log in with:');
  console.log('  agent@atomberg.com    / agent123');
  console.log('  customer@atomberg.com / customer123');
  console.log('  admin@atomberg.com    / admin123');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}

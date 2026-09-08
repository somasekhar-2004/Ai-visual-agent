// Applies every .sql file in supabase/migrations, in filename order, against
// the Postgres database at DATABASE_URL (the Supabase project's connection
// string — Project Settings -> Database -> Connection string -> URI).
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(
      'DATABASE_URL is not set. Add it to .env (see .env.example) — it is the ' +
        'Postgres connection string from Supabase: Project Settings > Database > Connection string.'
    );
    process.exit(1);
  }

  const dir = path.join(__dirname, '..', 'supabase', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  if (files.length === 0) {
    console.log('No migration files found in supabase/migrations.');
    return;
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    for (const file of files) {
      console.log(`Applying ${file}...`);
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      await client.query(sql);
      console.log(`  done.`);
    }
    console.log('All migrations applied.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});

// Applies every .sql file in supabase/seed, in filename order, then seeds the
// demo user "Alex" via the Supabase Admin API (requires SUPABASE_SERVICE_ROLE_KEY).
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runSqlSeed(connectionString) {
  const dir = path.join(__dirname, '..', 'supabase', 'seed');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    for (const file of files) {
      console.log(`Seeding ${file}...`);
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      await client.query(sql);
    }
  } finally {
    await client.end();
  }
}

async function seedDemoUser() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.log(
      'Skipping demo-user seed: EXPO_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY not set.'
    );
    return;
  }

  const { createClient } = require('@supabase/supabase-js');
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const email = 'alex.demo@ieltsprep.app';
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: 'DemoPass123!',
    email_confirm: true,
    user_metadata: { full_name: 'Alex' },
  });

  let userId = created?.user?.id;
  if (createErr) {
    if (createErr.message?.includes('already been registered')) {
      const { data: list } = await admin.auth.admin.listUsers();
      userId = list?.users?.find((u) => u.email === email)?.id;
    } else {
      throw createErr;
    }
  }
  if (!userId) throw new Error('Could not resolve demo user id.');

  await admin.from('profiles').update({ full_name: 'Alex' }).eq('id', userId);

  await admin.from('user_goals').insert({
    user_id: userId,
    ielts_type: 'academic',
    current_band: 6.0,
    target_band: 7.5,
    exam_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    weakest_skill: 'writing',
    daily_study_minutes: 45,
  });

  const bandRows = [
    { skill: 'listening', band: 7.0 },
    { skill: 'reading', band: 6.5 },
    { skill: 'writing', band: 5.5 },
    { skill: 'speaking', band: 6.0 },
    { skill: 'overall', band: 6.5 },
  ].map((r) => ({ user_id: userId, source: 'mock', ...r }));
  await admin.from('band_scores').insert(bandRows);

  await admin
    .from('subscriptions')
    .upsert({ user_id: userId, plan: 'free', status: 'none' }, { onConflict: 'user_id' });

  console.log(`Demo user ready: ${email} / DemoPass123! (id: ${userId})`);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set. See .env.example.');
    process.exit(1);
  }
  await runSqlSeed(connectionString);
  await seedDemoUser();
  console.log('Seed complete.');
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

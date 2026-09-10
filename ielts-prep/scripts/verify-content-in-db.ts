// Standalone check for exactly the class of bug behind the "insert or
// update on table mock_attempts violates foreign key constraint
// mock_attempts_mock_test_id_fkey" error: the bundled TS content
// (lib/content/mockTests.ts etc.) and the live Supabase database can drift
// apart — the seed SQL only reaches the database when someone actually runs
// it there. contentIntegrity.test.ts already proves the TS content is
// internally consistent (every mock section points at a mock test that
// exists *in the TS content*); it cannot know whether that same row
// actually exists in a real deployed database, because it never connects
// to one. This script does.
//
// Usage:
//   npx tsx scripts/verify-content-in-db.ts
//
// Required in .env: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
// (the same client-safe values the app itself uses — this only needs
// public-read access to public content tables, which every anon key has
// per the "content_public_read" RLS policies in 0001_init.sql).
import path from 'node:path';

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import { content } from '../lib/content';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

let failed = false;

function report(label: string, missing: string[]) {
  if (missing.length === 0) {
    console.log(`OK   ${label}: all ${missing.length === 0 ? 'present' : ''}`.trim());
    return;
  }
  failed = true;
  console.error(`FAIL ${label}: ${missing.length} row(s) referenced by the app but missing from the live database:`);
  for (const id of missing.slice(0, 20)) console.error(`       ${id}`);
  if (missing.length > 20) console.error(`       ...and ${missing.length - 20} more`);
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY not set — nothing to check against (Demo Mode has no database).');
    console.log('Set them in .env (the same values the app uses) and re-run to check your live project.');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // mock_tests: the exact table implicated in the reported FK violation —
  // every id the UI can navigate to (via content.mockTests) must exist as
  // a real row, or starting that mock throws exactly this error.
  {
    const wantedIds = content.mockTests.map((t) => t.id);
    const { data, error } = await supabase.from('mock_tests').select('id');
    if (error) {
      failed = true;
      console.error(`FAIL mock_tests: query failed — ${error.message}`);
    } else {
      const present = new Set((data ?? []).map((r: { id: string }) => r.id));
      report('mock_tests', wantedIds.filter((id) => !present.has(id)));
    }
  }

  // mock_sections: every section a mock test flow will actually try to
  // load (lib/mockFlow.ts) must also exist, or a mock starts but a later
  // step (e.g. moving from Reading to Listening) breaks the same way.
  {
    const wantedIds = content.mockSections.map((s) => s.id);
    const { data, error } = await supabase.from('mock_sections').select('id');
    if (error) {
      failed = true;
      console.error(`FAIL mock_sections: query failed — ${error.message}`);
    } else {
      const present = new Set((data ?? []).map((r: { id: string }) => r.id));
      report('mock_sections', wantedIds.filter((id) => !present.has(id)));
    }
  }

  // listening_tracks referenced by any mock section's contentRef — the
  // same drift class, one level deeper (a mock_test/mock_sections row can
  // exist while a track it points to doesn't).
  {
    const wantedIds = Array.from(new Set(content.mockSections.flatMap((s) => s.contentRef.trackIds ?? [])));
    const { data, error } = await supabase.from('listening_tracks').select('id');
    if (error) {
      failed = true;
      console.error(`FAIL listening_tracks: query failed — ${error.message}`);
    } else {
      const present = new Set((data ?? []).map((r: { id: string }) => r.id));
      report('listening_tracks (referenced by mock sections)', wantedIds.filter((id) => !present.has(id)));
    }
  }

  if (failed) {
    console.error('\nThe live database is missing content the app references. Re-apply the seed:');
    console.error('  npm run seed:generate   # only if lib/content/*.ts changed since the seed file was last generated');
    console.error('  supabase db push        # applies migrations');
    console.error('  psql "$DATABASE_URL" -f supabase/seed/0002_generated_content.sql   # or run it via the Supabase SQL editor');
    process.exit(1);
  }
  console.log('\nEvery mock test, mock section, and referenced listening track the app can navigate to exists in the live database.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

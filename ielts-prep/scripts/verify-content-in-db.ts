// Standalone check for exactly the class of bug behind the "insert or
// update on table mock_attempts violates foreign key constraint
// mock_attempts_mock_test_id_fkey" error: the bundled TS content
// (lib/content/mockTests.ts etc.) and the live Supabase database can drift
// apart — the seed SQL only reaches the database when someone actually runs
// it there. contentIntegrity.test.ts already proves the TS content is
// internally consistent (every mock section points at a mock test that
// exists *in the TS content*); it cannot know whether that same row
// actually exists in a real deployed database, because it never connects
// to one. This script does — and prints an explicit PASS/FAIL result.
//
// Usage:
//   npx tsx scripts/verify-content-in-db.ts
//
// Required in .env: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
// (the same client-safe values the app itself uses — this only needs
// public-read access to public content tables, which every anon key has
// per the "content_public_read" RLS policies in 0001_init.sql).
//
// Optional, for the real mock_attempts creation check: SUPABASE_SERVICE_ROLE_KEY
// (never the anon key — this is a server-only secret, never shipped in the
// app, and must never be committed). Without it, this script still checks
// every id referenced by the app against the live database (the same class
// of bug), but skips the one check that requires actually inserting a row —
// clearly reported as SKIPPED, never silently treated as a pass. With it,
// the script inserts one real mock_attempts row per Academic and General
// mock (proving the FK genuinely resolves end-to-end, not just that the
// referenced ids exist), then deletes exactly that row — non-destructive,
// scoped to rows this script itself created, never touching anything else
// in the database.
import path from 'node:path';

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import { content } from '../lib/content';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

type CheckResult = 'PASS' | 'FAIL' | 'SKIPPED';
const results: { label: string; result: CheckResult; detail?: string }[] = [];

function record(label: string, result: CheckResult, detail?: string) {
  results.push({ label, result, detail });
  const prefix = result === 'PASS' ? 'PASS  ' : result === 'FAIL' ? 'FAIL  ' : 'SKIP  ';
  console.log(`${prefix}${label}${detail ? ` — ${detail}` : ''}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkIdsExist(supabase: any, label: string, table: string, wantedIds: string[]) {
  if (wantedIds.length === 0) {
    record(label, 'PASS', 'nothing to check (0 referenced ids)');
    return;
  }
  const { data, error } = await supabase.from(table).select('id');
  if (error) {
    record(label, 'FAIL', `query failed — ${error.message}`);
    return;
  }
  const present = new Set((data ?? []).map((r: any) => r.id));
  const missing = wantedIds.filter((id) => !present.has(id));
  if (missing.length === 0) {
    record(label, 'PASS', `all ${wantedIds.length} referenced id(s) exist`);
    return;
  }
  record(label, 'FAIL', `${missing.length}/${wantedIds.length} referenced id(s) missing from the live database`);
  for (const id of missing.slice(0, 20)) console.error(`         ${id}`);
  if (missing.length > 20) console.error(`         ...and ${missing.length - 20} more`);
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
  await checkIdsExist(supabase, 'mock_tests (every mock card the UI can show)', 'mock_tests', content.mockTests.map((t) => t.id));

  // mock_sections: every section a mock test flow will actually try to
  // load (lib/mockFlow.ts) must also exist, or a mock starts but a later
  // step (e.g. moving from Reading to Listening) breaks the same way.
  await checkIdsExist(supabase, 'mock_sections (every section within a mock)', 'mock_sections', content.mockSections.map((s) => s.id));

  // Every contentRef a mock section points at — one level deeper than the
  // section itself existing: the section row can exist while a passage,
  // question, listening track, writing prompt, or speaking topic it
  // actually references does not.
  const refs = content.mockSections.map((s) => s.contentRef);
  await checkIdsExist(supabase, 'listening_tracks (referenced by mock sections)', 'listening_tracks', Array.from(new Set(refs.flatMap((r) => r.trackIds ?? []))));
  await checkIdsExist(supabase, 'reading_passages (referenced by mock sections)', 'reading_passages', Array.from(new Set(refs.flatMap((r) => r.passageIds ?? []))));
  await checkIdsExist(supabase, 'writing_prompts (referenced by mock sections)', 'writing_prompts', Array.from(new Set(refs.flatMap((r) => r.writingPromptIds ?? []))));
  await checkIdsExist(supabase, 'speaking_topics (referenced by mock sections)', 'speaking_topics', Array.from(new Set(refs.flatMap((r) => r.speakingTopicIds ?? []))));
  await checkIdsExist(supabase, 'questions (referenced by mock sections)', 'questions', Array.from(new Set(refs.flatMap((r) => r.questionIds ?? []))));

  // Real mock_attempts creation — the actual insert the app performs when a
  // user taps "Start full test", for one Academic and one General mock, so
  // this proves the FK genuinely resolves end-to-end rather than just that
  // the referenced ids are individually present. Requires a service-role
  // key (bypasses RLS — anon key alone cannot insert without a real signed-
  // in user's session, which this script has no way to obtain safely).
  if (!SERVICE_ROLE_KEY) {
    record(
      'mock_attempts creation (Academic + General)',
      'SKIPPED',
      'set SUPABASE_SERVICE_ROLE_KEY (server-only secret — never the anon key, never committed) to run this check for real'
    );
  } else {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const TEST_USER_ID = '00000000-0000-0000-0000-000000000001'; // must already exist as a profiles row in the target project — see README
    for (const ieltsType of ['academic', 'general'] as const) {
      const mock = content.mockTests.find((t) => t.ieltsType === ieltsType);
      if (!mock) {
        record(`mock_attempts creation (${ieltsType})`, 'SKIPPED', `no ${ieltsType} mock test in bundled content`);
        continue;
      }
      const { data, error } = await admin.from('mock_attempts').insert({ user_id: TEST_USER_ID, mock_test_id: mock.id, status: 'in_progress' }).select('id').single();
      if (error) {
        record(`mock_attempts creation (${ieltsType}: "${mock.title}")`, 'FAIL', error.message);
        continue;
      }
      record(`mock_attempts creation (${ieltsType}: "${mock.title}")`, 'PASS', 'insert succeeded, no foreign-key violation');
      await admin.from('mock_attempts').delete().eq('id', data!.id); // clean up — this script leaves no trace
    }
  }

  const failed = results.some((r) => r.result === 'FAIL');
  console.log(`\nRESULT: ${failed ? 'FAIL' : 'PASS'} (${results.filter((r) => r.result === 'PASS').length} passed, ${results.filter((r) => r.result === 'FAIL').length} failed, ${results.filter((r) => r.result === 'SKIPPED').length} skipped)`);
  if (failed) {
    console.error('\nThe live database is missing content the app references, or a real insert failed. See "Applying the seed to your live project" in README.md.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Standalone integration check for the 5 Supabase Edge Functions in
// supabase/functions/ — run this once you have a real deployed project and
// AI credentials to confirm the whole server-side AI boundary actually
// works end-to-end, not just that it type-checks.
//
// This is deliberately NOT part of `npm test`: it needs real infrastructure
// (a deployed Supabase project, a real signed-up test account, and — for
// --full — a configured AI provider costing real API usage), none of which
// exist in a normal CI/dev checkout.
//
// Usage:
//   npx tsx scripts/verify-edge-functions.ts            # reachability + provider-configured only (free, no AI calls)
//   npx tsx scripts/verify-edge-functions.ts --full      # also sends one real request per function (costs real AI usage + counts against that day's rate limit)
//
// Required in .env:
//   EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
//   EDGE_FN_TEST_EMAIL, EDGE_FN_TEST_PASSWORD  (a real, already-signed-up account on that project)
import path from 'node:path';

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const TEST_EMAIL = process.env.EDGE_FN_TEST_EMAIL;
const TEST_PASSWORD = process.env.EDGE_FN_TEST_PASSWORD;
const FULL = process.argv.includes('--full');

type Check = { name: string; pass: boolean; detail: string };
const results: Check[] = [];

function record(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? '✅' : '❌'} ${name} — ${detail}`);
}

// Minimal, cheap-as-possible valid payloads for the --full real-call path —
// short enough to keep API cost negligible while still exercising the real
// request → provider → schema-validation → response round trip.
const FULL_PAYLOADS: Record<string, Record<string, unknown>> = {
  'evaluate-writing': {
    taskType: 'task2',
    promptText: 'Some people think universities should focus on academic subjects. Discuss both views.',
    essayText:
      'Universities serve different purposes for different students. Some argue academic subjects build critical thinking, while others believe practical skills matter more for employment. In my view, a balance between both is ideal, since graduates need both theoretical understanding and applied competence to succeed in a changing job market.',
    wordCount: 55,
    minWords: 250,
  },
  'evaluate-speaking': {
    part: 'part1',
    topicCategory: 'Hometown',
    transcript: 'My hometown is a medium-sized city. I like it because it has a lot of parks and the people are friendly.',
    questionCount: 1,
    totalDurationSeconds: 25,
  },
  'ai-coach': {
    messages: [{ role: 'user', content: 'Give me one tip to improve my IELTS Reading score.' }],
    context: {
      fullName: 'Test User',
      ieltsType: 'academic',
      targetBand: 7,
      currentBand: 6,
      examDate: null,
      weakestSkill: 'reading',
      bandBySkill: { reading: 6 },
      streakDays: 1,
      dailyStudyMinutes: 30,
    },
  },
  'study-plan-suggestion': {
    context: {
      fullName: 'Test User',
      ieltsType: 'academic',
      targetBand: 7,
      currentBand: 6,
      examDate: null,
      weakestSkill: 'reading',
      bandBySkill: { reading: 6 },
      streakDays: 1,
      dailyStudyMinutes: 30,
    },
  },
  // A ~0.1s silent WAV header — enough bytes for the function to attempt a
  // real Whisper call; a genuinely empty/silent clip is the cheapest
  // possible real audio payload to test transcription plumbing with.
  'transcribe-audio': {
    audioBase64: Buffer.from(
      'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      'base64'
    ).toString('base64'),
    mimeType: 'audio/wav',
  },
};

const FUNCTIONS = ['evaluate-writing', 'evaluate-speaking', 'ai-coach', 'transcribe-audio', 'study-plan-suggestion'] as const;

async function main() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be set in .env.');
    process.exit(1);
  }
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.error('EDGE_FN_TEST_EMAIL and EDGE_FN_TEST_PASSWORD must be set in .env — a real, already-signed-up account on this project.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

  console.log(`Signing in as ${TEST_EMAIL}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD });
  if (authError || !authData.session) {
    record('Sign in', false, authError?.message ?? 'No session returned.');
    printSummaryAndExit();
    return;
  }
  record('Sign in', true, `Authenticated as ${authData.user?.email}.`);

  console.log(`\n--- Reachability + provider-configured (${FUNCTIONS.length} functions, free/no AI usage) ---`);
  for (const fn of FUNCTIONS) {
    try {
      const { data, error } = await supabase.functions.invoke(fn, { body: { healthCheck: true } });
      if (error) {
        record(`${fn}: reachable`, false, error.message);
      } else if (!data?.ok) {
        record(`${fn}: reachable`, false, `Unexpected response: ${JSON.stringify(data)}`);
      } else {
        record(`${fn}: reachable`, true, `provider=${data.provider ?? 'none configured'}`);
      }
    } catch (err) {
      record(`${fn}: reachable`, false, (err as Error).message);
    }
  }

  if (FULL) {
    console.log(`\n--- Full real-call test (${FUNCTIONS.length} functions — costs real AI usage + counts against today's rate limit) ---`);
    for (const fn of FUNCTIONS) {
      try {
        const { data, error } = await supabase.functions.invoke(fn, { body: FULL_PAYLOADS[fn] });
        if (error) {
          const context = 'context' in error && typeof (error as { context?: { json?: () => Promise<unknown> } }).context?.json === 'function'
            ? await (error as { context: { json: () => Promise<unknown> } }).context.json().catch(() => null)
            : null;
          record(`${fn}: real call`, false, context ? JSON.stringify(context) : error.message);
        } else {
          record(`${fn}: real call`, true, `Response keys: ${Object.keys(data ?? {}).join(', ')}`);
        }
      } catch (err) {
        record(`${fn}: real call`, false, (err as Error).message);
      }
    }
  } else {
    console.log('\n(Skipping real AI calls — pass --full to also exercise each function end-to-end with a real provider request.)');
  }

  await supabase.auth.signOut();
  printSummaryAndExit();
}

function printSummaryAndExit() {
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${'='.repeat(50)}\n${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) {
    console.log('Failed checks:');
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('Verification script crashed:', err);
  process.exit(1);
});

// Unit tests for the split Practice/Mock quota architecture (checkRateLimit,
// recordUsage) and the mock-attempt ownership check (verifyMockAttemptOwnership)
// it depends on. Run with (from supabase/functions/):
//   deno test --allow-env --allow-read --node-modules-dir=none _shared/rateLimit.test.ts
//
// These exercise the real checkRateLimit/recordUsage/verifyMockAttemptOwnership
// functions against an in-memory fake Supabase client (the same style of
// dependency substitution _shared/aiProviders.test.ts uses for `fetch`) —
// not a live Postgres database — so what's proven here is the counting and
// bucket-separation LOGIC exactly as it will run against real tables, not
// Postgres/RLS behavior itself (that's covered by the actual migration:
// 0010_ai_usage_operation_split.sql only ADDs enum values/a nullable
// column, a low-risk, additive change).
import { strict as assert } from 'node:assert';

import { verifyMockAttemptOwnership } from './mockAttempt.ts';
import { checkRateLimit, recordUsage } from './rateLimit.ts';

type Row = Record<string, unknown>;

/** A minimal in-memory stand-in for the handful of query-builder chains
 * these modules actually use: .select().eq()...maybeSingle() (single-row
 * lookups), the bare-awaited .select(..., {count}).eq()...gte() form
 * (counting), and .insert(row). Good enough to run the real production
 * code against, not a general Supabase mock. Returns the backing `tables`
 * alongside the client so tests can assert on raw stored rows too (e.g.
 * "a failed attempt is still logged, just never counted"). */
function makeFakeSupabase(tables: Record<string, Row[]>) {
  function table(name: string): Row[] {
    return tables[name] ?? (tables[name] = []);
  }
  const client = {
    from(name: string) {
      const rows = table(name);
      const filters: ((r: Row) => boolean)[] = [];
      const builder: PromiseLike<{ data: Row[]; error: null; count: number }> & {
        select: (cols: string, opts?: { count?: string; head?: boolean }) => typeof builder;
        eq: (col: string, val: unknown) => typeof builder;
        gte: (col: string, val: unknown) => typeof builder;
        maybeSingle: () => Promise<{ data: Row | null; error: null }>;
        insert: (row: Row) => Promise<{ error: null }>;
      } = {
        select() {
          return builder;
        },
        eq(col, val) {
          filters.push((r) => r[col] === val);
          return builder;
        },
        gte(col, val) {
          filters.push((r) => (r[col] as string) >= (val as string));
          return builder;
        },
        async maybeSingle() {
          const match = rows.filter((r) => filters.every((f) => f(r)))[0] ?? null;
          return { data: match, error: null };
        },
        async insert(row) {
          rows.push({ id: `row-${rows.length}`, created_at: new Date().toISOString(), ...row });
          return { error: null };
        },
        then(onFulfilled) {
          const matched = rows.filter((r) => filters.every((f) => f(r)));
          return Promise.resolve({ data: matched, error: null, count: matched.length }).then(onFulfilled as never);
        },
      };
      return builder;
    },
    // deno-lint-ignore no-explicit-any
  } as any;
  return { client, tables };
}

const FREE_USER = { id: 'user-free' } as never;
const PREMIUM_USER = { id: 'user-premium' } as never;

function freshTables(): Record<string, Row[]> {
  return {
    ai_usage_log: [],
    subscriptions: [{ user_id: 'user-premium', plan: 'premium' }],
    mock_attempts: [
      { id: 'mock-attempt-1', user_id: 'user-free' },
      { id: 'mock-attempt-owned-by-someone-else', user_id: 'user-other' },
    ],
  };
}

// 1 & 2: Free Practice Speaking — 1st through 10th succeed, 11th is blocked.
Deno.test('free Speaking Practice: evaluations 1-10 are allowed, the 11th is blocked', async () => {
  const { client } = makeFakeSupabase(freshTables());
  for (let i = 1; i <= 10; i++) {
    const check = await checkRateLimit(client, FREE_USER, 'speaking_eval_practice');
    assert.equal(check.allowed, true, `attempt ${i} should be allowed`);
    await recordUsage(client, FREE_USER, 'speaking_eval_practice', 'openai', true);
  }
  const eleventh = await checkRateLimit(client, FREE_USER, 'speaking_eval_practice');
  assert.equal(eleventh.allowed, false);
  assert.equal((eleventh as { used: number }).used, 10);
});

// 3 & 4: After Practice is exhausted, Full Mock Speaking still succeeds, and
// using it does not touch the Practice count.
Deno.test('Full Mock Speaking still succeeds after Practice reaches 10/10, and does not reduce Practice allowance', async () => {
  const { client } = makeFakeSupabase(freshTables());
  for (let i = 0; i < 10; i++) await recordUsage(client, FREE_USER, 'speaking_eval_practice', 'openai', true);
  assert.equal((await checkRateLimit(client, FREE_USER, 'speaking_eval_practice')).allowed, false);

  const mockCheck = await checkRateLimit(client, FREE_USER, 'speaking_eval_mock');
  assert.equal(mockCheck.allowed, true, 'Full Mock must not be blocked by an exhausted Practice bucket');
  await recordUsage(client, FREE_USER, 'speaking_eval_mock', 'openai', true);

  // Practice is still exactly what it was — the Mock usage above never touched it.
  const practiceAfterMock = await checkRateLimit(client, FREE_USER, 'speaking_eval_practice');
  assert.equal(practiceAfterMock.allowed, false);
  assert.equal((practiceAfterMock as { used: number }).used, 10);
});

// 5: The reverse direction — Practice usage does not reduce Full Mock allowance.
Deno.test('Practice usage does not reduce the separate Full Mock allowance', async () => {
  const { client } = makeFakeSupabase(freshTables());
  for (let i = 0; i < 10; i++) await recordUsage(client, FREE_USER, 'speaking_eval_practice', 'openai', true);

  const mockCheck = await checkRateLimit(client, FREE_USER, 'speaking_eval_mock');
  assert.equal(mockCheck.allowed, true);
  assert.equal((mockCheck as { used?: number }).used ?? 0, 0);
});

// 6: Failed/insufficient attempts must never consume a bucket — only a
// genuinely successful evaluation counts. The failed attempts are still
// logged (audit trail), just never counted against the daily limit.
Deno.test('failed evaluations (network error, invalid AI output, etc.) consume no quota at all', async () => {
  const { client, tables } = makeFakeSupabase(freshTables());
  for (let i = 0; i < 15; i++) await recordUsage(client, FREE_USER, 'speaking_eval_practice', 'openai', false);

  const check = await checkRateLimit(client, FREE_USER, 'speaking_eval_practice');
  assert.equal(check.allowed, true, 'every attempt failed, so nothing should count against the daily limit');
  assert.equal(tables.ai_usage_log.length, 15, 'the 15 failed attempts are still logged for audit purposes');
});

// 7 & 8: Premium is not blocked by the Free ceiling, for both Practice and Mock.
Deno.test('a legitimate Premium user is never blocked by the Free daily limits, for both Practice and Full Mock', async () => {
  const { client } = makeFakeSupabase(freshTables());
  for (let i = 0; i < 15; i++) await recordUsage(client, PREMIUM_USER, 'speaking_eval_practice', 'openai', true);
  const practice = await checkRateLimit(client, PREMIUM_USER, 'speaking_eval_practice');
  assert.equal(practice.allowed, true, "Premium Practice: 15 > Free's 10, but Premium is not blocked");

  for (let i = 0; i < 15; i++) await recordUsage(client, PREMIUM_USER, 'speaking_eval_mock', 'openai', true);
  const mock = await checkRateLimit(client, PREMIUM_USER, 'speaking_eval_mock');
  assert.equal(mock.allowed, true, "Premium Mock: 15 > Free's 5, but Premium is not blocked");
});

// 9: Multiple transcription calls (one per Speaking turn) never touch the
// speaking_eval_* buckets — transcription is a fully separate operation.
Deno.test('multiple transcription calls in one Speaking session never consume an evaluation quota', async () => {
  const { client } = makeFakeSupabase(freshTables());
  for (let i = 0; i < 6; i++) await recordUsage(client, FREE_USER, 'transcription', 'openai', true); // e.g. Part 1/2/3, several questions each
  const practice = await checkRateLimit(client, FREE_USER, 'speaking_eval_practice');
  const mock = await checkRateLimit(client, FREE_USER, 'speaking_eval_mock');
  assert.equal(practice.allowed, true);
  assert.equal(mock.allowed, true);
  assert.equal((practice as { used?: number }).used ?? 0, 0);
  assert.equal((mock as { used?: number }).used ?? 0, 0);
});

// 10: Writing gets the exact same Practice/Mock separation as Speaking.
Deno.test('Writing Practice and Writing Full Mock are independent buckets, same as Speaking', async () => {
  const { client } = makeFakeSupabase(freshTables());
  for (let i = 0; i < 10; i++) await recordUsage(client, FREE_USER, 'writing_eval_practice', 'openai', true);
  assert.equal((await checkRateLimit(client, FREE_USER, 'writing_eval_practice')).allowed, false);

  const mockCheck = await checkRateLimit(client, FREE_USER, 'writing_eval_mock');
  assert.equal(mockCheck.allowed, true, 'Writing Full Mock must not be blocked by exhausted Writing Practice');
});

// 11: The mock context itself is verified server-side and cannot be spoofed
// — a claimed mockAttemptId only counts if it resolves to a real row owned
// by this exact authenticated user.
Deno.test('verifyMockAttemptOwnership: true only for a real attempt owned by this user; false for a forged/foreign id', async () => {
  const { client } = makeFakeSupabase(freshTables());

  const ownAttempt = await verifyMockAttemptOwnership(client, FREE_USER, 'mock-attempt-1');
  assert.equal(ownAttempt, true);

  const forgedId = await verifyMockAttemptOwnership(client, FREE_USER, 'does-not-exist');
  assert.equal(forgedId, false);

  // The id is real, but it belongs to a different user — a client cannot
  // spoof Mock status by reusing someone else's real mock_attempts id.
  const foreignAttempt = await verifyMockAttemptOwnership(client, FREE_USER, 'mock-attempt-owned-by-someone-else');
  assert.equal(foreignAttempt, false);
});

// RECOVERY NOTE (added 2026-11-06, Bandpath recovery session): this file was
// missing from this git branch entirely. Recovered verbatim from the live
// "Bandpath IELTS" project (kudgtxdwbpfqobteyeqy) — extracted from the
// deployed evaluate-writing Edge Function's own eszip bundle (its embedded
// source map's sourcesContent) via the Supabase Management API (read-only
// token). See __tests__/aiOperationDecision.test.ts (added in this same
// recovery session) for Jest coverage of the branches below.
//
// Deliberately framework/runtime-agnostic — no Deno.*, no Supabase client,
// no imports at all. This is the ONE piece of the AI-call idempotency
// mechanism (see aiOperations.ts, which wraps this with real Supabase
// queries) that can actually be unit-tested from the mobile app's own
// Jest/Node setup: every other file under supabase/functions/ references
// Deno globals at module-eval time, which throws immediately if Jest ever
// tries to load it (confirmed; see aiProviders.test.ts's own note on why
// Jest never collects this whole directory as test files, and
// jest.config.js's testPathIgnorePatterns). Keeping the actual DECISION
// branching here, pure, is what makes __tests__/aiOperationDecision.test.ts
// possible — the Deno-side wrapper then has as little untested logic left
// in it as possible.

export type AiOperationRow = {
  status: 'pending' | 'completed' | 'failed';
  result: unknown;
  provider: string | null;
  updated_at: string;
};

export type AiOperationDecision =
  | { action: 'proceed' } // no prior row, or a stale/failed one being reclaimed — caller should call the AI provider
  | { action: 'return_cached'; result: unknown; provider: string } // already finished successfully — never call the provider again
  | { action: 'in_progress' }; // a genuinely recent attempt may still be running elsewhere — do NOT start a second provider call

/** How stale a 'pending' row has to be before it's treated as abandoned
 * (the Edge Function that claimed it almost certainly crashed, got killed
 * by the platform's wall-clock limit, or the process otherwise never
 * reached its own update-to-completed/failed step) rather than genuinely
 * still in flight. Set comfortably ABOVE every one of this app's Edge
 * Functions' own worst-case legitimate duration (the largest is
 * transcription's ~120.6s after its retry budget was tightened — see
 * aiProviders.ts) and also above Supabase's platform-wide 150s wall-clock
 * request-idle ceiling (every plan; see
 * https://supabase.com/docs/guides/troubleshooting/edge-function-wall-clock-time-limit-reached-Nk38bW) —
 * so a row can only ever be reclaimed after BOTH this app's own logic and
 * the hosting platform itself would already have given up on it. */
export const STALE_PENDING_THRESHOLD_MS = 180_000; // 180s > both 120.6s (this app) and 150s (platform)

/** Given the EXISTING row for a (user, operationId) pair that a claim
 * attempt just conflicted on (see aiOperations.ts's claimOperation), and
 * the current time, decides what the caller should do next. Pure: no I/O,
 * so every branch is directly testable without a database or a Deno
 * runtime. */
export function decideFromExistingRow(row: AiOperationRow, nowMs: number): AiOperationDecision {
  if (row.status === 'completed') {
    // provider is always set alongside a completed result by
    // recordOperationResult — the `?? 'unknown'` fallback only guards
    // against a row some future, different write path left incomplete;
    // it must never be the reason a genuinely cached result is withheld.
    return { action: 'return_cached', result: row.result, provider: row.provider ?? 'unknown' };
  }
  if (row.status === 'failed') {
    // A prior attempt for this EXACT operation id definitively finished
    // (unsuccessfully) — safe to let a legitimate retry reclaim the same
    // id and try the provider again, rather than needing a fresh one.
    return { action: 'proceed' };
  }
  // status === 'pending'
  const ageMs = nowMs - new Date(row.updated_at).getTime();
  if (ageMs > STALE_PENDING_THRESHOLD_MS) {
    // Old enough that whatever claimed this is certainly not still
    // legitimately running — treat exactly like a 'failed' row.
    return { action: 'proceed' };
  }
  // Recent enough that another request for this SAME operation id could
  // genuinely still be in flight right now — must NOT start a second,
  // concurrent provider call (the exact duplicate-billing scenario this
  // mechanism exists to prevent). The caller surfaces this as a distinct,
  // retryable "already in progress" response, not a generic failure.
  return { action: 'in_progress' };
}

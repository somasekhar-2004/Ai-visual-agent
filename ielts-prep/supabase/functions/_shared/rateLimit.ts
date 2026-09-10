import type { SupabaseClient, User } from 'npm:@supabase/supabase-js@2';

// Practice and Full Mock evaluations are deliberately separate operations,
// each with its own daily counter — never one shared bucket. Before this,
// 'writing_eval'/'speaking_eval' counted every attempt (Practice AND Mock)
// against the exact same cap, so using up the day's Practice evaluations
// could reject a Full Mock evaluation mid-attempt with "Daily Speaking
// evaluation limit reached" — a real bug, not an intended shared limit. See
// supabase/functions/_shared/mockAttempt.ts for how a request is verified
// to genuinely belong to a real mock attempt before it is ever counted
// against the "_mock" bucket rather than "_practice".
export type AiOperation =
  | 'writing_eval_practice'
  | 'writing_eval_mock'
  | 'speaking_eval_practice'
  | 'speaking_eval_mock'
  | 'ai_coach'
  | 'transcription'
  | 'study_plan_suggestion';

// Real, server-enforced daily caps — the client-side numbers in
// lib/entitlements.ts are UX-only (they hide the button before the user
// wastes a request) and are NOT a security boundary, since a modified
// client could skip them entirely. These are the actual limits.
//
// Practice limits (10/day free) are the marketed, meaningfully-restrictive
// product limit. Mock limits are a separate, deliberately generous safety
// net — not a marketed limit — sized so a free student can complete and
// retake several full mocks in a day without ever hitting it in normal use
// (one full mock = 1 speaking_eval_mock + 2 writing_eval_mock, for Task 1
// and Task 2): 5/day covers 5 full mocks' worth of Speaking, 10/day covers
// the matching 5 mocks' worth of Writing, so neither wall is hit before the
// other for the same number of attempts.
const FREE_DAILY_LIMITS: Record<AiOperation, number> = {
  writing_eval_practice: 10,
  writing_eval_mock: 10,
  speaking_eval_practice: 10,
  speaking_eval_mock: 5,
  ai_coach: 5,
  // One speaking test has several turns (Part 1/2/3 questions), each
  // transcribed separately, so this needs headroom beyond a single day's
  // worth of speaking_eval_practice + speaking_eval_mock combined.
  transcription: 15,
  study_plan_suggestion: 3,
};
// Premium is "effectively unlimited for legitimate use" — these are a fair-
// use abuse ceiling, not a number any real student is expected to reach.
const PREMIUM_DAILY_LIMITS: Record<AiOperation, number> = {
  writing_eval_practice: 200,
  writing_eval_mock: 200,
  speaking_eval_practice: 200,
  speaking_eval_mock: 200,
  ai_coach: 100,
  transcription: 300,
  study_plan_suggestion: 20,
};

async function isPremium(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase.from('subscriptions').select('plan').eq('user_id', userId).maybeSingle();
  // Mirrors the client's own rule (store/useAppStore.ts: `plan !== 'free'`)
  // so server enforcement and client UI never disagree about who is Premium.
  return Boolean(data && data.plan !== 'free');
}

export type RateLimitResult = { allowed: true; limit: number } | { allowed: false; limit: number; used: number };

/** Counts today's genuinely SUCCESSFUL rows for this user+operation and
 * compares against the plan's daily cap. Must be called after auth and
 * before the paid provider call; `recordUsage` below then logs the outcome
 * so the count is accurate for the next call.
 *
 * Deliberately counts only `success = true` rows: a transcription failure,
 * a network/provider error, an evaluator returning output that fails
 * schema validation, or any other failed attempt must never consume a
 * unit of the user's daily allowance — they got nothing usable for it. An
 * earlier version counted every attempt regardless of outcome, which meant
 * a string of provider hiccups could exhaust a free user's entire daily
 * quota without ever producing one real evaluation. */
export async function checkRateLimit(supabase: SupabaseClient, user: User, operation: AiOperation): Promise<RateLimitResult> {
  const premium = await isPremium(supabase, user.id);
  const limit = (premium ? PREMIUM_DAILY_LIMITS : FREE_DAILY_LIMITS)[operation];

  const startOfDayUtc = new Date();
  startOfDayUtc.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('ai_usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('operation', operation)
    .eq('success', true)
    .gte('created_at', startOfDayUtc.toISOString());

  const used = count ?? 0;
  if (used >= limit) return { allowed: false, limit, used };
  return { allowed: true, limit };
}

/** Logs one attempt (successful or not) at a paid AI operation — both an
 * abuse/cost audit trail and the source of truth `checkRateLimit` counts
 * against (filtered to `success = true` there — see its own comment).
 * Never throws: a logging failure must not break the user-facing response,
 * so callers fire this without awaiting it in the critical path when
 * convenient (errors are only console.error'd).
 *
 * `mockAttemptId` is only ever a value verifyMockAttemptOwnership has
 * already confirmed belongs to this user — never an unverified
 * client-supplied id — so a populated column here is itself part of the
 * audit trail proving the "_mock" operation was genuine. */
export async function recordUsage(
  supabase: SupabaseClient,
  user: User,
  operation: AiOperation,
  provider: string,
  success: boolean,
  mockAttemptId: string | null = null
): Promise<void> {
  const { error } = await supabase.from('ai_usage_log').insert({ user_id: user.id, operation, provider, success, mock_attempt_id: mockAttemptId });
  if (error) console.error(`[ai_usage_log] failed to record usage for ${operation}:`, error.message);
}

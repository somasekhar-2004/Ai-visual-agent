import type { SupabaseClient, User } from 'npm:@supabase/supabase-js@2';

export type AiOperation = 'writing_eval' | 'speaking_eval' | 'ai_coach' | 'transcription' | 'study_plan_suggestion';

// Real, server-enforced daily caps — the client-side numbers in
// lib/entitlements.ts are UX-only (they hide the button before the user
// wastes a request) and are NOT a security boundary, since a modified
// client could skip them entirely. These are the actual limits. Free-tier
// values are kept in sync with lib/entitlements.ts; premium values are a
// generous abuse-prevention ceiling, not a marketed product limit.
const FREE_DAILY_LIMITS: Record<AiOperation, number> = {
  writing_eval: 1,
  speaking_eval: 1,
  ai_coach: 5,
  // One speaking test has several turns (Part 1/2/3 questions), each
  // transcribed separately, so this needs headroom beyond speaking_eval's 1.
  transcription: 15,
  study_plan_suggestion: 3,
};
const PREMIUM_DAILY_LIMITS: Record<AiOperation, number> = {
  writing_eval: 20,
  speaking_eval: 20,
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

/** Counts today's successful+attempted rows for this user+operation and
 * compares against the plan's daily cap. Must be called after auth and
 * before the paid provider call; `recordUsage` below then logs this
 * attempt so the count is accurate for the next call. */
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
    .gte('created_at', startOfDayUtc.toISOString());

  const used = count ?? 0;
  if (used >= limit) return { allowed: false, limit, used };
  return { allowed: true, limit };
}

/** Logs one attempt (successful or not) at a paid AI operation — both an
 * abuse/cost audit trail and the source of truth `checkRateLimit` counts
 * against. Never throws: a logging failure must not break the user-facing
 * response, so callers fire this without awaiting it in the critical path
 * when convenient (errors are only console.error'd). */
export async function recordUsage(
  supabase: SupabaseClient,
  user: User,
  operation: AiOperation,
  provider: string,
  success: boolean
): Promise<void> {
  const { error } = await supabase.from('ai_usage_log').insert({ user_id: user.id, operation, provider, success });
  if (error) console.error(`[ai_usage_log] failed to record usage for ${operation}:`, error.message);
}

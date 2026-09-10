// Fetches THIS authenticated request's real profile/goal/band-score/
// practice-history data directly from Postgres — scoped to the caller's own
// rows by RLS, since `supabase` here was built with the caller's own JWT
// (see clientForRequest in supabaseClient.ts) — and returns the
// authoritative CoachContext fields for it.
//
// Why this exists: a real production incident had the AI Coach greet a
// student by an unrelated name and confidently state "Band 7" for an
// account whose real saved target was 7.5. The name turned out to be a
// genuine (if surprising) value already sitting in that account's
// `profiles.full_name` row, but the wrong target band was a real client bug
// — app/ai-coach.tsx built its request context straight from Zustand store
// state with a hardcoded `?? 7` fallback, and sent it with no guarantee the
// store had even finished its initial load yet. Trusting whatever the
// client's local state happens to contain at send time is fragile by
// construction: a slow load, a stale cache, or a client bug can all put a
// wrong number in front of the model, and nothing server-side would ever
// know to distrust it.
//
// Fetching by `user.id` (verified by requireUser from the request's own
// JWT, never anything the request body claims) closes that whole class of
// bug for the fields that matter most, and as a side effect means a client
// can never spoof another user's stats into a prompt either.
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import type { CoachContext } from './schemas.ts';

export async function fetchAuthoritativeCoachContext(supabase: SupabaseClient, userId: string, clientContext: CoachContext): Promise<CoachContext> {
  const [profileRes, activeGoalRes, anyGoalRes, bandRes, attemptsRes] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle(),
    supabase.from('user_goals').select('*').eq('user_id', userId).eq('is_active', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('user_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('band_scores').select('skill, band').eq('user_id', userId).order('recorded_at', { ascending: true }),
    supabase.from('question_attempts').select('is_correct').eq('user_id', userId),
  ]);

  // A real query error here (permission/connection/etc.) must never be
  // read as "this student has no data" — that would silently hand the
  // model an all-empty context (no name, no goal, no bands) that looks
  // exactly like a genuinely brand-new account, the same class of mistake
  // this whole file exists to prevent. Throw instead — the caller's
  // existing try/catch turns this into a real 502 upstream_error, same as
  // any other provider failure, never a fabricated-looking empty profile.
  for (const [label, res] of [
    ['profiles', profileRes],
    ['user_goals (active)', activeGoalRes],
    ['user_goals (most recent)', anyGoalRes],
    ['band_scores', bandRes],
    ['question_attempts', attemptsRes],
  ] as const) {
    if (res.error) throw new Error(`Failed to load ${label} for the coach's context: ${res.error.message}`);
  }

  // Mirrors getActiveGoal's client-side self-heal read (services/repository/
  // core.ts): if no row is marked active, fall back to the most recent goal
  // row rather than reporting "no goal" for an account that has one, just
  // not flagged active. Read-only here — this function never writes, unlike
  // the client version, which also reactivates the row.
  const goal = activeGoalRes.data ?? anyGoalRes.data ?? null;

  const bandBySkill: Record<string, number> = {};
  for (const row of bandRes.data ?? []) {
    if (row.skill && row.band != null) bandBySkill[row.skill as string] = Number(row.band);
  }

  const attempts = attemptsRes.data ?? [];
  const questionsCompleted = attempts.length;
  const overallAccuracy = questionsCompleted > 0 ? attempts.filter((a: { is_correct: boolean }) => a.is_correct).length / questionsCompleted : null;

  return {
    fullName: profileRes.data?.full_name ?? null,
    ieltsType: goal?.ielts_type ?? 'academic',
    targetBand: goal?.target_band != null ? Number(goal.target_band) : null,
    currentBand: bandBySkill.overall ?? null,
    examDate: goal?.exam_date ?? null,
    weakestSkill: goal?.weakest_skill ?? null,
    bandBySkill,
    // No authoritative source for this yet: real Supabase mode has no
    // streak-tracking table at all (services/repository/core.ts's
    // getStreak() returns a hardcoded 0 for every real account today), so
    // there is nothing in the database to fetch and override with — keep
    // whatever the client sent rather than inventing a number. Honest today
    // because that client value is itself always 0 in real mode.
    streakDays: clientContext.streakDays,
    dailyStudyMinutes: goal?.daily_study_minutes ?? clientContext.dailyStudyMinutes,
    overallAccuracy,
    questionsCompleted,
  };
}

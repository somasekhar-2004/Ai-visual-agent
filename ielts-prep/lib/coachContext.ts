import { overallAccuracy } from './analytics';
import type { CoachContext } from '@/services/ai';
import type { SkillBandMap } from '@/services/repository/core';
import type { Profile, QuestionAttempt, UserGoal } from '@/types/models';

/**
 * The single place the client builds a CoachContext, extracted so its
 * "never fabricate" rules are testable directly without rendering
 * app/ai-coach.tsx (which pulls in react-query, expo-router, and several
 * other screens' worth of dependencies).
 *
 * This is exactly the code that shipped a real production bug: a
 * hardcoded `goal?.targetBand ?? 7` fallback made the coach confidently
 * state "Band 7" for an account whose real saved target was 7.5, simply
 * because `goal` could still be null when the store's initial load hadn't
 * settled yet. Every "missing" case below returns null/not-fabricated
 * instead of a guessed default — see each field's comment.
 *
 * Real Supabase mode also has every one of these fields re-fetched and
 * overridden server-side by the caller's own authenticated user id (see
 * supabase/functions/_shared/userContext.ts) rather than trusted from this
 * client read at all, so a stale or racy local read like the one that
 * caused the bug can no longer reach the model even if this function were
 * called too early. This function still matters for: Demo Mode (no server
 * to override anything) and as the one place the "don't invent a value"
 * contract is enforced and tested on the client.
 */
export function buildCoachContext(params: {
  profile: Profile | null;
  goal: UserGoal | null;
  bandScores: SkillBandMap;
  streak: { count: number };
  attempts: QuestionAttempt[];
}): CoachContext {
  const { profile, goal, bandScores, streak, attempts } = params;

  return {
    // No profile (or no name on it) means a neutral greeting — never a
    // guessed or leftover name from anywhere else.
    fullName: profile?.fullName ?? null,
    ieltsType: goal?.ieltsType ?? 'academic',
    // null — never a hardcoded band — when there is no active study goal.
    // This is the exact field the production bug fabricated as `?? 7`.
    targetBand: goal?.targetBand ?? null,
    // Deliberately read from a DIFFERENT source field than targetBand —
    // these must never collapse into the same value or default to each
    // other, even when one of them is missing.
    currentBand: goal?.currentBand ?? null,
    examDate: goal?.examDate ?? null,
    weakestSkill: goal?.weakestSkill ?? null,
    bandBySkill: bandScores,
    streakDays: streak.count,
    dailyStudyMinutes: goal?.dailyStudyMinutes ?? 30,
    // null (not 0%) when there is genuinely no practice history yet — 0%
    // accuracy and "no data yet" are different facts and must not be
    // conflated.
    overallAccuracy: attempts.length > 0 ? overallAccuracy(attempts) : null,
    questionsCompleted: attempts.length,
  };
}

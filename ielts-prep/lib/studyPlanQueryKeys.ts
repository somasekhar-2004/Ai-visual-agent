/**
 * Regression fix for the reported bug: Home's Target Progress correctly
 * showed the user's just-edited target band, but Today's Study Plan kept
 * saying "Since you are aiming for a Band 7 with 30 minutes a day..." — an
 * AI-generated note from `services/ai`'s suggestStudyPlanFocus, cached by
 * React Query under app/(tabs)/index.tsx's `focusQuery`.
 *
 * Root cause: that query's key only varied by (userId, date) — never by the
 * goal's actual content — so editing a goal via app/profile-edit.tsx (which
 * calls saveOnboardingGoal, the same function onboarding uses) never
 * produced a new cache entry, and the stale AI note kept being served for
 * the rest of that calendar day.
 *
 * Fix: include the goal's `updatedAt` in the key — NOT `id`. Since
 * migration 0013 (uq_user_goals_one_active_per_user), saveOnboardingGoal
 * upserts a single current goal row in place rather than inserting a new
 * row per edit (see services/repository/core.ts), so `goal.id` now stays
 * constant across edits — it would no longer bust this cache at all.
 * `updated_at` is bumped by a DB trigger on every UPDATE, so it changes on
 * every genuine edit and is the correct signal here. This requires no
 * explicit `queryClient.invalidateQueries()` call to stay correct
 * (profile-edit.tsx still invalidates explicitly too, as a belt-and-braces
 * measure for anything reading these keys before the new goal.updatedAt has
 * propagated through the store).
 */
export function studyPlanFocusQueryKey(
  userId: string | null,
  goalUpdatedAt: string | null | undefined,
  date: string
): (string | null | undefined)[] {
  return ['study-plan-focus', userId, goalUpdatedAt, date];
}

export function studyPlanQueryKey(
  userId: string | null,
  goalUpdatedAt: string | null | undefined,
  date: string
): (string | null | undefined)[] {
  return ['study-plan', userId, goalUpdatedAt, date];
}

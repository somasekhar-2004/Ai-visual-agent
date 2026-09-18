/**
 * Regression fix for the reported bug: Home's Target Progress correctly
 * showed the user's just-edited target band (8.0), but Today's Study Plan
 * kept saying "Since you are aiming for a Band 7 with 30 minutes a day..."
 * — an AI-generated note from `services/ai`'s suggestStudyPlanFocus, cached
 * by React Query under app/(tabs)/index.tsx's `focusQuery`.
 *
 * Root cause: that query's key only varied by (userId, date) — never by the
 * goal's actual content — so editing a goal via app/profile-edit.tsx (which
 * calls saveOnboardingGoal, the same function onboarding uses) never
 * produced a new cache entry, and the stale AI note from the ORIGINAL
 * onboarding goal kept being served for the rest of that calendar day.
 *
 * Fix: include the goal's id in the key. saveOnboardingGoal always INSERTS
 * a brand-new goal row (see services/repository/core.ts) rather than
 * updating the existing one in place, so a goal edit always produces a new
 * `goal.id` — making it a reliable, zero-maintenance cache-busting signal
 * that requires no explicit `queryClient.invalidateQueries()` call to stay
 * correct (profile-edit.tsx still invalidates explicitly too, as a
 * belt-and-braces measure for anything reading these keys before the new
 * goal.id has propagated through the store).
 */
export function studyPlanFocusQueryKey(userId: string | null, goalId: string | null | undefined, date: string): (string | null | undefined)[] {
  return ['study-plan-focus', userId, goalId, date];
}

export function studyPlanQueryKey(userId: string | null, goalId: string | null | undefined, date: string): (string | null | undefined)[] {
  return ['study-plan', userId, goalId, date];
}

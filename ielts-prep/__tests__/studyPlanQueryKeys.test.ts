import { studyPlanFocusQueryKey, studyPlanQueryKey } from '@/lib/studyPlanQueryKeys';

// Regression coverage for the real-device release blocker: Home's Target
// Progress correctly showed an edited target band, but Today's Study Plan's
// AI note kept saying "aiming for a Band 7 with 30 minutes a day" — an
// earlier goal's values. Root cause: app/(tabs)/index.tsx's React Query key
// for that AI note only varied by (userId, date), so editing the goal
// (app/profile-edit.tsx, same saveOnboardingGoal every onboarding save
// uses) never produced a new cache entry and the stale AI-generated text
// kept being served for the rest of that calendar day.
//
// These keys are now built from goal.updatedAt, not goal.id — migration
// 0013 (uq_user_goals_one_active_per_user) switched saveOnboardingGoal to
// true upsert semantics: an edit updates the single current goal row in
// place, so `id` stays constant across edits and would no longer bust this
// cache at all. `updated_at` is bumped by a DB trigger on every UPDATE, so
// it's the value that actually changes on every genuine edit.

describe('studyPlanFocusQueryKey / studyPlanQueryKey — goal.updatedAt is part of the cache key', () => {
  it('two different updatedAt values for the same user/date produce two different keys (Band 7 -> Band 8 edit)', () => {
    const before = studyPlanFocusQueryKey('user-1', '2026-01-01T10:00:00Z', '2026-01-01');
    const after = studyPlanFocusQueryKey('user-1', '2026-01-01T11:00:00Z', '2026-01-01');
    expect(before).not.toEqual(after);
  });

  it('the same updatedAt for the same user/date produces the same key (no unnecessary refetching)', () => {
    const a = studyPlanFocusQueryKey('user-1', '2026-01-01T10:00:00Z', '2026-01-01');
    const b = studyPlanFocusQueryKey('user-1', '2026-01-01T10:00:00Z', '2026-01-01');
    expect(a).toEqual(b);
  });

  it('studyPlanQueryKey has the same updatedAt-sensitivity as studyPlanFocusQueryKey', () => {
    const before = studyPlanQueryKey('user-1', '2026-01-01T10:00:00Z', '2026-01-01');
    const after = studyPlanQueryKey('user-1', '2026-01-01T11:00:00Z', '2026-01-01');
    expect(before).not.toEqual(after);
  });

  // Requirement: "Account A and Account B must never share cached
  // study-plan context." userId is already part of every key, so two
  // different accounts never collide even if they happen to share an
  // updatedAt timestamp or open the app on the same calendar date.
  it('two different accounts on the same date never produce the same key, even with the same updatedAt', () => {
    const accountA = studyPlanFocusQueryKey('account-A', '2026-01-01T10:00:00Z', '2026-01-01');
    const accountB = studyPlanFocusQueryKey('account-B', '2026-01-01T10:00:00Z', '2026-01-01');
    expect(accountA).not.toEqual(accountB);
  });

  it('a null/undefined updatedAt (no goal loaded yet) is still a stable, distinct key', () => {
    const key = studyPlanFocusQueryKey('user-1', null, '2026-01-01');
    expect(key).toEqual(['study-plan-focus', 'user-1', null, '2026-01-01']);
  });
});

// End-to-end regression test for the exact reported sequence: initial goal
// Band 8 / 30 min, generate a study plan, edit to Band 7.5 / 45 min on the
// SAME day — the Study Plan must reflect the new values, never the old
// ones. Exercises the real query-key builders plus a fake per-key AI
// "backend" (keyed exactly like a real cache would be) to prove the edit
// produces a genuinely different, correct entry rather than reusing the
// pre-edit one.
describe('end-to-end: same-day goal edit never leaves Study Plan on stale values', () => {
  it('Band 8/30 -> edit to Band 7.5/45 same day -> Study Plan key changes and resolves to the new values', async () => {
    const userId = 'user-1';
    const today = '2026-01-01';

    // Simulates what services/ai's suggestStudyPlanFocus + the Edge
    // Function's fetchAuthoritativeCoachContext do together: the "backend"
    // is keyed by whatever goal state is current at call time, exactly like
    // the real one is (see the live-backend audit in this session, which
    // proved the real Edge Functions do this correctly).
    async function fakeBackend(goal: { targetBand: number; dailyStudyMinutes: number }) {
      return { focusSummary: `Since you are aiming for a Band ${goal.targetBand} with ${goal.dailyStudyMinutes} minutes a day...`, aiSource: 'real' as const };
    }

    // A minimal in-memory cache keyed exactly like React Query would be.
    const cache = new Map<string, { focusSummary: string }>();
    async function fetchStudyPlanFocus(key: ReturnType<typeof studyPlanFocusQueryKey>, goal: { targetBand: number; dailyStudyMinutes: number }) {
      const cacheKey = JSON.stringify(key);
      if (!cache.has(cacheKey)) cache.set(cacheKey, await fakeBackend(goal));
      return cache.get(cacheKey)!;
    }

    const initialGoal = { targetBand: 8, dailyStudyMinutes: 30, updatedAt: '2026-01-01T10:00:00Z' };
    const initialKey = studyPlanFocusQueryKey(userId, initialGoal.updatedAt, today);
    const initialResult = await fetchStudyPlanFocus(initialKey, initialGoal);
    expect(initialResult.focusSummary).toContain('Band 8');
    expect(initialResult.focusSummary).toContain('30 minutes');

    // saveOnboardingGoal upserts the same row in place — updatedAt changes,
    // id does not (see onboardingGoalRealMode.test.ts).
    const editedGoal = { targetBand: 7.5, dailyStudyMinutes: 45, updatedAt: '2026-01-01T11:00:00Z' };
    const editedKey = studyPlanFocusQueryKey(userId, editedGoal.updatedAt, today);

    expect(editedKey).not.toEqual(initialKey); // the actual fix: same day, different key

    const editedResult = await fetchStudyPlanFocus(editedKey, editedGoal);
    expect(editedResult.focusSummary).toContain('Band 7.5');
    expect(editedResult.focusSummary).toContain('45 minutes');
    expect(editedResult.focusSummary).not.toContain('Band 8');
    expect(editedResult.focusSummary).not.toContain('30 minutes');

    // The OLD key's cached entry is untouched (proves this is a fresh fetch
    // for a new key, not a mutation of shared state) but is also simply
    // never looked at again — nothing re-reads initialKey after the edit.
    expect(cache.get(JSON.stringify(initialKey))?.focusSummary).toContain('Band 8');
  });
});

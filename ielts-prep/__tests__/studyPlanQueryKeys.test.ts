import { studyPlanFocusQueryKey, studyPlanQueryKey } from '@/lib/studyPlanQueryKeys';

// Regression coverage for the real-device release blocker: Home's Target
// Progress correctly showed an edited target band of 8.0, but Today's Study
// Plan's AI note kept saying "aiming for a Band 7 with 30 minutes a day" —
// the goal shown at onboarding time. Root cause: app/(tabs)/index.tsx's
// React Query key for that AI note only varied by (userId, date), so
// editing the goal (app/profile-edit.tsx, same saveOnboardingGoal every
// onboarding save uses) never produced a new cache entry and the stale
// AI-generated text kept being served for the rest of that calendar day.

describe('studyPlanFocusQueryKey / studyPlanQueryKey — goal.id is part of the cache key', () => {
  it('two different goal ids for the same user/date produce two different keys', () => {
    const before = studyPlanFocusQueryKey('user-1', 'goal-targeting-band-7', '2026-01-01');
    const after = studyPlanFocusQueryKey('user-1', 'goal-targeting-band-8', '2026-01-01');
    expect(before).not.toEqual(after);
  });

  it('the same goal id for the same user/date produces the same key (no unnecessary refetching)', () => {
    const a = studyPlanFocusQueryKey('user-1', 'goal-1', '2026-01-01');
    const b = studyPlanFocusQueryKey('user-1', 'goal-1', '2026-01-01');
    expect(a).toEqual(b);
  });

  it('studyPlanQueryKey has the same goal-id-sensitivity as studyPlanFocusQueryKey', () => {
    const before = studyPlanQueryKey('user-1', 'goal-old', '2026-01-01');
    const after = studyPlanQueryKey('user-1', 'goal-new', '2026-01-01');
    expect(before).not.toEqual(after);
  });

  // Requirement: "Account A and Account B must never share cached
  // study-plan context." userId is already part of every key, so two
  // different accounts never collide even if they happen to share a goal id
  // shape or open the app on the same calendar date.
  it('two different accounts on the same date never produce the same key, even with the same goal id', () => {
    const accountA = studyPlanFocusQueryKey('account-A', 'goal-1', '2026-01-01');
    const accountB = studyPlanFocusQueryKey('account-B', 'goal-1', '2026-01-01');
    expect(accountA).not.toEqual(accountB);
  });

  it('a null/undefined goal id (no goal loaded yet) is still a stable, distinct key', () => {
    const key = studyPlanFocusQueryKey('user-1', null, '2026-01-01');
    expect(key).toEqual(['study-plan-focus', 'user-1', null, '2026-01-01']);
  });
});

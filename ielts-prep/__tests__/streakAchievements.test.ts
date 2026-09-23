// Regression coverage for the PRODUCTION STREAK / GAMIFICATION
// IMPLEMENTATION's achievement wiring: before this, a-streak-7/a-streak-30
// were only ever checked from app/mock-result.tsx, so a user who reached a
// real 7- or 30-day streak purely through standalone practice (never a
// Full Mock) could never have them unlock. checkAndUnlockStreakAchievements
// is now called from every recordDailyActivity() (see streakRealMode.test.ts).

import { supabase } from '@/lib/supabase';
import { checkAndUnlockStreakAchievements } from '@/services/repository/social';

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

function makeSelectBuilder(result: { data: any; error: any }) {
  const builder: any = {};
  builder.select = jest.fn().mockReturnValue(builder);
  builder.eq = jest.fn().mockReturnValue(builder);
  builder.then = (resolve: (v: any) => void) => resolve(result);
  return builder;
}

function makeInsertBuilder(result: { data: any; error: any }) {
  return { insert: jest.fn().mockReturnValue({ then: (resolve: (v: any) => void) => resolve(result) }) };
}

const fromMock = supabase!.from as jest.Mock;

/** A single builder that answers both the getUserAchievements() shape
 * (.select().eq(), thenable) and the unlock() shape (.insert(), thenable) —
 * used when a test doesn't care about call-by-call sequencing, only that
 * every getUserAchievements() call sees no existing achievements and every
 * unlock() call succeeds. */
function mockNoExistingAchievementsThenInsertsSucceed() {
  fromMock.mockImplementation((table: string) => {
    if (table !== 'user_achievements') throw new Error(`unexpected table: ${table}`);
    const builder: any = {};
    builder.select = jest.fn().mockReturnValue(builder);
    builder.eq = jest.fn().mockReturnValue(builder);
    builder.then = (resolve: (v: any) => void) => resolve({ data: [], error: null });
    builder.insert = jest.fn().mockReturnValue({ then: (resolve: (v: any) => void) => resolve({ data: null, error: null }) });
    return builder;
  });
}

describe('checkAndUnlockStreakAchievements', () => {
  afterEach(() => jest.resetAllMocks());

  it('unlocks the 7-day achievement once the real streak reaches 7, and not before', async () => {
    fromMock.mockReturnValueOnce(makeSelectBuilder({ data: [], error: null })); // getUserAchievements
    const unlocked6 = await checkAndUnlockStreakAchievements('user-1', 6);
    expect(unlocked6.map((a) => a.id)).not.toContain('a-streak-7');

    fromMock.mockReturnValueOnce(makeSelectBuilder({ data: [], error: null })); // getUserAchievements
    fromMock.mockReturnValueOnce(makeInsertBuilder({ data: null, error: null })); // unlock(a-streak-7)
    const unlocked7 = await checkAndUnlockStreakAchievements('user-1', 7);
    expect(unlocked7.map((a) => a.id)).toEqual(['a-streak-7']);
  });

  it('unlocks both the 7-day and 30-day achievement in one call once the streak reaches 30', async () => {
    fromMock.mockReturnValueOnce(makeSelectBuilder({ data: [], error: null })); // getUserAchievements
    fromMock.mockReturnValueOnce(makeInsertBuilder({ data: null, error: null })); // unlock(a-streak-7)
    fromMock.mockReturnValueOnce(makeInsertBuilder({ data: null, error: null })); // unlock(a-streak-30)
    const unlocked = await checkAndUnlockStreakAchievements('user-1', 30);
    expect(unlocked.map((a) => a.id).sort()).toEqual(['a-streak-30', 'a-streak-7']);
  });

  it('never re-unlocks (or re-inserts) an achievement the user already has', async () => {
    fromMock.mockReturnValueOnce(
      makeSelectBuilder({ data: [{ id: 'x', user_id: 'user-1', achievement_id: 'a-streak-7', earned_at: '2026-01-01T00:00:00Z' }], error: null })
    );
    fromMock.mockReturnValueOnce(makeInsertBuilder({ data: null, error: null })); // unlock(a-streak-30) — a-streak-7 is skipped entirely, no insert call for it
    const unlocked = await checkAndUnlockStreakAchievements('user-1', 40);
    // a-streak-7 already held -> skipped; a-streak-30 newly earned -> unlocked.
    expect(unlocked.map((a) => a.id)).toEqual(['a-streak-30']);
  });

  it('never evaluates a non-streak achievement (e.g. a mock-count or skill-band one), regardless of the streak value', async () => {
    mockNoExistingAchievementsThenInsertsSucceed();
    const unlocked = await checkAndUnlockStreakAchievements('user-1', 9999);
    expect(unlocked.every((a) => a.criteria.type === 'streak_days')).toBe(true);
  });

  it('a streak of 0 unlocks nothing', async () => {
    fromMock.mockReturnValueOnce(makeSelectBuilder({ data: [], error: null }));
    const unlocked = await checkAndUnlockStreakAchievements('user-1', 0);
    expect(unlocked).toEqual([]);
  });
});

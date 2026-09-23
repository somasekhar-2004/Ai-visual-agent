// Regression coverage for the PRODUCTION STREAK / GAMIFICATION
// IMPLEMENTATION's repository layer (services/repository/core.ts's
// getStreak/getXp/recordDailyActivity) — the real-backend replacement for
// the hardcoded { count: 0, lastActiveDate: null } / no-op stubs the
// pre-launch audit found.

import { getDeviceTimeZone, getLocalDateString } from '@/lib/timezone';
import { supabase } from '@/lib/supabase';
import { getStreak, getXp, recordDailyActivity } from '@/services/repository/core';
import { checkAndUnlockStreakAchievements } from '@/services/repository/social';

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn(), rpc: jest.fn() },
}));

jest.mock('@/services/repository/social', () => ({
  checkAndUnlockStreakAchievements: jest.fn().mockResolvedValue([]),
}));

/** Same minimal chainable query-builder mock pattern as
 * repositoryRealModeErrors.test.ts. */
function makeQueryBuilder(result: { data: any; error: any }) {
  const builder: any = {};
  for (const method of ['select', 'eq', 'order']) {
    builder[method] = jest.fn().mockReturnValue(builder);
  }
  builder.maybeSingle = jest.fn().mockResolvedValue(result);
  builder.then = (resolve: (v: any) => void) => resolve(result);
  return builder;
}

const fromMock = supabase!.from as jest.Mock;
const rpcMock = supabase!.rpc as jest.Mock;
const checkAndUnlockStreakAchievementsMock = checkAndUnlockStreakAchievements as jest.Mock;

const todayLocal = getLocalDateString(getDeviceTimeZone());
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return getLocalDateString(getDeviceTimeZone(), d);
}

describe('getStreak — real backend', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns 0/null for a fresh user with no activity rows', async () => {
    fromMock.mockReturnValue(makeQueryBuilder({ data: [], error: null }));
    await expect(getStreak('user-1')).resolves.toEqual({ count: 0, lastActiveDate: null });
  });

  it('queries user_daily_activity scoped to this exact user, ordered by date descending', async () => {
    fromMock.mockReturnValue(makeQueryBuilder({ data: [], error: null }));
    await getStreak('user-1');
    expect(fromMock).toHaveBeenCalledWith('user_daily_activity');
    const builder = fromMock.mock.results[0].value;
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(builder.order).toHaveBeenCalledWith('activity_date_local', { ascending: false });
  });

  it('derives the real current streak from real rows (three consecutive local days ending today)', async () => {
    const rows = [{ activity_date_local: todayLocal }, { activity_date_local: daysAgo(1) }, { activity_date_local: daysAgo(2) }];
    fromMock.mockReturnValue(makeQueryBuilder({ data: rows, error: null }));
    await expect(getStreak('user-1')).resolves.toEqual({ count: 3, lastActiveDate: todayLocal });
  });

  it('throws (never silently returns 0) on a real query error — a real failure must not look identical to "no activity yet"', async () => {
    fromMock.mockReturnValue(makeQueryBuilder({ data: null, error: { message: 'permission denied for table user_daily_activity', code: '42501' } }));
    await expect(getStreak('user-1')).rejects.toThrow(/permission denied for table user_daily_activity/);
  });
});

describe('getXp — real backend', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns 0 for a fresh user (no fabricated nonzero value)', async () => {
    fromMock.mockReturnValue(makeQueryBuilder({ data: { xp: 0 }, error: null }));
    await expect(getXp('user-1')).resolves.toBe(0);
  });

  it('returns 0 rather than throwing when the profile row is genuinely absent', async () => {
    fromMock.mockReturnValue(makeQueryBuilder({ data: null, error: null }));
    await expect(getXp('user-1')).resolves.toBe(0);
  });

  it('returns the real persisted total', async () => {
    fromMock.mockReturnValue(makeQueryBuilder({ data: { xp: 245 }, error: null }));
    await expect(getXp('user-1')).resolves.toBe(245);
  });
});

describe('recordDailyActivity — real backend', () => {
  afterEach(() => jest.clearAllMocks());

  it('calls the record_daily_activity RPC with the real local date, this device\'s timezone, and the given XP', async () => {
    rpcMock.mockResolvedValue({ data: null, error: null });
    fromMock.mockReturnValue(makeQueryBuilder({ data: [], error: null }));
    await recordDailyActivity('user-1', 20);
    expect(rpcMock).toHaveBeenCalledWith('record_daily_activity', {
      p_user_id: 'user-1',
      p_activity_date_local: todayLocal,
      p_timezone: getDeviceTimeZone(),
      p_xp_earned: 20,
    });
  });

  it('checks streak achievements after a successful record (so a-streak-7/a-streak-30 can unlock from ANY qualifying activity, not only a Full Mock)', async () => {
    rpcMock.mockResolvedValue({ data: null, error: null });
    fromMock.mockReturnValue(makeQueryBuilder({ data: [{ activity_date_local: todayLocal }], error: null }));
    await recordDailyActivity('user-1', 20);
    expect(checkAndUnlockStreakAchievementsMock).toHaveBeenCalledWith('user-1', 1);
  });

  it('throws on a real RPC error and never checks achievements for a write that never happened', async () => {
    rpcMock.mockResolvedValue({ data: null, error: { message: 'permission denied', code: '42501' } });
    await expect(recordDailyActivity('user-1', 20)).rejects.toThrow(/permission denied/);
    expect(checkAndUnlockStreakAchievementsMock).not.toHaveBeenCalled();
  });

  it('never throws just because the best-effort achievement check fails — the activity itself was already recorded', async () => {
    rpcMock.mockResolvedValue({ data: null, error: null });
    fromMock.mockReturnValue(makeQueryBuilder({ data: [], error: null }));
    checkAndUnlockStreakAchievementsMock.mockRejectedValueOnce(new Error('achievements table unavailable'));
    await expect(recordDailyActivity('user-1', 20)).resolves.toBeUndefined();
  });
});

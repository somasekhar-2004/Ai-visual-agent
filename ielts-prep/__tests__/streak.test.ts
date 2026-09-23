// Regression coverage for the PRODUCTION STREAK / GAMIFICATION
// IMPLEMENTATION: computeCurrentStreak is the pure decision logic behind
// getStreak() — see lib/streak.ts's own header comment for the exact rules
// this encodes (a streak isn't broken just because a new day started; it's
// broken once a full day was skipped).

import { computeCurrentStreak } from '@/lib/streak';

describe('computeCurrentStreak', () => {
  it('is 0/null for a fresh user with no recorded activity', () => {
    expect(computeCurrentStreak([], '2026-06-15')).toEqual({ count: 0, lastActiveDate: null });
  });

  it('is 1 after a single qualifying day', () => {
    expect(computeCurrentStreak(['2026-06-15'], '2026-06-15')).toEqual({ count: 1, lastActiveDate: '2026-06-15' });
  });

  it('multiple activities recorded on the same local day still count as exactly one streak day (never 2 or 3)', () => {
    // recordDailyActivity's own DB-level uniqueness already prevents a
    // second row for the same day — this proves the read side is
    // consistent with that even if it were ever handed a duplicate.
    expect(computeCurrentStreak(['2026-06-15', '2026-06-15', '2026-06-15'], '2026-06-15')).toEqual({
      count: 1,
      lastActiveDate: '2026-06-15',
    });
  });

  it('is 2 after two consecutive local days, read on the second day', () => {
    expect(computeCurrentStreak(['2026-06-14', '2026-06-15'], '2026-06-15')).toEqual({ count: 2, lastActiveDate: '2026-06-15' });
  });

  it('is 3 after three consecutive local days', () => {
    expect(computeCurrentStreak(['2026-06-13', '2026-06-14', '2026-06-15'], '2026-06-15')).toEqual({
      count: 3,
      lastActiveDate: '2026-06-15',
    });
  });

  it('missing one full calendar day resets the streak to 0 (until a new qualifying activity restarts it at 1)', () => {
    // Active 06-13/06-14, skipped 06-15, read on 06-16 — a 2-day gap.
    const result = computeCurrentStreak(['2026-06-13', '2026-06-14'], '2026-06-16');
    expect(result.count).toBe(0);
    // lastActiveDate still reports the real last-active day, for copy like
    // "you last studied on...", separate from the broken streak count.
    expect(result.lastActiveDate).toBe('2026-06-14');
  });

  it('a broken run further back does not contaminate a later, still-active run', () => {
    // 06-01/06-02 (broken by a gap), then 06-10/06-11/06-12 (current, read on 06-12).
    const dates = ['2026-06-01', '2026-06-02', '2026-06-10', '2026-06-11', '2026-06-12'];
    expect(computeCurrentStreak(dates, '2026-06-12')).toEqual({ count: 3, lastActiveDate: '2026-06-12' });
  });

  it('is order-independent — the same dates in any order produce the same result', () => {
    const forward = ['2026-06-13', '2026-06-14', '2026-06-15'];
    const shuffled = ['2026-06-15', '2026-06-13', '2026-06-14'];
    expect(computeCurrentStreak(shuffled, '2026-06-15')).toEqual(computeCurrentStreak(forward, '2026-06-15'));
  });

  describe('today vs yesterday — the streak stays alive all day, before today\'s own activity', () => {
    it('last activity was TODAY -> preserves the full computed streak', () => {
      expect(computeCurrentStreak(['2026-06-13', '2026-06-14', '2026-06-15'], '2026-06-15')).toEqual({
        count: 3,
        lastActiveDate: '2026-06-15',
      });
    });

    it('last activity was YESTERDAY, today has no activity yet -> still shows the streak as active, not 0', () => {
      // Active through 06-14, reading the streak on 06-15 before today's
      // own activity — Home must show 3, not 0, since the day isn't over.
      expect(computeCurrentStreak(['2026-06-12', '2026-06-13', '2026-06-14'], '2026-06-15')).toEqual({
        count: 3,
        lastActiveDate: '2026-06-14',
      });
    });

    it('last activity was 2+ days ago -> the streak is broken (0), even though lastActiveDate is real', () => {
      expect(computeCurrentStreak(['2026-06-12', '2026-06-13', '2026-06-14'], '2026-06-17')).toEqual({
        count: 0,
        lastActiveDate: '2026-06-14',
      });
    });
  });

  describe('DST / calendar-date arithmetic', () => {
    it('counts two dates either side of a spring-forward DST transition as consecutive (pure calendar dates, not elapsed hours)', () => {
      // US spring-forward 2026-03-08 -> 2026-03-09 is only 23 real hours
      // apart in America/New_York, but is still exactly one calendar day.
      expect(computeCurrentStreak(['2026-03-08', '2026-03-09'], '2026-03-09')).toEqual({ count: 2, lastActiveDate: '2026-03-09' });
    });

    it('counts two dates either side of a fall-back DST transition as consecutive (25 real hours, still one calendar day)', () => {
      expect(computeCurrentStreak(['2026-11-01', '2026-11-02'], '2026-11-02')).toEqual({ count: 2, lastActiveDate: '2026-11-02' });
    });

    it('correctly spans a month/year boundary', () => {
      expect(computeCurrentStreak(['2025-12-31', '2026-01-01'], '2026-01-01')).toEqual({ count: 2, lastActiveDate: '2026-01-01' });
    });
  });

  describe('travel between timezones', () => {
    it('never rewrites/merges past dates just because they were recorded under different timezones — only the date strings themselves matter', () => {
      // Each date is exactly what was recorded at the time (a different
      // timezone on each day, e.g. after flying) — the function only ever
      // reasons about the calendar-date strings, never the timezone field,
      // so travel that still produces sensible consecutive local dates
      // continues the streak normally.
      expect(computeCurrentStreak(['2026-06-14', '2026-06-15'], '2026-06-15')).toEqual({ count: 2, lastActiveDate: '2026-06-15' });
    });

    it('a todayLocal that resolves earlier than the last recorded date (e.g. flying back across the date line) is treated as still-active, not broken', () => {
      const result = computeCurrentStreak(['2026-06-14', '2026-06-15'], '2026-06-14');
      expect(result.count).toBe(2);
      expect(result.lastActiveDate).toBe('2026-06-15');
    });
  });
});

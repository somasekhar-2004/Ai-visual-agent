/**
 * Pure streak-calculation logic over a set of "YYYY-MM-DD" local-calendar-
 * date strings — one per day the user completed at least one qualifying
 * activity (see services/repository/core.ts's recordDailyActivity for what
 * qualifies). Each date string is exactly what was recorded at the time of
 * that day's activity, in whatever timezone the device was in then — this
 * function never re-derives or re-interprets those dates under the
 * caller's CURRENT timezone. `todayLocal` is the one place "now" enters the
 * calculation, and it reflects the timezone the device is in right now (at
 * read time), which may differ from the timezone recorded against any
 * individual past row (e.g. after travel) — that mismatch is expected and
 * never corrected retroactively; see supabase/migrations/0015_streak_activity.sql's
 * header comment for why.
 */

export type CurrentStreak = { count: number; lastActiveDate: string | null };

/** Parses a "YYYY-MM-DD" string as a pure calendar date, anchored at UTC
 * midnight — this sidesteps DST entirely for day-difference arithmetic
 * between two calendar dates (as opposed to two real timezone-aware
 * moments, which is not what's being compared here). */
function toUtcMidnight(localDateString: string): number {
  const [year, month, day] = localDateString.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function daysBetween(laterLocalDateString: string, earlierLocalDateString: string): number {
  return Math.round((toUtcMidnight(laterLocalDateString) - toUtcMidnight(earlierLocalDateString)) / 86_400_000);
}

/**
 * Computes the current streak from a user's recorded activity-day dates.
 *
 * Rules (the natural "consumer app" behavior — a streak isn't broken just
 * because a new day has started; it's broken once a full day was skipped):
 * - No activity at all -> { count: 0, lastActiveDate: null }.
 * - Last activity was today or yesterday (relative to `todayLocal`) -> the
 *   streak is still alive: count is the length of the most recent run of
 *   consecutive calendar days, ending at the last activity date. This is
 *   deliberately true even before today's own activity — Home shows
 *   yesterday's earned streak count all day today, not 0, until either
 *   today's qualifying activity extends it or the day ends without one.
 * - Last activity was 2+ days ago -> the streak is broken: count is 0
 *   (lastActiveDate still reports when they were last active, for copy
 *   like "you last studied 5 days ago"). The next qualifying activity
 *   starts a fresh streak at 1, computed the next time this runs.
 */
export function computeCurrentStreak(activityDates: string[], todayLocal: string): CurrentStreak {
  if (activityDates.length === 0) return { count: 0, lastActiveDate: null };

  const distinctDescending = Array.from(new Set(activityDates)).sort().reverse();
  const lastActiveDate = distinctDescending[0];

  let count = 1;
  for (let i = 1; i < distinctDescending.length; i++) {
    if (daysBetween(distinctDescending[i - 1], distinctDescending[i]) === 1) {
      count++;
    } else {
      break;
    }
  }

  const daysSinceLastActivity = daysBetween(todayLocal, lastActiveDate);
  // <= 1 (not === ) also gracefully covers a negative gap (todayLocal
  // computing as "before" lastActiveDate — clock skew, or a timezone jump
  // that makes "today" resolve earlier than an already-recorded date) by
  // treating the streak as still alive rather than as broken.
  if (daysSinceLastActivity <= 1) {
    return { count, lastActiveDate };
  }
  return { count: 0, lastActiveDate };
}

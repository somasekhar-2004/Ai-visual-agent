/**
 * The device's current IANA timezone name (e.g. "Asia/Kolkata"), used to
 * compute the user's actual LOCAL calendar day for streak tracking — never
 * UTC (see lib/streak.ts and supabase/migrations/0015_streak_activity.sql
 * for why the previous UTC-based approach elsewhere in this app,
 * lib/entitlements.ts's daily-quota reset, is deliberately not reused
 * here). Uses the platform's built-in Intl support (available in Hermes on
 * every supported Expo SDK 57 target) rather than adding a native
 * dependency — no `expo-localization` needed for this.
 */
export function getDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Renders `at` (defaults to now) as a plain "YYYY-MM-DD" calendar-date
 * string in the given IANA timezone — the exact local date a streak
 * activity happened on. Uses the `en-CA` locale purely as a formatting
 * trick (it conventionally renders dates as YYYY-MM-DD); no locale-specific
 * behavior is otherwise relied upon. DST-safe by construction: Intl's
 * timezone database (not a fixed UTC offset) resolves the correct local
 * date across a DST transition the same way any other timezone-aware
 * platform API would.
 */
export function getLocalDateString(timeZone: string, at: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
  } catch {
    // An unrecognized/invalid timeZone string must never throw all the way
    // up through a completion handler — fall back to the equivalent UTC
    // date rather than blocking the activity from being recorded at all.
    return at.toISOString().slice(0, 10);
  }
}

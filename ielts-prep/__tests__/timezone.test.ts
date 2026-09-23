// Regression coverage for the PRODUCTION STREAK / GAMIFICATION
// IMPLEMENTATION's timezone source: streak day boundaries must use the
// user's LOCAL calendar day, never UTC (the bug the audit found in
// lib/entitlements.ts's daily-quota reset, which this deliberately does
// not reuse — see lib/timezone.ts's header comment).

import { getDeviceTimeZone, getLocalDateString } from '@/lib/timezone';

describe('getDeviceTimeZone', () => {
  it('returns a real, non-empty IANA-style timezone string', () => {
    const tz = getDeviceTimeZone();
    expect(typeof tz).toBe('string');
    expect(tz.length).toBeGreaterThan(0);
  });
});

describe('getLocalDateString', () => {
  it('formats a known instant as YYYY-MM-DD in UTC', () => {
    const at = new Date('2026-06-15T12:00:00Z');
    expect(getLocalDateString('UTC', at)).toBe('2026-06-15');
  });

  it('can render a different calendar date than UTC for a timezone far ahead of UTC, near the UTC day boundary', () => {
    // 2026-06-15T23:30:00Z is already 2026-06-16 in Asia/Kolkata (UTC+5:30)
    // — exactly the case a UTC-based day boundary would get wrong.
    const at = new Date('2026-06-15T23:30:00Z');
    expect(getLocalDateString('Asia/Kolkata', at)).toBe('2026-06-16');
    expect(getLocalDateString('UTC', at)).toBe('2026-06-15');
  });

  it('can render an earlier calendar date than UTC for a timezone behind UTC, near the UTC day boundary', () => {
    // 2026-06-16T02:00:00Z is still 2026-06-15 in America/Los_Angeles (UTC-7 in June).
    const at = new Date('2026-06-16T02:00:00Z');
    expect(getLocalDateString('America/Los_Angeles', at)).toBe('2026-06-15');
    expect(getLocalDateString('UTC', at)).toBe('2026-06-16');
  });

  it('resolves the correct local date across a DST transition (America/New_York spring-forward, 2026-03-08)', () => {
    // 2026-03-08 06:30 UTC = 2026-03-08 01:30 EST (still standard time,
    // clocks haven't sprung forward yet at 2am local).
    expect(getLocalDateString('America/New_York', new Date('2026-03-08T06:30:00Z'))).toBe('2026-03-08');
    // 2026-03-09 04:30 UTC = 2026-03-09 00:30 EDT (after spring-forward).
    expect(getLocalDateString('America/New_York', new Date('2026-03-09T04:30:00Z'))).toBe('2026-03-09');
  });

  it('falls back to a UTC-equivalent date string rather than throwing for an invalid timezone name', () => {
    const at = new Date('2026-06-15T12:00:00Z');
    expect(getLocalDateString('Not/A_Real_Zone', at)).toBe('2026-06-15');
  });

  it('defaults to "now" when no instant is given', () => {
    const result = getLocalDateString('UTC');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// Regression coverage for the reported production incident: a fresh real
// account showed fabricated demo seed data (name "Alex", Listening 7.0,
// Reading 6.5, Writing 5.5, Speaking 6.0, a 3-day streak) instead of its
// own, genuinely empty state. There is no Demo Mode / seed data anywhere in
// runtime code any more (see lib/env.ts) — these tests exercise
// services/repository/core.ts's real Supabase-backed functions directly and
// prove a brand-new real user's progress reads back as null/empty/zero, and
// specifically that none of it matches the old fabricated seed shape.

import { getActiveGoal, getLatestBandScores, getProfile, getStreak, getXp } from '@/services/repository';

const DEMO_SEED_NAME = 'Alex';
const DEMO_SEED_BANDS = { listening: 7.0, reading: 6.5, writing: 5.5, speaking: 6.0 };
const DEMO_SEED_STREAK_COUNT = 3;

/** A Supabase query-builder stand-in where every chained call (select, eq,
 * order, limit) returns itself, and awaiting it (or calling maybeSingle())
 * always resolves to the given empty response — modeling exactly what a
 * brand-new account with zero rows in every table actually gets back. */
function makeEmptyQueryBuilder(response: { data: unknown; error: null }): any {
  const builder: any = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    maybeSingle: () => Promise.resolve(response),
    then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) => Promise.resolve(response).then(resolve, reject),
  };
  return builder;
}

const mockFrom = jest.fn((_table?: string) => makeEmptyQueryBuilder({ data: null, error: null }));
jest.mock('@/lib/supabase', () => ({ supabase: { from: (table: string) => mockFrom(table) } }));

describe('a brand-new real user starts with genuinely empty progress', () => {
  beforeEach(() => jest.clearAllMocks());

  it('getProfile returns null, never the demo seed name "Alex"', async () => {
    const profile = await getProfile('real-user-1');
    expect(profile).toBeNull();
  });

  it('getActiveGoal returns null for an account with zero goal rows', async () => {
    const goal = await getActiveGoal('real-user-1');
    expect(goal).toBeNull();
  });

  it('getLatestBandScores returns an empty map, never the demo seed bands (7.0/6.5/5.5/6.0)', async () => {
    mockFrom.mockReturnValueOnce(makeEmptyQueryBuilder({ data: [], error: null }));
    const bands = await getLatestBandScores('real-user-1');
    expect(bands).toEqual({});
    expect(bands).not.toEqual(expect.objectContaining(DEMO_SEED_BANDS));
  });

  it('getStreak returns count 0, never the demo seed streak of 3 days', async () => {
    const streak = await getStreak('real-user-1');
    expect(streak).toEqual({ count: 0, lastActiveDate: null });
    expect(streak.count).not.toBe(DEMO_SEED_STREAK_COUNT);
  });

  it('getXp returns 0 for a brand-new real account', async () => {
    const xp = await getXp('real-user-1');
    expect(xp).toBe(0);
  });

  it('none of a fresh real user\'s data ever equals the demo seed name', async () => {
    const profile = await getProfile('real-user-1');
    expect(profile?.fullName).not.toBe(DEMO_SEED_NAME);
  });
});

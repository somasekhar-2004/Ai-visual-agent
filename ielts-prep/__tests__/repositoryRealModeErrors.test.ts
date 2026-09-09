import { supabase } from '@/lib/supabase';
import { getActiveGoal, getProfile } from '@/services/repository/core';
import { getLessonProgressMap, markLessonComplete } from '@/services/repository/learning';
import { createSpeakingSession, startMockAttempt } from '@/services/repository/testing';

// Regression coverage for the "permission denied for table X" investigation:
// several repository functions used to destructure only `data` from a
// Supabase response, so a real query failure (RLS/permission denial,
// network error) silently looked identical to "no data" instead of
// surfacing anywhere — producing the Home white screen, the full-mock-test
// crash, the speaking-session crash, and "Mark as complete" doing nothing.
// These tests run against the real-backend branch, so isDemoMode must be
// false here (unlike the rest of the suite, which stays in Demo Mode with
// no EXPO_PUBLIC_SUPABASE_URL set).
jest.mock('@/lib/env', () => ({
  ...jest.requireActual('@/lib/env'),
  isDemoMode: false,
  isSupabaseConfigured: true,
}));

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

/** A minimal chainable query builder mock: every method returns `this` so
 * any subset of `.select().eq().order().limit().maybeSingle()` etc. can be
 * called in whatever order the function under test uses, and the terminal
 * call (whichever one the code `await`s) resolves to `result`. */
function makeQueryBuilder(result: { data: any; error: any }) {
  const builder: any = {};
  const chainMethods = ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'order', 'limit'];
  for (const method of chainMethods) {
    builder[method] = jest.fn().mockReturnValue(builder);
  }
  builder.maybeSingle = jest.fn().mockResolvedValue(result);
  builder.single = jest.fn().mockResolvedValue(result);
  // A plain query with no .single()/.maybeSingle() call (e.g. a bare
  // `.insert(...)` or `.select().eq(...)`) is itself awaited directly —
  // make the builder thenable so `await` resolves to `result` too.
  builder.then = (resolve: (v: any) => void) => resolve(result);
  return builder;
}

const fromMock = supabase!.from as jest.Mock;

describe('repository read functions throw on a real Supabase error (never silently return empty)', () => {
  afterEach(() => jest.clearAllMocks());

  it('getProfile throws instead of returning null when the query errors', async () => {
    fromMock.mockReturnValue(makeQueryBuilder({ data: null, error: { message: 'permission denied for table profiles', code: '42501' } }));
    await expect(getProfile('user-1')).rejects.toThrow(/permission denied for table profiles/);
  });

  it('getProfile still returns null for a genuine "no row" result (no error)', async () => {
    fromMock.mockReturnValue(makeQueryBuilder({ data: null, error: null }));
    await expect(getProfile('user-1')).resolves.toBeNull();
  });

  it('getActiveGoal throws instead of returning null when the query errors', async () => {
    fromMock.mockReturnValue(makeQueryBuilder({ data: null, error: { message: 'permission denied for table user_goals', code: '42501' } }));
    await expect(getActiveGoal('user-1')).rejects.toThrow(/permission denied for table user_goals/);
  });
});

describe('repository insert functions never crash on a null row — they throw the real error', () => {
  afterEach(() => jest.clearAllMocks());

  it('startMockAttempt throws a descriptive error instead of "Cannot read property \'id\' of null"', async () => {
    fromMock.mockReturnValue(makeQueryBuilder({ data: null, error: { message: 'permission denied for table mock_attempts', code: '42501' } }));
    await expect(startMockAttempt('user-1', 'mock-1')).rejects.toThrow(/Failed to start the mock test/);
    await expect(startMockAttempt('user-1', 'mock-1')).rejects.toThrow(/permission denied for table mock_attempts/);
  });

  it('createSpeakingSession throws a descriptive error instead of crashing on a null row', async () => {
    fromMock.mockReturnValue(makeQueryBuilder({ data: null, error: { message: 'permission denied for table speaking_sessions', code: '42501' } }));
    await expect(createSpeakingSession('user-1', 'part1', null)).rejects.toThrow(/Failed to start the speaking session/);
  });
});

describe('markLessonComplete surfaces a real failure instead of doing nothing', () => {
  afterEach(() => jest.clearAllMocks());

  it('throws when the upsert is rejected, instead of resolving as if it succeeded', async () => {
    fromMock.mockReturnValue(makeQueryBuilder({ data: null, error: { message: 'permission denied for table lesson_progress', code: '42501' } }));
    await expect(markLessonComplete('user-1', 'lesson-1')).rejects.toThrow(/Failed to save lesson completion/);
  });

  it('resolves cleanly when the upsert succeeds', async () => {
    fromMock.mockReturnValue(makeQueryBuilder({ data: null, error: null }));
    await expect(markLessonComplete('user-1', 'lesson-1')).resolves.toBeUndefined();
  });

  it('getLessonProgressMap throws instead of silently returning an empty map on error', async () => {
    fromMock.mockReturnValue(makeQueryBuilder({ data: null, error: { message: 'permission denied for table lesson_progress', code: '42501' } }));
    await expect(getLessonProgressMap('user-1')).rejects.toThrow(/Failed to load lesson progress/);
  });
});

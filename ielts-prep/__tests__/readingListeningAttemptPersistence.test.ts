import { supabase } from '@/lib/supabase';
import { saveListeningAttempt, saveReadingAttempt } from '@/services/repository/testing';

// Regression coverage for the "Listening test completed but never appears in
// Test History or Home's Listening band" bug: saveReadingAttempt and
// saveListeningAttempt used to build `test_history.ref_id` from a locally
// generated id (generateId('ra')/('la'), e.g. "ra_abc123_xyz") instead of the
// real row id Postgres assigns to reading_attempts/listening_attempts (both
// `uuid default gen_random_uuid()`). test_history.ref_id is itself a `uuid`
// column, so every single save threw "invalid input syntax for type uuid"
// from addTestHistory — after the reading_attempts/listening_attempts row
// had already been inserted, but before recordDailyActivity/recordBandScore
// ever ran. The score screen still showed (computed client-side, before any
// of this), so the failure was invisible: the test simply never showed up in
// Test History, and the skill's band on Home never updated, with no
// user-visible error either. saveWritingFeedback/saveSpeakingFeedback never
// had this bug — they were always passed the real DB-returned
// submissionId/sessionId.
jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

/** See repositoryRealModeErrors.test.ts for the full explanation of this
 * chainable mock shape. */
function makeQueryBuilder(result: { data: any; error: any }) {
  const builder: any = {};
  for (const method of ['select', 'insert', 'update', 'eq', 'order']) builder[method] = jest.fn().mockReturnValue(builder);
  builder.single = jest.fn().mockResolvedValue(result);
  builder.then = (resolve: (v: any) => void) => resolve(result);
  return builder;
}

const fromMock = supabase!.from as jest.Mock;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('saveReadingAttempt — test_history.ref_id is always the real DB-assigned attempt id', () => {
  afterEach(() => jest.clearAllMocks());

  it('passes the inserted row\'s own id (never a locally generated "ra_..." id) to addTestHistory', async () => {
    const dbRow = {
      id: '70000000-0000-0000-0000-000000000001',
      user_id: 'user-1',
      mock_attempt_id: null,
      ielts_type: 'academic',
      passage_ids: ['80000000-0000-0000-0000-000000000001'],
      raw_score: 30,
      total_questions: 40,
      band: '7.0',
      time_spent_seconds: 600,
      answers: {},
      created_at: '2026-01-01T00:00:00.000Z',
    };
    const insertBuilder = makeQueryBuilder({ data: dbRow, error: null });
    const historyBuilder = makeQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValueOnce(insertBuilder).mockReturnValueOnce(historyBuilder);

    const attempt = await saveReadingAttempt('user-1', {
      ieltsType: 'academic',
      passageIds: ['80000000-0000-0000-0000-000000000001'],
      rawScore: 30,
      totalQuestions: 40,
      band: 7.0,
      timeSpentSeconds: 600,
      answers: {},
    });

    expect(attempt.id).toBe(dbRow.id);
    expect(UUID_RE.test(attempt.id)).toBe(true);
    expect(historyBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({ ref_id: dbRow.id, activity_type: 'reading' }));
  });

  it('surfaces (never swallows) a failure recording test history, even though the attempt row itself was already saved', async () => {
    const dbRow = {
      id: '70000000-0000-0000-0000-000000000002',
      user_id: 'user-1',
      mock_attempt_id: null,
      ielts_type: 'academic',
      passage_ids: [],
      raw_score: 10,
      total_questions: 40,
      band: '5.0',
      time_spent_seconds: 300,
      answers: {},
      created_at: '2026-01-01T00:00:00.000Z',
    };
    const insertBuilder = makeQueryBuilder({ data: dbRow, error: null });
    const historyBuilder = makeQueryBuilder({ data: null, error: { message: 'invalid input syntax for type uuid: "ra_xyz"', code: '22P02' } });
    fromMock.mockReturnValueOnce(insertBuilder).mockReturnValueOnce(historyBuilder);

    await expect(
      saveReadingAttempt('user-1', { ieltsType: 'academic', passageIds: [], rawScore: 10, totalQuestions: 40, band: 5.0, timeSpentSeconds: 300, answers: {} })
    ).rejects.toThrow(/Failed to record test history/);
    // The attempt row insert itself still happened — this is exactly the
    // partial-failure state the screen-level retry logic (reading-test.tsx's
    // persistRef) must recover from without re-inserting a duplicate row.
    expect(insertBuilder.insert).toHaveBeenCalledTimes(1);
  });
});

describe('saveListeningAttempt — test_history.ref_id is always the real DB-assigned attempt id', () => {
  afterEach(() => jest.clearAllMocks());

  it('passes the inserted row\'s own id (never a locally generated "la_..." id) to addTestHistory', async () => {
    const dbRow = {
      id: '70000000-0000-0000-0000-000000000003',
      user_id: 'user-1',
      mock_attempt_id: null,
      track_ids: ['30000000-0000-0000-0000-000000000001'],
      raw_score: 32,
      total_questions: 40,
      band: '7.5',
      answers: {},
      created_at: '2026-01-01T00:00:00.000Z',
    };
    const insertBuilder = makeQueryBuilder({ data: dbRow, error: null });
    const historyBuilder = makeQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValueOnce(insertBuilder).mockReturnValueOnce(historyBuilder);

    const attempt = await saveListeningAttempt('user-1', {
      trackIds: ['30000000-0000-0000-0000-000000000001'],
      rawScore: 32,
      totalQuestions: 40,
      band: 7.5,
      answers: {},
    });

    expect(attempt.id).toBe(dbRow.id);
    expect(UUID_RE.test(attempt.id)).toBe(true);
    expect(historyBuilder.insert).toHaveBeenCalledWith(expect.objectContaining({ ref_id: dbRow.id, activity_type: 'listening' }));
  });

  it('surfaces (never swallows) a failure recording test history, even though the attempt row itself was already saved', async () => {
    const dbRow = {
      id: '70000000-0000-0000-0000-000000000004',
      user_id: 'user-1',
      mock_attempt_id: null,
      track_ids: [],
      raw_score: 8,
      total_questions: 40,
      band: '3.5',
      answers: {},
      created_at: '2026-01-01T00:00:00.000Z',
    };
    const insertBuilder = makeQueryBuilder({ data: dbRow, error: null });
    const historyBuilder = makeQueryBuilder({ data: null, error: { message: 'invalid input syntax for type uuid: "la_xyz"', code: '22P02' } });
    fromMock.mockReturnValueOnce(insertBuilder).mockReturnValueOnce(historyBuilder);

    await expect(
      saveListeningAttempt('user-1', { trackIds: [], rawScore: 8, totalQuestions: 40, band: 3.5, answers: {} })
    ).rejects.toThrow(/Failed to record test history/);
    expect(insertBuilder.insert).toHaveBeenCalledTimes(1);
  });
});

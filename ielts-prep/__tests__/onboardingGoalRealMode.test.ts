import { supabase } from '@/lib/supabase';
import { saveOnboardingGoal } from '@/services/repository/core';

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

const INPUT = {
  ieltsType: 'academic' as const,
  currentBand: 6,
  targetBand: 7,
  examDate: null,
  weakestSkill: null,
  dailyStudyMinutes: 30,
};

const EXISTING_ROW = {
  id: 'goal-1',
  user_id: 'user-1',
  ielts_type: 'academic',
  current_band: 6,
  target_band: 7,
  exam_date: null,
  weakest_skill: null,
  daily_study_minutes: 30,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

/** Mocks the two-call shape saveOnboardingGoal now uses: a SELECT for the
 * existing active goal (maybeSingle), then either an UPDATE (existing found)
 * or an INSERT (none found) — never both, unlike the old insert-then-
 * deactivate flow this replaces. `existing` controls which branch fires. */
function mockGoalTable({
  existing = null as { id: string } | null,
  writeData = null as any,
  writeError = null as any,
  selectError = null as any,
}) {
  const maybeSingleMock = jest.fn().mockResolvedValue({ data: existing, error: selectError });
  const selectEqMock = jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ maybeSingle: maybeSingleMock }) });
  const selectMock = jest.fn().mockReturnValue({ eq: selectEqMock });

  const writeSingleMock = jest.fn().mockResolvedValue({ data: writeData, error: writeError });
  const writeSelectMock = jest.fn().mockReturnValue({ single: writeSingleMock });
  const updateEqMock = jest.fn().mockReturnValue({ select: writeSelectMock });
  const updateMock = jest.fn().mockReturnValue({ eq: updateEqMock });
  const insertMock = jest.fn().mockReturnValue({ select: writeSelectMock });

  (supabase!.from as jest.Mock).mockReturnValue({ select: selectMock, update: updateMock, insert: insertMock });
  return { selectMock, selectEqMock, maybeSingleMock, updateMock, updateEqMock, insertMock, writeSingleMock };
}

describe('saveOnboardingGoal — true upsert semantics (migration 0013)', () => {
  afterEach(() => jest.clearAllMocks());

  it('a brand-new user (no existing goal) gets an INSERT, never an UPDATE', async () => {
    const { insertMock, updateMock } = mockGoalTable({
      existing: null,
      writeData: { ...EXISTING_ROW },
    });
    const goal = await saveOnboardingGoal('user-1', INPUT);
    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1', is_active: true, target_band: 7 }));
    expect(updateMock).not.toHaveBeenCalled();
    expect(goal).toEqual({
      id: 'goal-1',
      userId: 'user-1',
      ieltsType: 'academic',
      currentBand: 6,
      targetBand: 7,
      examDate: null,
      weakestSkill: null,
      dailyStudyMinutes: 30,
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
  });

  // The exact regression this migration fixes: editing a goal must update
  // the ONE existing current-goal row in place — never insert a second,
  // competing "current" row (which migration 0013's
  // uq_user_goals_one_active_per_user constraint would now reject outright
  // anyway).
  it('an existing user (has an active goal) gets an UPDATE on that same row, never a second INSERT', async () => {
    const { insertMock, updateMock, updateEqMock } = mockGoalTable({
      existing: { id: 'goal-1' },
      writeData: { ...EXISTING_ROW, target_band: 8, daily_study_minutes: 45, updated_at: '2026-01-02T00:00:00Z' },
    });
    const goal = await saveOnboardingGoal('user-1', { ...INPUT, targetBand: 8, dailyStudyMinutes: 45 });
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ target_band: 8, daily_study_minutes: 45 })
    );
    expect(updateEqMock).toHaveBeenCalledWith('id', 'goal-1');
    expect(insertMock).not.toHaveBeenCalled();
    expect(goal.id).toBe('goal-1'); // same row, not a new one
    expect(goal.targetBand).toBe(8);
    expect(goal.updatedAt).toBe('2026-01-02T00:00:00Z');
  });

  it('throws the real database error instead of crashing when the write is rejected (e.g. by a row-level security policy)', async () => {
    mockGoalTable({
      existing: null,
      writeError: { message: 'new row violates row-level security policy for table "user_goals"', code: '42501' },
    });
    await expect(saveOnboardingGoal('user-1', INPUT)).rejects.toThrow(/row-level security policy/);
    await expect(saveOnboardingGoal('user-1', INPUT)).rejects.toThrow(/42501/);
  });

  it('throws instead of passing a null row to the mapper when the write returns no data and no error', async () => {
    mockGoalTable({ existing: null, writeData: null, writeError: null });
    await expect(saveOnboardingGoal('user-1', INPUT)).rejects.toThrow(/no row/);
  });

  it('throws when checking for an existing goal itself fails, rather than guessing which branch to take', async () => {
    mockGoalTable({ selectError: { message: 'connection reset', code: '08006' } });
    await expect(saveOnboardingGoal('user-1', INPUT)).rejects.toThrow(/connection reset/);
  });
});

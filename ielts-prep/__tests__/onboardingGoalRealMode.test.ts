import { supabase } from '@/lib/supabase';
import { saveOnboardingGoal } from '@/services/repository/core';

// These tests exercise the real-backend branch of services/repository/core.ts,
// so isDemoMode must be false here (unlike the rest of the suite, which runs
// with no EXPO_PUBLIC_SUPABASE_URL set and therefore stays in Demo Mode).
jest.mock('@/lib/env', () => ({
  ...jest.requireActual('@/lib/env'),
  isDemoMode: false,
  isSupabaseConfigured: true,
}));

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

function mockGoalTable({ deactivateError = null as any, insertData = null as any, insertError = null as any }) {
  const neqMock = jest.fn().mockResolvedValue({ error: deactivateError });
  const eqMock = jest.fn().mockReturnValue({ neq: neqMock });
  const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
  const singleMock = jest.fn().mockResolvedValue({ data: insertData, error: insertError });
  const selectMock = jest.fn().mockReturnValue({ single: singleMock });
  const insertMock = jest.fn().mockReturnValue({ select: selectMock });
  (supabase!.from as jest.Mock).mockReturnValue({ update: updateMock, insert: insertMock });
  return { updateMock, insertMock, neqMock, eqMock };
}

describe('saveOnboardingGoal — real backend', () => {
  afterEach(() => jest.clearAllMocks());

  it('maps a successful insert to a UserGoal', async () => {
    mockGoalTable({
      insertData: {
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
      },
    });
    const goal = await saveOnboardingGoal('user-1', INPUT);
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
    });
  });

  it('throws the real database error instead of crashing when the insert is rejected (e.g. by a row-level security policy)', async () => {
    mockGoalTable({
      insertError: { message: 'new row violates row-level security policy for table "user_goals"', code: '42501' },
    });
    await expect(saveOnboardingGoal('user-1', INPUT)).rejects.toThrow(/row-level security policy/);
    await expect(saveOnboardingGoal('user-1', INPUT)).rejects.toThrow(/42501/);
  });

  it('throws instead of passing a null row to the mapper when the insert returns no data and no error', async () => {
    mockGoalTable({ insertData: null, insertError: null });
    await expect(saveOnboardingGoal('user-1', INPUT)).rejects.toThrow(/no row/);
  });

  // Regression coverage for "Home still shows the setup CTA for an existing
  // account" (see __tests__/homeGoalRecovery.test.ts for the full story):
  // this used to deactivate every previous goal BEFORE inserting the new
  // one — a failure between those two calls left the account with zero
  // active goals. The insert now happens first, so a failure to deactivate
  // old goals afterward is a non-fatal cleanup step, never a reason for
  // onboarding itself to appear to have failed.
  it('still returns the newly-saved goal even if deactivating previous goals fails afterward', async () => {
    const { insertMock } = mockGoalTable({
      deactivateError: { message: 'connection reset', code: '08006' },
      insertData: {
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
      },
    });
    await expect(saveOnboardingGoal('user-1', INPUT)).resolves.toMatchObject({ id: 'goal-1' });
    expect(insertMock).toHaveBeenCalled();
  });

  // Explicit coverage for "no duplicate active goals": every OTHER goal row
  // for this user (matched by user_id, excluding the just-inserted row's own
  // id) is deactivated right after the insert, so exactly one active goal
  // ever exists per user.
  it('deactivates every other goal for this user (never the one just inserted), so no duplicate active goals exist afterward', async () => {
    const { updateMock, eqMock, neqMock } = mockGoalTable({
      insertData: {
        id: 'goal-new',
        user_id: 'user-1',
        ielts_type: 'academic',
        current_band: 6,
        target_band: 7,
        exam_date: null,
        weakest_skill: null,
        daily_study_minutes: 30,
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
      },
    });
    await saveOnboardingGoal('user-1', INPUT);
    expect(updateMock).toHaveBeenCalledWith({ is_active: false });
    expect(eqMock).toHaveBeenCalledWith('user_id', 'user-1');
    expect(neqMock).toHaveBeenCalledWith('id', 'goal-new');
  });
});

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
  const eqMock = jest.fn().mockResolvedValue({ error: deactivateError });
  const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
  const singleMock = jest.fn().mockResolvedValue({ data: insertData, error: insertError });
  const selectMock = jest.fn().mockReturnValue({ single: singleMock });
  const insertMock = jest.fn().mockReturnValue({ select: selectMock });
  (supabase!.from as jest.Mock).mockReturnValue({ update: updateMock, insert: insertMock });
  return { updateMock, insertMock };
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

  it('throws when deactivating the previous goal fails, without attempting the insert', async () => {
    const { insertMock } = mockGoalTable({ deactivateError: { message: 'connection reset', code: '08006' } });
    await expect(saveOnboardingGoal('user-1', INPUT)).rejects.toThrow(/connection reset/);
    expect(insertMock).not.toHaveBeenCalled();
  });
});

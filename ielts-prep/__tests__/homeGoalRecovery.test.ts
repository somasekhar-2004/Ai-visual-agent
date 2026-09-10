import { supabase } from '@/lib/supabase';
import { getActiveGoal, saveOnboardingGoal } from '@/services/repository/core';

// Regression coverage for "Home still shows 'Let's set up your study goal'
// for an existing account that already completed onboarding." Root cause:
// saveOnboardingGoal deactivated every previous goal *before* inserting the
// new one, as two separate, non-transactional Supabase calls — any failure
// between them (an app kill, a dropped connection) left the account with
// zero active goals and no way back. These tests cover both halves of the
// fix: the insert now happens first, and getActiveGoal recovers (and
// reactivates) the most recent goal if none is marked active, instead of
// sending an existing user back through onboarding.
jest.mock('@/lib/env', () => ({
  ...jest.requireActual('@/lib/env'),
  isDemoMode: false,
  isSupabaseConfigured: true,
}));

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

function makeQueryBuilder(result: { data: any; error: any }) {
  const builder: any = {};
  const chainMethods = ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'order', 'limit'];
  for (const method of chainMethods) builder[method] = jest.fn().mockReturnValue(builder);
  builder.maybeSingle = jest.fn().mockResolvedValue(result);
  builder.single = jest.fn().mockResolvedValue(result);
  builder.then = (resolve: (v: any) => void) => resolve(result);
  return builder;
}

const fromMock = supabase!.from as jest.Mock;

describe('saveOnboardingGoal — inserts the new goal before deactivating old ones', () => {
  afterEach(() => jest.clearAllMocks());

  it('never deactivates any previous goal when the insert itself fails', async () => {
    fromMock.mockReturnValueOnce(makeQueryBuilder({ data: null, error: { message: 'permission denied for table user_goals', code: '42501' } }));
    await expect(
      saveOnboardingGoal('user-1', { ieltsType: 'academic', currentBand: null, targetBand: 7, examDate: null, weakestSkill: null, dailyStudyMinutes: 30 })
    ).rejects.toThrow(/Failed to save onboarding goal/);
    // Only the failed insert call happened — the old deactivate-first
    // ordering would have made a second `.from('user_goals')` call to
    // deactivate previous goals regardless of what came next.
    expect(fromMock).toHaveBeenCalledTimes(1);
  });

  it('saves the new goal and then deactivates previous ones, in that order', async () => {
    const insertBuilder = makeQueryBuilder({
      data: { id: 'goal-2', user_id: 'user-1', ielts_type: 'academic', current_band: null, target_band: 7, exam_date: null, weakest_skill: null, daily_study_minutes: 30, is_active: true, created_at: '2026-01-02T00:00:00.000Z' },
      error: null,
    });
    const deactivateBuilder = makeQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValueOnce(insertBuilder).mockReturnValueOnce(deactivateBuilder);

    const goal = await saveOnboardingGoal('user-1', { ieltsType: 'academic', currentBand: null, targetBand: 7, examDate: null, weakestSkill: null, dailyStudyMinutes: 30 });

    expect(goal.id).toBe('goal-2');
    expect(insertBuilder.insert).toHaveBeenCalled();
    expect(deactivateBuilder.update).toHaveBeenCalledWith({ is_active: false });
    // Excludes the row it just inserted, so the brand-new goal is never
    // immediately deactivated by its own cleanup step.
    expect(deactivateBuilder.neq).toHaveBeenCalledWith('id', 'goal-2');
  });

  it('still returns the newly-saved goal even if the deactivate-old-goals cleanup step fails', async () => {
    const insertBuilder = makeQueryBuilder({
      data: { id: 'goal-3', user_id: 'user-1', ielts_type: 'academic', current_band: null, target_band: 7, exam_date: null, weakest_skill: null, daily_study_minutes: 30, is_active: true, created_at: '2026-01-03T00:00:00.000Z' },
      error: null,
    });
    const deactivateBuilder = makeQueryBuilder({ data: null, error: { message: 'network error', code: 'ETIMEDOUT' } });
    fromMock.mockReturnValueOnce(insertBuilder).mockReturnValueOnce(deactivateBuilder);

    await expect(
      saveOnboardingGoal('user-1', { ieltsType: 'academic', currentBand: null, targetBand: 7, examDate: null, weakestSkill: null, dailyStudyMinutes: 30 })
    ).resolves.toMatchObject({ id: 'goal-3' });
  });
});

describe('getActiveGoal — recovers an existing account\'s goal even if it ended up with no row marked active', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns the active goal directly when one exists (the common case, unchanged)', async () => {
    const activeBuilder = makeQueryBuilder({
      data: { id: 'goal-1', user_id: 'user-1', ielts_type: 'academic', current_band: 6, target_band: 7, exam_date: null, weakest_skill: null, daily_study_minutes: 30, is_active: true, created_at: '2026-01-01T00:00:00.000Z' },
      error: null,
    });
    fromMock.mockReturnValueOnce(activeBuilder);
    const goal = await getActiveGoal('user-1');
    expect(goal?.id).toBe('goal-1');
    expect(fromMock).toHaveBeenCalledTimes(1);
  });

  it('recovers and reactivates the most recent goal when no row is marked active', async () => {
    const noActiveBuilder = makeQueryBuilder({ data: null, error: null });
    const anyGoalBuilder = makeQueryBuilder({
      data: { id: 'goal-old', user_id: 'user-1', ielts_type: 'academic', current_band: 6, target_band: 7, exam_date: null, weakest_skill: null, daily_study_minutes: 30, is_active: false, created_at: '2026-01-01T00:00:00.000Z' },
      error: null,
    });
    const reactivateBuilder = makeQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValueOnce(noActiveBuilder).mockReturnValueOnce(anyGoalBuilder).mockReturnValueOnce(reactivateBuilder);

    const goal = await getActiveGoal('user-1');
    expect(goal?.id).toBe('goal-old');
    expect(goal?.isActive).toBe(true);
    expect(reactivateBuilder.update).toHaveBeenCalledWith({ is_active: true });
  });

  it('returns null (genuinely no goal ever set up) when there is no row at all, active or not', async () => {
    const noActiveBuilder = makeQueryBuilder({ data: null, error: null });
    const noAnyGoalBuilder = makeQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValueOnce(noActiveBuilder).mockReturnValueOnce(noAnyGoalBuilder);
    await expect(getActiveGoal('user-1')).resolves.toBeNull();
  });

  it('still throws on a genuine query error rather than treating it as "recover a goal"', async () => {
    fromMock.mockReturnValueOnce(makeQueryBuilder({ data: null, error: { message: 'permission denied for table user_goals', code: '42501' } }));
    await expect(getActiveGoal('user-1')).rejects.toThrow(/permission denied for table user_goals/);
  });
});

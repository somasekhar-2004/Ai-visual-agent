import { supabase } from '@/lib/supabase';
import { getActiveGoal } from '@/services/repository/core';

// Regression coverage for "Home still shows 'Let's set up your study goal'
// for an existing account that already completed onboarding." getActiveGoal
// recovers (and reactivates) the most recent goal if none is marked active,
// instead of sending an existing user back through onboarding. This was
// originally paired with saveOnboardingGoal tests for its old
// insert-then-deactivate flow — that flow no longer exists (see migration
// 0013, uq_user_goals_one_active_per_user: saveOnboardingGoal now upserts
// the single current goal row in place) — see onboardingGoalRealMode.test.ts
// for the current saveOnboardingGoal coverage. The self-heal path below is
// kept as a legacy-recovery fallback for any account whose data predates
// that migration.
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

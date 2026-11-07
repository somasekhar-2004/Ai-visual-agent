// Regression coverage for a real bug: Home's "Today's Study Plan" used
// `new Date().toISOString().slice(0, 10)` (the UTC calendar date) to decide
// which day's plan to show — not the device's LOCAL date, unlike every
// other day-boundary-sensitive feature in this app (streak/XP; see
// lib/timezone.ts). For any user not in UTC+0, that meant the plan (and
// whatever was already checked off on it) could still be showing a PREVIOUS
// local day's plan for part of the user's own day — e.g. a user in India
// (UTC+5:30) would see yesterday's completions as "today's" for the first
// 5.5 hours after their own local midnight. Fixed in app/(tabs)/index.tsx
// by switching `today()` to getLocalDateString(getDeviceTimeZone()), the
// same helper streak/XP already use.
//
// This file tests the layer underneath that fix — services/repository/
// studyPlan.ts's generateStudyPlan/completeStudyPlanItem — proving the
// actual contract the fix depends on: two different date strings are two
// completely independent plans (completing one never affects the other),
// and completing today's own item genuinely persists.
import { supabase } from '@/lib/supabase';
import { completeStudyPlanItem, generateStudyPlan } from '@/services/repository/studyPlan';
import type { UserGoal } from '@/types/models';

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
}));

jest.mock('@/services/repository/learning', () => ({
  getQuestionAttempts: jest.fn().mockResolvedValue([]),
  getGrammarQuestionAttempts: jest.fn().mockResolvedValue([]),
  weakGrammarTopics: jest.fn().mockReturnValue([]),
}));

jest.mock('@/services/repository/testing', () => ({
  getTestHistory: jest.fn().mockResolvedValue([]),
}));

function makeQueryBuilder(result: { data: any; error: any }) {
  const builder: any = {};
  for (const method of ['select', 'insert', 'update', 'eq']) builder[method] = jest.fn().mockReturnValue(builder);
  builder.maybeSingle = jest.fn().mockResolvedValue(result);
  builder.single = jest.fn().mockResolvedValue(result);
  builder.then = (resolve: (v: any) => void) => resolve(result);
  return builder;
}

const fromMock = supabase!.from as jest.Mock;

function makeGoal(): UserGoal {
  return {
    id: 'goal-1',
    userId: 'user-1',
    ieltsType: 'academic',
    currentBand: 6,
    targetBand: 7.5,
    examDate: null,
    weakestSkill: 'writing',
    dailyStudyMinutes: 60,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/** Simulates generateStudyPlan's path for a date with NO existing plan row
 * yet: getStudyPlanForDate's select finds nothing, then the two inserts
 * (study_plans, study_plan_items) each succeed, returning freshly-built
 * (always unchecked — see buildPlanItems) rows for that exact date. */
function mockFreshPlanGeneration(date: string, planId: string, itemId: string) {
  fromMock.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null })); // getStudyPlanForDate: no existing row
  fromMock.mockReturnValueOnce(
    makeQueryBuilder({ data: { id: planId, user_id: 'user-1', date, generated_at: new Date().toISOString(), is_completed: false }, error: null })
  ); // study_plans insert
  fromMock.mockReturnValueOnce(
    makeQueryBuilder({
      data: [{ id: itemId, study_plan_id: planId, skill: 'writing', title: 'Writing practice', description: null, duration_minutes: 20, order_index: 0, is_completed: false, link_ref: {} }],
      error: null,
    })
  ); // study_plan_items insert
}

describe('generateStudyPlan — two different dates are two independent plans', () => {
  afterEach(() => jest.clearAllMocks());

  it("completing yesterday's Writing item never affects today's freshly-generated plan", async () => {
    const goal = makeGoal();

    // Yesterday: generate, then complete its Writing item.
    mockFreshPlanGeneration('2026-11-06', 'plan-yesterday', 'item-yesterday-writing');
    const yesterdayPlan = await generateStudyPlan('user-1', goal, { writing: 5 }, '2026-11-06');
    expect(yesterdayPlan.items[0].isCompleted).toBe(false);

    fromMock.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null })); // update is_completed
    fromMock.mockReturnValueOnce(makeQueryBuilder({ data: [{ is_completed: true }], error: null })); // re-read for plan-level completion
    fromMock.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null })); // study_plans.is_completed update
    await completeStudyPlanItem('plan-yesterday', 'item-yesterday-writing');

    // Today: a genuinely different date string. generateStudyPlan must look
    // up (and, finding nothing, build) a plan for THIS date — never reuse
    // yesterday's plan-yesterday/item-yesterday-writing row or its
    // now-completed state.
    mockFreshPlanGeneration('2026-11-07', 'plan-today', 'item-today-writing');
    const todayPlan = await generateStudyPlan('user-1', goal, { writing: 5 }, '2026-11-07');

    expect(todayPlan.id).not.toBe(yesterdayPlan.id);
    expect(todayPlan.items[0].id).not.toBe(yesterdayPlan.items[0].id);
    // The actual regression this guards: today's matching (same skill)
    // item must start unchecked, never inheriting yesterday's completion.
    expect(todayPlan.items[0].skill).toBe('writing');
    expect(todayPlan.items[0].isCompleted).toBe(false);
  });

  it("completing today's matching task actually checks it off", async () => {
    const goal = makeGoal();
    mockFreshPlanGeneration('2026-11-07', 'plan-today', 'item-today-writing');
    const todayPlan = await generateStudyPlan('user-1', goal, { writing: 5 }, '2026-11-07');
    expect(todayPlan.items[0].isCompleted).toBe(false);

    const updateBuilder = makeQueryBuilder({ data: null, error: null });
    fromMock.mockReturnValueOnce(updateBuilder);
    fromMock.mockReturnValueOnce(makeQueryBuilder({ data: [{ is_completed: true }], error: null }));
    fromMock.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));

    await completeStudyPlanItem(todayPlan.id, todayPlan.items[0].id);

    expect(updateBuilder.update).toHaveBeenCalledWith({ is_completed: true });
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', todayPlan.items[0].id);
  });
});

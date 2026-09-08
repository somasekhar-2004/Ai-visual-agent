import { buildPlanItems } from '@/services/repository/studyPlan';
import type { UserGoal } from '@/types/models';

function makeGoal(overrides: Partial<UserGoal>): UserGoal {
  return {
    id: 'goal1',
    userId: 'user1',
    ieltsType: 'academic',
    currentBand: 6,
    targetBand: 7.5,
    examDate: null,
    weakestSkill: 'writing',
    dailyStudyMinutes: 60,
    isActive: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('buildPlanItems', () => {
  it('gives the weakest skill the largest share of study time', () => {
    const items = buildPlanItems(makeGoal({ weakestSkill: 'writing' }), { writing: 5, reading: 7, listening: 7, speaking: 7 });
    const writing = items.find((i) => i.skill === 'writing')!;
    const others = items.filter((i) => i.skill !== 'writing');
    expect(writing.durationMinutes).toBeGreaterThan(others[0].durationMinutes);
  });

  it('produces one item per skill and the total is close to the daily budget', () => {
    const goal = makeGoal({ dailyStudyMinutes: 60 });
    const items = buildPlanItems(goal, {});
    expect(items).toHaveLength(4);
    const total = items.reduce((sum, i) => sum + i.durationMinutes, 0);
    expect(total).toBeGreaterThanOrEqual(50);
    expect(total).toBeLessThanOrEqual(70);
  });

  it('falls back to the lowest-band skill when weakestSkill is not set', () => {
    const goal = makeGoal({ weakestSkill: null });
    const items = buildPlanItems(goal, { listening: 8, reading: 8, writing: 5, speaking: 8 });
    expect(items[0].skill).toBe('writing');
  });
});

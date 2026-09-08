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

  it('recommends the specific weak question type instead of a generic description', () => {
    const items = buildPlanItems(makeGoal({ weakestSkill: 'reading' }), { reading: 5 }, { weakQuestionTypeBySkill: { reading: 'matching_headings' } });
    const reading = items.find((i) => i.skill === 'reading')!;
    expect(reading.description).toContain('matching headings');
    expect(reading.linkRef).toMatchObject({ questionType: 'matching_headings' });
  });

  it('recommends a Task 2 focus tied to the weakest writing criterion', () => {
    const items = buildPlanItems(makeGoal({ weakestSkill: 'writing' }), { writing: 5 }, { weakWritingCriterion: 'lexicalResource' });
    const writing = items.find((i) => i.skill === 'writing')!;
    expect(writing.description).toContain('Lexical Resource');
  });

  it('adds a grammar review item when a weak grammar topic is known', () => {
    const items = buildPlanItems(makeGoal({}), {}, { weakGrammarTopic: 'Subject-Verb Agreement' });
    const grammarItem = items.find((i) => i.title.includes('Grammar review'));
    expect(grammarItem).toBeDefined();
    expect(grammarItem?.linkRef).toMatchObject({ grammarTopic: 'Subject-Verb Agreement' });
  });

  it('adds a full mock test recommendation when the exam is within 14 days', () => {
    const soon = new Date(Date.now() + 5 * 86_400_000).toISOString().slice(0, 10);
    const items = buildPlanItems(makeGoal({ examDate: soon }), {});
    expect(items.some((i) => i.linkRef.mockRecommended)).toBe(true);
  });

  it('does not add a mock recommendation when the exam is far away', () => {
    const far = new Date(Date.now() + 60 * 86_400_000).toISOString().slice(0, 10);
    const items = buildPlanItems(makeGoal({ examDate: far }), {});
    expect(items.some((i) => i.linkRef.mockRecommended)).toBe(false);
  });
});

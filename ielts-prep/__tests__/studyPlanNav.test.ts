import { studyPlanItemTarget } from '@/lib/studyPlanNav';
import type { StudyPlanItem } from '@/types/models';

function item(overrides: Partial<StudyPlanItem>): StudyPlanItem {
  return {
    id: 'i1',
    studyPlanId: 'p1',
    skill: 'reading',
    title: 'Item',
    description: null,
    durationMinutes: 20,
    orderIndex: 0,
    isCompleted: false,
    linkRef: {},
    ...overrides,
  };
}

describe('studyPlanItemTarget', () => {
  it('routes a grammar-review item to grammar-practice with its topic', () => {
    const target = studyPlanItemTarget(item({ skill: 'reading', linkRef: { grammarTopic: 'subject-verb agreement' } }));
    expect(target).toEqual({ pathname: '/grammar-practice', params: { topic: 'subject-verb agreement' } });
  });

  it('routes a mock-recommended item to the Tests tab', () => {
    const target = studyPlanItemTarget(item({ skill: 'reading', linkRef: { mockRecommended: true } }));
    expect(target.pathname).toBe('/(tabs)/tests');
  });

  it('routes a writing item to writing-prompts, not practice-session', () => {
    const target = studyPlanItemTarget(item({ skill: 'writing', linkRef: { skill: 'writing', taskType: 'task2', criterion: 'lexicalResource' } }));
    expect(target.pathname).toBe('/writing-prompts');
  });

  it('routes a speaking item to speaking-session with its part', () => {
    const target = studyPlanItemTarget(item({ skill: 'speaking', linkRef: { skill: 'speaking', part: 'part2', criterion: 'fluencyCoherence' } }));
    expect(target).toEqual({ pathname: '/speaking-session', params: { part: 'part2' } });
  });

  it('routes a reading item with a weak question type to practice-session with that filter', () => {
    const target = studyPlanItemTarget(item({ skill: 'reading', linkRef: { skill: 'reading', questionType: 'matching_headings' } }));
    expect(target).toEqual({ pathname: '/practice-session', params: { skill: 'reading', questionType: 'matching_headings' } });
  });

  it('falls back to a plain skill-filtered practice session when linkRef only has a skill', () => {
    const target = studyPlanItemTarget(item({ skill: 'listening', linkRef: { skill: 'listening' } }));
    expect(target).toEqual({ pathname: '/practice-session', params: { skill: 'listening' } });
  });
});

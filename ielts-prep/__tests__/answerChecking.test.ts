import { isAnswerCorrect } from '@/lib/answerChecking';
import type { Question } from '@/types/models';

function makeQuestion(overrides: Partial<Question>): Question {
  return {
    id: 'q1',
    skill: 'reading',
    questionType: 'short_answer',
    topic: null,
    difficulty: 'medium',
    estimatedBand: 6,
    prompt: 'Test prompt',
    passageId: null,
    listeningTrackId: null,
    options: null,
    correctAnswer: 'answer',
    explanation: null,
    strategyNote: null,
    tags: [],
    estimatedTimeSeconds: 30,
    orderIndex: 0,
    isPremium: false,
    ...overrides,
  };
}

describe('isAnswerCorrect', () => {
  it('matches a single correct string case-insensitively and trims whitespace', () => {
    const q = makeQuestion({ correctAnswer: 'Marlow' });
    expect(isAnswerCorrect(q, '  marlow  ')).toBe(true);
    expect(isAnswerCorrect(q, 'wrong')).toBe(false);
  });

  it('accepts any of several acceptable answers when correctAnswer is an array', () => {
    const q = makeQuestion({ correctAnswer: ['sundew', 'the sundew'] });
    expect(isAnswerCorrect(q, 'the SunDew')).toBe(true);
    expect(isAnswerCorrect(q, 'sundew')).toBe(true);
    expect(isAnswerCorrect(q, 'daisy')).toBe(false);
  });

  it('returns false for a null answer', () => {
    const q = makeQuestion({ correctAnswer: 'answer' });
    expect(isAnswerCorrect(q, null)).toBe(false);
  });

  it('normalises internal whitespace before comparing', () => {
    const q = makeQuestion({ correctAnswer: 'square kilometre' });
    expect(isAnswerCorrect(q, 'square   kilometre')).toBe(true);
  });
});

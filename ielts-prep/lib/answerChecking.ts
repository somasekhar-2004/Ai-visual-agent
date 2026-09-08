import type { Question } from '@/types/models';

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function isAnswerCorrect(question: Question, userAnswer: string | string[] | null): boolean {
  if (userAnswer === null) return false;
  const correct = question.correctAnswer;

  if (Array.isArray(correct)) {
    const accepted = correct.map(normalize);
    const answer = Array.isArray(userAnswer) ? userAnswer.map(normalize) : [normalize(userAnswer)];
    return answer.some((a) => accepted.includes(a));
  }

  const answer = Array.isArray(userAnswer) ? userAnswer.map(normalize) : [normalize(userAnswer)];
  return answer.includes(normalize(correct));
}

export function usesFreeTextInput(question: Question): boolean {
  return !question.options || question.options.length === 0;
}

export const TFNG_OPTIONS = ['TRUE', 'FALSE', 'NOT GIVEN'];
export const YNNG_OPTIONS = ['YES', 'NO', 'NOT GIVEN'];

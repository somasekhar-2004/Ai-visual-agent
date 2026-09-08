import { getQuestionById } from '@/services/repository/learning';
import type { QuestionAttempt, TestHistoryEntry } from '@/types/models';

export function overallAccuracy(attempts: QuestionAttempt[]): number {
  if (attempts.length === 0) return 0;
  return attempts.filter((a) => a.isCorrect).length / attempts.length;
}

export function accuracyByQuestionType(attempts: QuestionAttempt[]): { type: string; accuracy: number; count: number }[] {
  const byType = new Map<string, { correct: number; total: number }>();
  for (const attempt of attempts) {
    const question = getQuestionById(attempt.questionId);
    const type = question?.questionType ?? 'unknown';
    const entry = byType.get(type) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (attempt.isCorrect) entry.correct += 1;
    byType.set(type, entry);
  }
  return Array.from(byType.entries())
    .map(([type, { correct, total }]) => ({ type, accuracy: total ? correct / total : 0, count: total }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

/** Counts activity entries per day for the last `days` days, oldest first. */
export function weeklyActivityCounts(history: TestHistoryEntry[], days = 7): { date: string; count: number }[] {
  const buckets: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.push({ date: key, count: 0 });
  }
  const byDate = new Map(buckets.map((b) => [b.date, b]));
  for (const entry of history) {
    const key = entry.createdAt.slice(0, 10);
    const bucket = byDate.get(key);
    if (bucket) bucket.count += 1;
  }
  return buckets;
}

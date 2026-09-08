import { getQuestionById } from '@/services/repository/learning';
import type { QuestionAttempt, SkillKey, TestHistoryEntry } from '@/types/models';

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

/** The single worst-performing question type within one skill (min 2
 * attempts of that type, so a single lucky/unlucky guess doesn't dominate)
 * — used to recommend a specific, real weak area instead of a generic
 * "practice reading" suggestion. */
export function weakestQuestionType(attempts: QuestionAttempt[], skill: SkillKey): string | null {
  const skillAttempts = attempts.filter((a) => getQuestionById(a.questionId)?.skill === skill);
  const byType = accuracyByQuestionType(skillAttempts).filter((t) => t.count >= 2);
  return byType[0]?.type ?? null;
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

/** Total activity count in the last `days` days (for 7-day vs 30-day comparison). */
export function activityCountInWindow(history: TestHistoryEntry[], days: number): number {
  const cutoff = Date.now() - days * 86_400_000;
  return history.filter((h) => new Date(h.createdAt).getTime() >= cutoff).length;
}

/** Best-effort total minutes studied, summed from whatever activities
 * recorded a `timeSpentSeconds` (Reading, Writing) — Listening and Speaking
 * do not currently record elapsed time per attempt, so this under-counts
 * rather than over-counts. Labelled as an estimate wherever it is shown. */
export function estimatedMinutesStudied(history: TestHistoryEntry[]): number {
  const totalSeconds = history.reduce((sum, h) => {
    const t = h.summary.timeSpentSeconds;
    return sum + (typeof t === 'number' ? t : 0);
  }, 0);
  return Math.round(totalSeconds / 60);
}

export function weakestAndStrongestSkill(bandBySkill: Partial<Record<SkillKey, number>>): { weakest: SkillKey | null; strongest: SkillKey | null } {
  const entries = (Object.entries(bandBySkill) as [SkillKey, number | undefined][]).filter((e): e is [SkillKey, number] => typeof e[1] === 'number');
  if (entries.length === 0) return { weakest: null, strongest: null };
  const sorted = [...entries].sort((a, b) => a[1] - b[1]);
  return { weakest: sorted[0][0], strongest: sorted[sorted.length - 1][0] };
}

/** Trend of a single numeric criterion (e.g. "lexicalResource") from
 * writing/speaking test_history summaries, most recent last — for a simple
 * per-criterion progress line. */
export function criterionTrend(history: TestHistoryEntry[], activityType: 'writing' | 'speaking', criterion: string): number[] {
  return history
    .filter((h) => h.activityType === activityType && typeof h.summary[criterion] === 'number')
    .slice()
    .reverse() // history is fetched newest-first; charts read oldest-first
    .map((h) => h.summary[criterion] as number);
}

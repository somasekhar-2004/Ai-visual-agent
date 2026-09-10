import type { QuestionAttempt, TestHistoryEntry } from '@/types/models';

// Free-tier daily limits. Premium users (see useAppStore.subscription) have
// none of these limits — always check isPremium before consulting this
// module. Kept as named constants (not magic numbers scattered across
// screens) so the whole free/premium boundary is visible and adjustable in
// one place.
export const FREE_DAILY_PRACTICE_QUESTIONS = 20;
export const FREE_DAILY_AI_MESSAGES = 5;
// Practice-only — Full Mock Writing/Speaking has its own, separate,
// deliberately more generous server-side allowance (see
// supabase/functions/_shared/rateLimit.ts) so using up today's Practice
// evaluations never blocks completing or retaking a Full Mock. These
// numbers exist to hide the "Evaluate" button before a free user wastes a
// request — the real enforcement is server-side and does not read these.
export const FREE_DAILY_WRITING_PRACTICE_EVALS = 10;
export const FREE_DAILY_SPEAKING_PRACTICE_EVALS = 10;
export const FREE_VOCABULARY_TOPIC_LIMIT = 4;
export const FREE_GRAMMAR_LESSON_LIMIT = 6;

function isToday(iso: string): boolean {
  return iso.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

export function practiceQuestionsUsedToday(attempts: QuestionAttempt[]): number {
  return attempts.filter((a) => isToday(a.createdAt)).length;
}

export function activityUsedToday(history: TestHistoryEntry[], activityType: TestHistoryEntry['activityType']): number {
  return history.filter((h) => h.activityType === activityType && isToday(h.createdAt)).length;
}

export type DailyLimitStatus = { allowed: boolean; used: number; limit: number };

export function checkDailyLimit(used: number, limit: number, isPremium: boolean): DailyLimitStatus {
  if (isPremium) return { allowed: true, used, limit: Infinity };
  return { allowed: used < limit, used, limit };
}

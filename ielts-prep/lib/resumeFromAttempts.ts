/**
 * Server-side resume fallback for Quick Practice (app/practice-session.tsx)
 * — used only when there is no LOCAL (AsyncStorage) saved session to resume
 * from, which is exactly the case right after a reinstall: the device's
 * local storage is gone, but the user's real question_attempts rows on the
 * server are not.
 *
 * Deliberately NEVER infers a resume point from a lifetime attempt count
 * (e.g. "23 completed questions overall, so start at Q24") — that count
 * spans every skill/mode/difficulty combination the user has ever
 * practiced, not this exact filtered question list, and the user may not
 * have attempted this list's questions in order (or at all) even if their
 * lifetime total is high. Instead, this walks THIS screen's own, already
 * fully-filtered `questions` array in its real order and checks each one
 * individually against the user's real attempts by question id — the same
 * "next unanswered question in this exact list" contract the local
 * (same-install) resume path already guarantees, just sourced from the
 * server instead of AsyncStorage.
 */
export function deriveResumeFromAttempts<Q extends { id: string }>(
  questions: Q[],
  attempts: { questionId: string; isCorrect: boolean; createdAt: string }[]
): boolean[] {
  // A question can have more than one attempt (the user got it wrong, then
  // retried) — only the MOST RECENT attempt per question id matters for
  // resuming; a stale earlier wrong/right answer must never override it.
  const latestByQuestionId = new Map<string, { isCorrect: boolean; createdAt: string }>();
  for (const attempt of attempts) {
    const existing = latestByQuestionId.get(attempt.questionId);
    if (!existing || new Date(attempt.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
      latestByQuestionId.set(attempt.questionId, attempt);
    }
  }

  // Walks the list IN ORDER and stops at the first question with no
  // matching attempt — mirrors the local-resume invariant exactly
  // (results.length === the index of the next unanswered question). A gap
  // (e.g. question 3 attempted but question 2 wasn't — possible if the
  // underlying question order ever changed) is treated as "resume at the
  // first gap," never skipped over, so nothing already-answered is ever
  // silently re-asked out of order and nothing unanswered is ever skipped.
  const results: boolean[] = [];
  for (const question of questions) {
    const attempt = latestByQuestionId.get(question.id);
    if (!attempt) break;
    results.push(attempt.isCorrect);
  }
  return results;
}

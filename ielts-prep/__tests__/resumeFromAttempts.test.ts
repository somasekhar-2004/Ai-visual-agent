// Regression coverage for the Reading/Listening-after-reinstall bug: Home
// correctly kept the user's lifetime completed-question count after a
// reinstall (that's server data), but Quick Practice always restarted at
// Question 1 for any skill/filter, because its ONLY resume mechanism was
// AsyncStorage — wiped along with the rest of the app's local storage on
// reinstall. deriveResumeFromAttempts (app/practice-session.tsx's
// server-side fallback for exactly this case) must resume using the real
// question_attempts rows matching THIS exact filtered question list — never
// a lifetime count across every skill/filter the user has ever practiced.
import { deriveResumeFromAttempts } from '@/lib/resumeFromAttempts';

function attempt(questionId: string, isCorrect: boolean, createdAt: string) {
  return { questionId, isCorrect, createdAt };
}

describe('deriveResumeFromAttempts', () => {
  it('returns an empty resume (start at Q1) when nothing in this question list has been attempted', () => {
    const questions = [{ id: 'q1' }, { id: 'q2' }];
    expect(deriveResumeFromAttempts(questions, [])).toEqual([]);
  });

  it('resumes after the questions that were genuinely attempted, in list order', () => {
    const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }, { id: 'q4' }];
    const attempts = [attempt('q1', true, '2026-11-01T00:00:00Z'), attempt('q2', false, '2026-11-01T00:01:00Z')];
    const resumed = deriveResumeFromAttempts(questions, attempts);
    expect(resumed).toEqual([true, false]);
    // index = resumed.length, matching practice-session.tsx's own
    // "results.length is the next unanswered question" invariant.
    expect(resumed.length).toBe(2); // resumes at q3
  });

  it('never infers progress from a lifetime count across OTHER skills/filters — only this exact question list matters', () => {
    const questions = [{ id: 'reading-q1' }, { id: 'reading-q2' }];
    // A large, totally unrelated attempt history (e.g. 23 lifetime
    // attempts across listening/writing/speaking/other reading filters) —
    // none of these ids appear in THIS screen's question list at all.
    const unrelatedAttempts = Array.from({ length: 23 }, (_, i) => attempt(`other-question-${i}`, true, '2026-11-01T00:00:00Z'));
    expect(deriveResumeFromAttempts(questions, unrelatedAttempts)).toEqual([]);
  });

  it('stops at the first gap rather than skipping over an unattempted question', () => {
    const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }];
    // q1 attempted, q2 NOT attempted, q3 attempted (e.g. a bookmark/filter
    // reordering edge case) — resume must land on q2, never silently skip
    // it just because something later was already done.
    const attempts = [attempt('q1', true, '2026-11-01T00:00:00Z'), attempt('q3', true, '2026-11-01T00:02:00Z')];
    expect(deriveResumeFromAttempts(questions, attempts)).toEqual([true]);
  });

  it('uses only the MOST RECENT attempt for a question that was retried, not an earlier one', () => {
    const questions = [{ id: 'q1' }, { id: 'q2' }];
    const attempts = [
      attempt('q1', false, '2026-11-01T00:00:00Z'), // first try: wrong
      attempt('q1', true, '2026-11-01T00:05:00Z'), // retried: correct
    ];
    const resumed = deriveResumeFromAttempts(questions, attempts);
    expect(resumed).toEqual([true]);
  });

  it('resumes with every question already attempted (results.length === questions.length, session complete)', () => {
    const questions = [{ id: 'q1' }, { id: 'q2' }];
    const attempts = [attempt('q1', true, '2026-11-01T00:00:00Z'), attempt('q2', true, '2026-11-01T00:01:00Z')];
    expect(deriveResumeFromAttempts(questions, attempts)).toEqual([true, true]);
  });
});

// Below this floor there simply isn't enough written text to assess Task
// Achievement/Response, Coherence, Lexical Resource, or Grammatical Range —
// distinct from (and much lower than) a prompt's `minWords`, which is a
// content-completeness target: a 90-word Task 2 response (under the
// 250-word minimum) is still genuinely assessable, and real IELTS marking
// still rates all four criteria on it (capping Task Response for being
// underdeveloped) rather than refusing to score it. This floor exists only
// to catch inputs with essentially no linguistic content to judge at all —
// a blank submission, a single sentence, a handful of words.
const MIN_WORDS_FOR_A_BAND = 20;

export type WritingEvidenceResult =
  | { sufficient: true }
  | { sufficient: false; reason: string; explanation: string };

/**
 * The mandatory gate a Writing submission must pass before any IELTS band
 * is produced — by either the real AI evaluator or the offline heuristic
 * mock. Runs before evaluateWriting() is ever called. A near-empty essay
 * must never receive a normal-looking band: the heuristic mock in
 * particular can look confident on very little text (e.g. a handful of
 * all-distinct words spikes its vocabulary-richness signal), so the gate
 * has to sit in front of every provider, not inside any one of them.
 */
export function assessWritingEvidence(wordCount: number): WritingEvidenceResult {
  if (wordCount >= MIN_WORDS_FOR_A_BAND) return { sufficient: true };
  return {
    sufficient: false,
    reason: wordCount === 0 ? 'No response was written — there is nothing to assess yet.' : 'Not enough written English to estimate an IELTS Writing band yet.',
    explanation: 'Write a complete response so we can assess task achievement, coherence, vocabulary and grammar.',
  };
}

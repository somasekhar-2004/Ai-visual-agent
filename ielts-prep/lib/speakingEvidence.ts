import { countWords } from '@/lib/textAnalysis';

// The exact placeholder the transcription prompt is instructed to emit for
// a turn with no discernible speech (see
// supabase/functions/_shared/prompts.ts's buildTranscriptionPromptText) —
// stripped out before counting real words so it can never be mistaken for
// spoken content.
const NO_SPEECH_MARKER = /\[no speech detected\]/gi;

// A turn needs at least this many real words to count as a genuine,
// assessable answer rather than an isolated word or two ("car", "yes").
// Chosen well below a real IELTS answer's expected length so a legitimately
// short-but-real answer is never penalised — this only screens out answers
// with essentially no linguistic content to judge fluency, vocabulary, or
// grammar from at all.
const MIN_WORDS_PER_SUBSTANTIVE_TURN = 4;

// Across an entire Speaking attempt (all turns combined), this is the floor
// below which there simply isn't enough language sampled to rate all four
// IELTS criteria — well under what even a single real Part 1 answer would
// produce, so it only catches near-silent/near-empty attempts.
const MIN_TOTAL_WORDS = 15;

export type SpeakingEvidenceResult =
  | { sufficient: true }
  | { sufficient: false; reason: string; explanation: string };

/** Strips transcription placeholders and collapses whitespace, so word
 * counts and substance checks only ever see actual spoken content. */
function stripPlaceholders(text: string): string {
  return text.replace(NO_SPEECH_MARKER, ' ').trim();
}

/**
 * The mandatory gate a Speaking attempt must pass before any IELTS band is
 * produced — by either the real AI evaluator or the offline heuristic mock.
 * Runs entirely client-side, before evaluateSpeaking() is ever called, so no
 * provider (real or mock) can be asked to rate speech that isn't really
 * there. This is what a real-device bug slipped past: a near-silent
 * recording ("Yeah. Gods [no speech detected] [no speech detected]") was
 * sent straight to evaluation, and when the real provider call failed, the
 * app quietly substituted a heuristic mock score instead of ever asking
 * "was there enough evidence here in the first place?"
 *
 * Uses several independent signals, not just a single transcript word
 * count, per the product requirement that one signal alone (e.g. total
 * words) can be gamed or coincidentally satisfied by noise/filler:
 *  - total real words across every turn (placeholders stripped)
 *  - how many turns/questions actually got a substantive answer
 *  - the proportion of turns that produced no speech at all
 */
export function assessSpeakingEvidence(perTurnTranscripts: string[]): SpeakingEvidenceResult {
  const turns = perTurnTranscripts.length > 0 ? perTurnTranscripts : [''];
  const stripped = turns.map(stripPlaceholders);
  const wordsPerTurn = stripped.map(countWords);
  const totalWords = wordsPerTurn.reduce((sum, n) => sum + n, 0);
  const substantiveTurns = wordsPerTurn.filter((n) => n >= MIN_WORDS_PER_SUBSTANTIVE_TURN).length;
  const noSpeechTurns = stripped.filter((t) => t.length === 0).length;
  const noSpeechProportion = noSpeechTurns / turns.length;

  const insufficient = totalWords < MIN_TOTAL_WORDS || substantiveTurns === 0 || noSpeechProportion > 0.5;

  if (!insufficient) return { sufficient: true };

  return {
    sufficient: false,
    reason: 'Not enough spoken English to estimate an IELTS Speaking band yet.',
    explanation: 'Try again and give complete answers so we can assess fluency, vocabulary, grammar and pronunciation.',
  };
}

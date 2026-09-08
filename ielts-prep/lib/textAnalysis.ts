export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countSentences(text: string): number {
  const matches = text.match(/[^.!?]+[.!?]+/g);
  return matches ? matches.length : text.trim() ? 1 : 0;
}

export function uniqueWordRatio(text: string): number {
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  if (words.length === 0) return 0;
  return new Set(words).size / words.length;
}

export function countPhraseMatches(text: string, phrases: string[]): number {
  const lower = text.toLowerCase();
  return phrases.reduce((count, phrase) => {
    const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lower.match(regex);
    return count + (matches?.length ?? 0);
  }, 0);
}

export const LINKING_WORDS = [
  'however', 'moreover', 'furthermore', 'in addition', 'therefore', 'consequently',
  'although', 'because', 'despite', 'on the other hand', 'as a result', 'in contrast',
  'for example', 'for instance', 'nevertheless', 'in conclusion', 'to conclude', 'overall',
];

export const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'sort of', 'kind of', 'basically', 'actually'];

export const SUBORDINATING_CONJUNCTIONS = [
  'because', 'although', 'since', 'while', 'if', 'unless', 'whereas', 'even though', 'though',
];

/** Clamps and rounds a raw heuristic score to a plausible IELTS band value (whole or half). */
export function clampToBand(value: number, min = 4, max = 8.5): number {
  const clamped = Math.max(min, Math.min(max, value));
  return Math.round(clamped * 2) / 2;
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'to', 'of', 'in', 'on', 'at', 'for', 'with', 'as', 'by', 'that', 'this', 'these', 'those',
  'it', 'its', 'i', 'you', 'he', 'she', 'we', 'they', 'my', 'your', 'his', 'her', 'our', 'their',
  'not', 'no', 'so', 'if', 'then', 'than', 'there', 'here', 'do', 'does', 'did', 'have', 'has',
  'had', 'will', 'would', 'can', 'could', 'should', 'may', 'might', 'must', 'about', 'from',
  'into', 'also', 'very', 'more', 'most', 'some', 'many', 'much', 'other', 'which', 'who',
  'what', 'when', 'where', 'how', 'why', 'because', 'just', 'me', 'us', 'them',
]);

/** Content words (stopwords excluded) that appear frequently enough that a
 * synonym swap would genuinely help Lexical Resource — real repetition
 * detection, not a made-up list. */
export function findRepeatedWords(text: string, minCount = 4, limit = 5): { word: string; count: number }[] {
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  const counts = new Map<string, number>();
  for (const w of words) {
    if (w.length < 4 || STOPWORDS.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

/** Very long sentences (25+ words) are a common source of run-on/grammar
 * errors and are worth flagging individually rather than only as an
 * aggregate "average sentence length" statistic. Returns up to `limit`. */
export function findLongSentences(text: string, minWords = 25, limit = 3): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? (text.trim() ? [text.trim()] : []);
  return sentences
    .map((s) => s.trim())
    .filter((s) => countWords(s) >= minWords)
    .slice(0, limit);
}

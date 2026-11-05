/**
 * Deterministic operation IDs for AI evaluation/transcription calls — see
 * the Bandpath recovery handover's item 5 ("Writing/Speaking AI
 * reliability"). The problem this fixes: retrying a failed evaluateWriting/
 * evaluateSpeaking/transcribeAudio call with a fresh, random request ID made
 * every retry look like a brand-new operation to the server, so a provider
 * failure that happened *after* the model had actually produced a result
 * (or a slow-but-eventually-successful call the client gave up on) could be
 * paid for and attempted again from scratch — exactly the "intermittent
 * errors, then success on retry" pattern the handover describes.
 *
 * The fix is for the *client* to derive a stable ID from the exact content
 * being submitted, so retrying unchanged content reuses the same ID (lets
 * the already-deployed server-side claim/cache logic recognise it as the
 * same operation) while genuinely different content (an edited essay, a
 * re-recorded answer) naturally gets a different ID with no extra
 * bookkeeping. This file only computes that ID — it has no knowledge of,
 * and makes no assumptions about, what the server does with it.
 *
 * Not a cryptographic hash: operation IDs only need to be stable and
 * practically collision-free for this one essay/transcript against this
 * one user's other submissions, not resistant to deliberate forgery.
 * FNV-1a (32-bit, applied twice over disjoint seeds for 64 bits of output)
 * is a standard, fast, dependency-free choice for exactly that.
 */
function fnv1a32(input: string, seed: number): number {
  let hash = seed;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Hashes an ordered list of string parts into a stable hex ID. Parts are
 * joined with a separator that cannot appear inside any part's own content
 * by construction (a NUL byte), so distinct part boundaries never collide
 * (e.g. parts ['ab', 'c'] vs ['a', 'bc'] hash differently). */
export function stableOperationId(parts: (string | number | null | undefined)[]): string {
  const joined = parts.map((p) => (p ?? '')).join('\u0000');
  const high = fnv1a32(joined, 0x811c9dc5);
  const low = fnv1a32(joined, 0x12345678);
  return `${high.toString(16).padStart(8, '0')}${low.toString(16).padStart(8, '0')}`;
}

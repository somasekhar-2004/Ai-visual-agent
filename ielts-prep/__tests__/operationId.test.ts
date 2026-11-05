// Regression coverage for the Bandpath recovery handover's item 5
// ("Writing/Speaking AI reliability"): retrying a failed evaluateWriting/
// evaluateSpeaking/transcribeAudio call with a fresh random ID made every
// retry look like a brand-new operation to the server. lib/operationId.ts's
// stableOperationId derives a content-stable ID instead, so retrying
// unchanged content reuses the same ID while genuinely different content
// gets a different one.
import { stableOperationId } from '@/lib/operationId';

describe('stableOperationId', () => {
  it('is deterministic — the exact same parts always produce the exact same ID (a retry of unchanged content)', () => {
    const a = stableOperationId(['user-1', 'prompt-1', null, 'My essay text.']);
    const b = stableOperationId(['user-1', 'prompt-1', null, 'My essay text.']);
    expect(a).toBe(b);
  });

  it('changes when the actual content changes (an edited essay is a genuinely new submission)', () => {
    const original = stableOperationId(['user-1', 'prompt-1', null, 'My essay text.']);
    const edited = stableOperationId(['user-1', 'prompt-1', null, 'My edited essay text.']);
    expect(edited).not.toBe(original);
  });

  it('treats null and undefined the same way a missing optional part would be', () => {
    const withNull = stableOperationId(['user-1', null, 'x']);
    const withUndefined = stableOperationId(['user-1', undefined, 'x']);
    expect(withNull).toBe(withUndefined);
  });

  it('never collides two different part-boundary splits of the same concatenated characters', () => {
    const a = stableOperationId(['ab', 'c']);
    const b = stableOperationId(['a', 'bc']);
    expect(a).not.toBe(b);
  });

  it('is sensitive to which user/prompt/session the content belongs to, not just the content itself', () => {
    const userA = stableOperationId(['user-a', 'prompt-1', 'Same text']);
    const userB = stableOperationId(['user-b', 'prompt-1', 'Same text']);
    expect(userA).not.toBe(userB);
  });

  it('returns a non-empty, stable-length hex string', () => {
    const id = stableOperationId(['x']);
    expect(id).toMatch(/^[0-9a-f]{16}$/);
  });
});

import { assessWritingEvidence } from '@/lib/writingEvidence';

describe('assessWritingEvidence — the mandatory gate before any Writing band is produced', () => {
  it('rejects a blank submission', () => {
    const result = assessWritingEvidence(0);
    expect(result.sufficient).toBe(false);
    if (!result.sufficient) expect(result.reason).toMatch(/no response was written/i);
  });

  it('rejects a 5-word response', () => {
    expect(assessWritingEvidence(5).sufficient).toBe(false);
  });

  it('rejects a 19-word response (just under the floor)', () => {
    expect(assessWritingEvidence(19).sufficient).toBe(false);
  });

  it('accepts a response right at the floor', () => {
    expect(assessWritingEvidence(20).sufficient).toBe(true);
  });

  it('accepts a substantive short response even if below the prompt minimum word count', () => {
    // A 90-word Task 2 answer is under the 250-word minimum but is still
    // genuinely assessable — real IELTS marking still rates it (capping
    // Task Response), it does not refuse to score it. Distinct from the
    // separate "below minimum word count" warning shown before submission.
    expect(assessWritingEvidence(90).sufficient).toBe(true);
  });

  it('gives a distinct reason for blank vs. merely tiny', () => {
    const blank = assessWritingEvidence(0);
    const tiny = assessWritingEvidence(5);
    expect(blank.sufficient).toBe(false);
    expect(tiny.sufficient).toBe(false);
    if (!blank.sufficient && !tiny.sufficient) expect(blank.reason).not.toBe(tiny.reason);
  });
});

import { assessSpeakingEvidence } from '@/lib/speakingEvidence';

// Regression coverage for the release-blocking bug: a real-device recording
// containing essentially no speech ("Yeah. Gods [no speech detected]
// [no speech detected]") produced a full Overall Band 5.5 with fabricated
// criteria. This gate must run before any provider (real or mock) is ever
// asked to score an attempt, so it is tested entirely independent of
// services/ai.
describe('assessSpeakingEvidence — the mandatory gate before any Speaking band is produced', () => {
  it('rejects the exact real-device transcript that triggered this audit', () => {
    const result = assessSpeakingEvidence(['Yeah.', 'Gods', '[no speech detected]', '[no speech detected]']);
    expect(result.sufficient).toBe(false);
  });

  it('rejects total silence', () => {
    expect(assessSpeakingEvidence(['[no speech detected]', '[no speech detected]']).sufficient).toBe(false);
  });

  it('rejects a single isolated word', () => {
    expect(assessSpeakingEvidence(['car']).sufficient).toBe(false);
  });

  it('rejects "yes"/"no" style one-word answers across every turn', () => {
    expect(assessSpeakingEvidence(['yes', 'no', 'yes']).sufficient).toBe(false);
  });

  it('rejects a handful of isolated words spread across turns with no connected speech', () => {
    expect(assessSpeakingEvidence(['car', 'nice', 'good', 'ok']).sufficient).toBe(false);
  });

  it('rejects mostly "[no speech detected]" even with one short real turn', () => {
    const result = assessSpeakingEvidence(['I like it.', '[no speech detected]', '[no speech detected]', '[no speech detected]']);
    expect(result.sufficient).toBe(false);
  });

  it('accepts a genuinely extended, connected response', () => {
    const result = assessSpeakingEvidence([
      'I think this topic is quite interesting because it relates to my own experience growing up in a small town.',
      'For example, when I was younger I often thought about moving to a bigger city for university, and it has shaped how I see things today.',
    ]);
    expect(result.sufficient).toBe(true);
  });

  it('accepts several short but substantive answers that together clear the floor', () => {
    const result = assessSpeakingEvidence([
      'I usually spend my weekends visiting my family and relaxing at home.',
      'My hometown is a small coastal city with a lot of fishing boats.',
      'I would say the biggest change recently has been more tourism.',
    ]);
    expect(result.sufficient).toBe(true);
  });

  it('gives a user-facing reason and explanation, never a band, when insufficient', () => {
    const result = assessSpeakingEvidence(['car']);
    expect(result.sufficient).toBe(false);
    if (!result.sufficient) {
      expect(result.reason).toBe('Not enough spoken English to estimate an IELTS Speaking band yet.');
      expect(result.explanation).toMatch(/complete answers/i);
    }
  });

  it('handles an empty array of turns without throwing', () => {
    expect(() => assessSpeakingEvidence([])).not.toThrow();
    expect(assessSpeakingEvidence([]).sufficient).toBe(false);
  });
});

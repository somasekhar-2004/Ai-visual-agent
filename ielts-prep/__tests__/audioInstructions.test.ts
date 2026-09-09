import { buildTurnInstructions } from '@/lib/content/audioInstructions';
import { PACE_BY_SECTION } from '@/lib/content/listeningPace';

describe('buildTurnInstructions', () => {
  it('includes the section style instruction', () => {
    const text = buildTurnInstructions(PACE_BY_SECTION[1], undefined);
    expect(text).toContain(PACE_BY_SECTION[1].styleInstruction);
  });

  it('includes the persona when one is given', () => {
    const text = buildTurnInstructions(PACE_BY_SECTION[3], 'a fast-talking young student');
    expect(text).toContain('a fast-talking young student');
  });

  it('omits any persona sentence when none is given, without a dangling "Voice this speaker as:"', () => {
    const text = buildTurnInstructions(PACE_BY_SECTION[2], undefined);
    expect(text).not.toContain('Voice this speaker as');
  });

  it('always tells the model never to speak a label or metadata, regardless of persona', () => {
    for (const persona of [undefined, 'a calm narrator']) {
      const text = buildTurnInstructions(PACE_BY_SECTION[4], persona);
      expect(text.toLowerCase()).toContain('never read aloud any name, label');
    }
  });

  it('produces a different instruction string per section (style genuinely varies)', () => {
    const bySection = [1, 2, 3, 4].map((n) => buildTurnInstructions(PACE_BY_SECTION[n], undefined));
    expect(new Set(bySection).size).toBe(4);
  });
});

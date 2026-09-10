import { computeOverallBand, computeWritingSkillBand, rawScoreToBand, roundIeltsBand } from '@/lib/bandScore';

describe('roundIeltsBand', () => {
  it('rounds a .25 remainder up to the next half band', () => {
    expect(roundIeltsBand(6.25)).toBe(6.5);
  });

  it('rounds a .75 remainder up to the next whole band', () => {
    expect(roundIeltsBand(6.75)).toBe(7.0);
  });

  it('rounds down when closer to the lower half band', () => {
    expect(roundIeltsBand(6.1)).toBe(6.0);
  });

  it('rounds up when closer to the upper whole band', () => {
    expect(roundIeltsBand(6.85)).toBe(7.0);
  });

  it('leaves an exact half band unchanged', () => {
    expect(roundIeltsBand(7.0)).toBe(7.0);
    expect(roundIeltsBand(6.5)).toBe(6.5);
  });
});

describe('rawScoreToBand', () => {
  it('maps a perfect Listening score to band 9', () => {
    expect(rawScoreToBand('listening', 40)).toBe(9.0);
  });

  it('maps a mid-range Reading Academic score correctly', () => {
    expect(rawScoreToBand('reading_academic', 30)).toBe(7.0);
  });

  it('applies the steeper General Training curve', () => {
    // The same raw score yields a lower band on General Training than Academic.
    const academic = rawScoreToBand('reading_academic', 30);
    const general = rawScoreToBand('reading_general', 30);
    expect(general).toBeLessThan(academic);
  });

  it('falls back to the lowest boundary band for very low scores', () => {
    expect(rawScoreToBand('listening', 0)).toBe(2.0);
  });

  it('falls back to the highest boundary band for out-of-range high scores', () => {
    expect(rawScoreToBand('listening', 100)).toBe(9.0);
  });
});

describe('computeOverallBand', () => {
  it('averages the four skills and applies IELTS rounding', () => {
    // (7 + 6.5 + 5.5 + 6) / 4 = 6.25 -> rounds up to 6.5
    expect(computeOverallBand({ listening: 7, reading: 6.5, writing: 5.5, speaking: 6 })).toBe(6.5);
  });

  it('matches the sample user from the product spec', () => {
    // Listening 7.0, Reading 6.5, Writing 5.5, Speaking 6.0 -> overall 6.5
    expect(computeOverallBand({ listening: 7.0, reading: 6.5, writing: 5.5, speaking: 6.0 })).toBe(6.5);
  });
});

describe('computeWritingSkillBand', () => {
  it('weights Task 2 twice as much as Task 1, per IELTS convention', () => {
    // (6 + 7*2) / 3 = 6.666... -> rounds to the nearest half band, 6.5
    expect(computeWritingSkillBand(6, 7)).toBe(6.5);
  });

  it('does not simply average the two tasks equally', () => {
    // A plain average of (5, 8) would be 6.5. The weighted formula (5 + 8*2)/3 = 7.0 differs.
    expect(computeWritingSkillBand(5, 8)).not.toBe(6.5);
    expect(computeWritingSkillBand(5, 8)).toBe(7.0);
  });

  it('returns the exact band when both tasks score the same', () => {
    expect(computeWritingSkillBand(6.5, 6.5)).toBe(6.5);
  });

  it('returns null when Task 1 is missing — never fabricates an aggregate from one task alone', () => {
    expect(computeWritingSkillBand(null, 7)).toBeNull();
    expect(computeWritingSkillBand(undefined, 7)).toBeNull();
  });

  it('returns null when Task 2 is missing', () => {
    expect(computeWritingSkillBand(6, null)).toBeNull();
  });

  it('returns null when both tasks are missing', () => {
    expect(computeWritingSkillBand(null, null)).toBeNull();
  });
});

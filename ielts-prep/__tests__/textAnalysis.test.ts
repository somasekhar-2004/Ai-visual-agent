import { clampToBand, countPhraseMatches, countSentences, countWords, uniqueWordRatio } from '@/lib/textAnalysis';

describe('countWords', () => {
  it('counts words separated by whitespace', () => {
    expect(countWords('The quick brown fox')).toBe(4);
  });
  it('returns 0 for empty input', () => {
    expect(countWords('   ')).toBe(0);
  });
});

describe('countSentences', () => {
  it('counts sentences terminated by punctuation', () => {
    expect(countSentences('First sentence. Second one! Is this the third?')).toBe(3);
  });
});

describe('uniqueWordRatio', () => {
  it('is 1.0 when every word is unique', () => {
    expect(uniqueWordRatio('one two three four')).toBe(1);
  });
  it('is lower when words repeat', () => {
    expect(uniqueWordRatio('one one one one')).toBeCloseTo(0.25);
  });
});

describe('countPhraseMatches', () => {
  it('counts whole-word/phrase matches only', () => {
    expect(countPhraseMatches('However, this however is not thereof.', ['however'])).toBe(2);
  });
});

describe('clampToBand', () => {
  it('clamps within the given range and rounds to the nearest half band', () => {
    expect(clampToBand(10, 4, 8.5)).toBe(8.5);
    expect(clampToBand(1, 4, 8.5)).toBe(4);
    expect(clampToBand(6.3)).toBe(6.5);
  });
});

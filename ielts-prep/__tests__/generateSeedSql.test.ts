import { sqlStr, sqlTextArray } from '../scripts/generate-seed-sql';

// Regression test for a real bug this caught: applying the generated seed
// SQL against a genuine fresh Postgres database failed with a syntax error
// on a vocabulary word whose synonyms array contained an apostrophe
// ("body's defences") — sqlTextArray escaped the Postgres array-literal's
// internal double quotes but not the single quote the whole literal is
// wrapped in, so the apostrophe terminated the SQL string early.
describe('sqlTextArray', () => {
  it('escapes a single quote inside an array element so it does not break out of the SQL string literal', () => {
    expect(sqlTextArray(["body's defences"])).toBe(`'{"body''s defences"}'`);
  });

  it('escapes a double quote inside an array element per Postgres array-literal syntax', () => {
    expect(sqlTextArray(['a "quoted" word'])).toBe(`'{"a \\"quoted\\" word"}'`);
  });

  it('handles multiple elements, some with apostrophes', () => {
    expect(sqlTextArray(["trace one's genealogy", 'genealogy research'])).toBe(`'{"trace one''s genealogy","genealogy research"}'`);
  });

  it('produces a string with balanced, evenly-paired single quotes (a necessary condition for valid SQL string syntax)', () => {
    const out = sqlTextArray(["it's", "the user's", 'plain']);
    expect((out.match(/'/g) ?? []).length % 2).toBe(0);
  });
});

describe('sqlStr', () => {
  it('doubles a single quote for the standard SQL string-literal escape', () => {
    expect(sqlStr("The body's defence system.")).toBe(`'The body''s defence system.'`);
  });

  it('returns the literal null for a nullish value', () => {
    expect(sqlStr(null)).toBe('null');
    expect(sqlStr(undefined)).toBe('null');
  });
});

import fs from 'node:fs';
import path from 'node:path';

import { content } from '@/lib/content';

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

// Regression coverage for the real live-database bug this session found:
// "FAIL questions — 800/800 referenced IDs missing" on a database that had
// genuinely been seeded correctly. Root cause was NOT a later seed file
// deleting rows (every seed file after 0002_generated_content.sql is an
// empty legacy stub — verified directly) — it was that `insert into
// questions (...)` never included an `id` column at all, so every question
// row got a random Postgres-generated uuid instead of the app's real id
// (none of which are UUID-formatted to begin with: 0/2535 match the UUID
// regex). Since question_attempts.question_id and bookmarks.question_id
// are both real foreign keys to questions.id, this wasn't just a
// verification-script false negative the way the analogous mock_sections.id
// gap is — it meant Practice-mode answering and bookmarking could never
// have worked against a real database for a single question in the app.
// These tests read the actual generated file from disk (not a mock), so a
// future edit to generate-seed-sql.ts that drops the `id` column again — or
// generates it for the wrong set of rows — fails here immediately, without
// needing a live database to notice.
describe('the generated seed file — questions.id matches the app\'s real content ids', () => {
  const SEED_PATH = path.join(__dirname, '..', 'supabase', 'seed', '0002_generated_content.sql');
  const seedSql = fs.readFileSync(SEED_PATH, 'utf8');

  it('declares an explicit id column on the questions insert (never left to a random default)', () => {
    expect(seedSql).toMatch(/insert into questions \(id, /);
  });

  it('inserts exactly one row per bundled question, each under its real content id', () => {
    const match = seedSql.match(/insert into questions \(id, [\s\S]*?\) values\n([\s\S]*?);\n/);
    expect(match).not.toBeNull();
    const valuesBlock = match![1];
    // Every row starts with `('<id>', ` — extract just the id, not the
    // rest of the tuple (which may itself contain parenthesised JSON).
    const insertedIds = Array.from(valuesBlock.matchAll(/^\('((?:[^'\\]|'')*)',/gm)).map((m) => m[1].replace(/''/g, "'"));
    const expectedIds = content.allQuestions.map((q) => q.id);
    expect(insertedIds.length).toBe(expectedIds.length);
    expect(new Set(insertedIds)).toEqual(new Set(expectedIds));
  });

  it('every mock section id the app references resolves to a question actually inserted', () => {
    const referencedIds = new Set(content.mockSections.flatMap((s) => s.contentRef.questionIds ?? []));
    const allQuestionIds = new Set(content.allQuestions.map((q) => q.id));
    const unresolvable = Array.from(referencedIds).filter((id) => !allQuestionIds.has(id));
    expect(unresolvable).toEqual([]);
  });
});

// mock_sections.id is deliberately NOT written by the seed (Postgres's own
// gen_random_uuid() default assigns it — see the comment on
// 0009_question_id_text.sql's sibling investigation in
// verify-content-in-db.ts): nothing in the schema or app ever looks a
// mock_sections row up by that id, only by (mock_test_id, skill). This test
// documents that asymmetry deliberately, so a future "fix" that adds an id
// column here without checking whether it's actually needed doesn't ship
// unreviewed.
describe('the generated seed file — mock_sections intentionally has no id column', () => {
  const SEED_PATH = path.join(__dirname, '..', 'supabase', 'seed', '0002_generated_content.sql');
  const seedSql = fs.readFileSync(SEED_PATH, 'utf8');

  it('omits id from the mock_sections insert column list', () => {
    expect(seedSql).toMatch(/insert into mock_sections \(mock_test_id, skill, order_index, duration_minutes, content_ref\) values/);
  });

  it('inserts exactly one row per (mock_test_id, skill) pair the app expects', () => {
    const match = seedSql.match(/insert into mock_sections \([^)]*\) values\n([\s\S]*?);\n/);
    expect(match).not.toBeNull();
    const rowCount = match![1].split('\n').filter((l) => l.trim().length > 0).length;
    expect(rowCount).toBe(content.mockSections.length);
  });
});

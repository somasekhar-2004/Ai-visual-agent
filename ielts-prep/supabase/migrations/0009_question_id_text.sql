-- Fixes the REAL root cause behind "FAIL questions — 800/800 referenced IDs
-- missing" (and the same latent bug for every one of the app's 2,535
-- questions, not just the 800 referenced by mock sections) — this was
-- misdiagnosed at first as a later seed file deleting rows; it is not. No
-- seed file after 0002_generated_content.sql contains any DELETE/TRUNCATE
-- at all (0003_lessons.sql through 0010_mock_test.sql are empty legacy
-- stub files, confirmed by reading every one of them). The real bug:
--
--   create table questions (
--     id uuid primary key default gen_random_uuid(),
--     ...
--   );
--
-- `questions.id` was declared `uuid`, but NONE of the app's 2,535 question
-- ids are UUID-formatted — every one is a human-readable slug (e.g.
-- "rq-p1-1", "ast-ar-01-q1"; confirmed by checking every id in
-- content.allQuestions against the UUID regex: 0/2535 match). The seed
-- generator (scripts/generate-seed-sql.ts) knew this and deliberately
-- omitted `id` from the INSERT column list for `questions` — so every
-- question row got a brand-new *random* uuid from the column's default
-- instead of the app's real id. The rows were never missing; they existed
-- under ids nothing in the app ever asks for.
--
-- This is not just a verification-script false negative (unlike
-- mock_sections.id, which genuinely is never referenced by any real
-- foreign key or app-side lookup — see 0008's sibling investigation). Two
-- real tables have a hard foreign key to questions.id:
--   - question_attempts.question_id (every real Practice-mode answer)
--   - bookmarks.question_id (bookmarking a question)
-- services/repository/learning.ts's recordQuestionAttempt/toggleQuestionBookmark
-- insert the app's real (slug) question id directly into these columns —
-- which, against the old `uuid` type, fails immediately with "invalid
-- input syntax for type uuid" for every single question in the app. This
-- migration is what actually makes real-mode Practice-mode answering and
-- bookmarking work at all, not just fixes a verification report.
--
-- Fix: change questions.id (and its two FK columns) from uuid to text, so
-- the schema matches the identifier space the app has always actually
-- used. Safe for this pre-launch project — there are no real
-- question_attempts/bookmarks rows worth preserving under the old random
-- uuids (nothing in the app could have referenced them correctly to begin
-- with), and 0002_generated_content.sql already deletes+reinserts
-- `questions` from scratch on every seed run regardless.
--
-- Idempotent: safe to run multiple times (drops constraints/defaults
-- `if exists` before recreating).

alter table if exists bookmarks drop constraint if exists bookmarks_question_id_fkey;
alter table if exists question_attempts drop constraint if exists question_attempts_question_id_fkey;

alter table questions alter column id drop default;
alter table questions alter column id type text using id::text;

alter table question_attempts alter column question_id type text using question_id::text;
alter table bookmarks alter column question_id type text using question_id::text;

alter table question_attempts
  add constraint question_attempts_question_id_fkey foreign key (question_id) references questions (id) on delete cascade;
alter table bookmarks
  add constraint bookmarks_question_id_fkey foreign key (question_id) references questions (id) on delete cascade;

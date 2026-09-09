-- Fixes "permission denied for table profiles" (and the same error on every
-- other app table) seen on the physical-device health check and behind the
-- Home white screen, the full-mock-test crash, and "Mark as complete" doing
-- nothing.
--
-- Root cause: table-level GRANTs are a separate, OUTER layer from Row Level
-- Security. RLS policies (0001_init.sql, 0003_grammar_practice.sql,
-- 0005_ai_usage_log.sql) control which ROWS a role can see/change, but a
-- role first needs a GRANT on the TABLE itself before Postgres will even
-- evaluate RLS — without it, every query fails immediately with "permission
-- denied for table X", which is exactly the health check's error and
-- exactly why every real-backend query in the app (Home's profile/goal/plan
-- fetch, starting a mock test, marking a lesson complete, ...) failed
-- silently or crashed. None of the earlier migrations ever ran a GRANT
-- statement, only `create table` + `enable row level security` + policies.
--
-- This migration only widens what the `authenticated` role is ALLOWED to
-- attempt — it does not touch a single RLS policy, and it does not disable
-- RLS anywhere. Row-level access stays exactly as already defined: a user
-- can only read/write rows where `auth.uid()` matches that row's owner (see
-- the `owner_all` / `owner_via_*` / `owner_read` / `owner_insert` policies),
-- and public content tables stay read-only via `content_public_read`.
--
-- Idempotent: safe to run multiple times.

grant usage on schema public to authenticated;

-- Owner-scoped tables: authenticated users need full CRUD at the GRANT
-- layer so RLS's owner_all/owner_via_*/owner_read+owner_insert policies can
-- actually run and do the real per-row filtering.
grant select, insert, update, delete on table
  public.profiles,
  public.user_goals,
  public.lesson_progress,
  public.question_attempts,
  public.practice_sessions,
  public.bookmarks,
  public.mock_attempts,
  public.reading_attempts,
  public.listening_attempts,
  public.writing_submissions,
  public.writing_feedback,
  public.speaking_sessions,
  public.speaking_responses,
  public.speaking_feedback,
  public.band_scores,
  public.study_plans,
  public.study_plan_items,
  public.user_vocabulary,
  public.user_achievements,
  public.ai_conversations,
  public.ai_messages,
  public.subscriptions,
  public.notifications,
  public.test_history,
  public.grammar_question_attempts
to authenticated;

-- ai_usage_log: insert (server writes via the Edge Functions' user-scoped
-- client) + select (owner_read lets a user see their own usage), but never
-- update/delete — there are deliberately no RLS policies for those, and no
-- GRANT for them either, so the table stays an append-only audit log at
-- both layers.
grant select, insert on table public.ai_usage_log to authenticated;

-- Public read-only content tables: SELECT only, matching the
-- content_public_read RLS policies (`for select using (true)`) — there is
-- no owner_all-style write policy on any of these, so granting more than
-- SELECT here would do nothing except widen what a future, accidentally
-- permissive RLS policy could expose.
grant select on table
  public.lessons,
  public.reading_passages,
  public.listening_tracks,
  public.questions,
  public.mock_tests,
  public.mock_sections,
  public.writing_prompts,
  public.speaking_topics,
  public.vocabulary_words,
  public.grammar_lessons,
  public.grammar_questions,
  public.achievements,
  public.band_conversion_tables
to authenticated;

-- Ensures any table a FUTURE migration creates in this schema is granted to
-- authenticated automatically, so this exact class of bug (a new table that
-- works in RLS review but 403s for every real user) can't recur silently.
-- Migrations that add a table should still add an explicit GRANT for
-- documentation/clarity, but this is the safety net.
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;

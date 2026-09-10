-- Fixes "permission denied for table mock_tests" (and the same error on
-- every other public content table) when queried with the anon key and no
-- signed-in session — seen running scripts/verify-content-in-db.ts, which
-- deliberately uses only EXPO_PUBLIC_SUPABASE_ANON_KEY (the same
-- client-safe, public value the app itself ships with), not a real user
-- login.
--
-- Root cause: 0006_grants.sql granted SELECT on every public content table
-- to `authenticated` only. That matches how the mobile app itself actually
-- behaves today — it never queries these tables directly at runtime, since
-- all content (lib/content/*.ts) is bundled into the app; the Supabase
-- content tables exist purely so mock_attempts/reading_attempts/etc.'s
-- foreign keys have real rows to point at. So the running app, once a user
-- is signed in, was never actually blocked by this gap.
--
-- But the anon role was never granted anything at all on these tables, and
-- that's a genuine mismatch with intent already stated elsewhere: the
-- content_public_read RLS policies (0001_init.sql) are literally
-- `for select using (true)` — "anyone can read this," full stop, no
-- authentication check in the policy itself — and this project's own
-- README describes these as "public content tables ... readable by
-- anyone." A GRANT layer that silently contradicts that stated policy
-- intent is the actual bug: RLS's `using (true)` is worthless if the
-- table-level GRANT never lets anon reach it to find out.
--
-- This migration grants anon SELECT only, only on the same read-only
-- public content tables 0006_grants.sql already opened up to
-- authenticated (never an owner-scoped table — profiles, user_goals,
-- mock_attempts, etc. stay exactly as restricted as before, for both
-- roles). It does not touch a single RLS policy and does not disable RLS
-- anywhere; anon still cannot write anything, and still cannot read a
-- single owner-scoped row (no owner_all/owner_via_* policy exists for
-- anon, and none is added here). Idempotent: safe to run multiple times.

grant usage on schema public to anon;

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
to anon;

-- Deliberately NOT mirroring 0006_grants.sql's
-- `alter default privileges ... grant ... to authenticated` for anon here.
-- That blanket default would apply to every table ANY future migration
-- creates, including future owner-scoped ones — which would silently
-- expose a brand-new user-data table to the anon role the moment it's
-- created. Any future public content table must add its own explicit
-- `grant select on table public.<name> to anon` alongside its
-- `authenticated` grant — safer to require that one extra line than to
-- risk a future table being anon-readable by default.

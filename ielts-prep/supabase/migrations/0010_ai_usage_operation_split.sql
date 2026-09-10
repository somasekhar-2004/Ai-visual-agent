-- Splits the shared writing_eval/speaking_eval quota buckets into
-- independent Practice vs Full Mock buckets, so a student who has used up
-- their daily Practice evaluations can still complete a Full Mock (and vice
-- versa) — see supabase/functions/_shared/rateLimit.ts for the enforcement
-- this enables. Before this, evaluate-writing/evaluate-speaking counted
-- every attempt (Practice AND Mock) against the exact same daily cap, so a
-- student who used their one free Practice evaluation could then be
-- rejected mid-Full-Mock with "Daily Speaking evaluation limit reached" —
-- a real product bug, not an intentional shared limit.
--
-- Postgres enum values can only be added, never safely removed once a table
-- column references the type — 'writing_eval'/'speaking_eval' stay defined
-- (any historical rows keep their meaning) but the application no longer
-- writes them; every new row uses one of the four values below instead.
alter type ai_operation add value if not exists 'writing_eval_practice';
alter type ai_operation add value if not exists 'writing_eval_mock';
alter type ai_operation add value if not exists 'speaking_eval_practice';
alter type ai_operation add value if not exists 'speaking_eval_mock';

-- Optional audit trail: which real mock_attempts row (if any) a usage-log
-- row was verified against server-side (see
-- supabase/functions/_shared/mockAttempt.ts) — never populated from an
-- unverified client claim. Nullable: every non-mock operation (Practice,
-- ai_coach, transcription, study_plan_suggestion) leaves this null.
alter table ai_usage_log add column if not exists mock_attempt_id uuid references mock_attempts (id) on delete set null;

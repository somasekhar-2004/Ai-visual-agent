-- Replaces user_goals' "insert a new row on every edit, then deactivate the
-- rest" pattern with true upsert semantics: at most one CURRENT (is_active)
-- goal row per user, enforced at the database level rather than relying on
-- a second, separate request to deactivate old rows succeeding.
--
-- Live-backend audit (2026-09-18) proved the previous two-step approach was
-- actually correct in every case tested end-to-end (a fresh DB read and
-- both Edge Functions reflected an edit's new target_band/
-- daily_study_minutes immediately), so this is not a fix for a reproduced
-- data bug. It closes a real, if narrow, race window the old code's own
-- comments already flagged (the deactivate step could fail independently
-- of the insert and was only ever handled with a console.warn), and gives
-- services/repository/core.ts's saveOnboardingGoal a single atomic UPDATE
-- to run for an edit instead of two separate requests.

-- updated_at: the previous schema only had created_at, which stays fixed at
-- the row's original insert time — useless for detecting "this goal was
-- just edited" once edits update the row in place instead of creating a
-- new one. Reuses set_updated_at() (see 0001_init.sql), the same
-- trigger function profiles/subscriptions already use.
alter table user_goals add column if not exists updated_at timestamptz not null default now();
update user_goals set updated_at = created_at where updated_at = now() and updated_at <> created_at;

drop trigger if exists trg_user_goals_updated_at on user_goals;
create trigger trg_user_goals_updated_at before update on user_goals
  for each row execute function set_updated_at();

-- Before adding the hard constraint below, collapse any account that
-- already has more than one is_active=true row (shouldn't exist given the
-- audit above found exactly one per account, but this makes the migration
-- safe to run regardless) down to just its most-recently-created active row.
with ranked as (
  select id, row_number() over (partition by user_id order by created_at desc) as rn
  from user_goals
  where is_active
)
update user_goals
set is_active = false
where id in (select id from ranked where rn > 1);

-- The actual guarantee: Postgres will reject a second is_active=true row
-- for the same user_id outright, so this invariant can never silently
-- drift again regardless of what application code does.
create unique index if not exists uq_user_goals_one_active_per_user on user_goals (user_id) where is_active;

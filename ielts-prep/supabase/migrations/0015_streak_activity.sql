-- ============================================================================
-- Real streak/XP persistence
-- ============================================================================
-- Before this migration, services/repository/core.ts's getStreak() was a
-- hardcoded stub returning { count: 0, lastActiveDate: null } and
-- recordDailyActivity() was a no-op — there was no backend representation
-- for streak/XP at all, so Home showed "0 Day streak" / "0 XP" forever for
-- every real user and streak-gated achievements (a-streak-7, a-streak-30)
-- could never unlock. This is the release-blocking gap found by the
-- pre-launch product audit.
--
-- One row per (user, LOCAL calendar day the activity happened on) — never
-- UTC. The local date and the timezone used to compute it are both
-- determined CLIENT-SIDE at the moment of the activity (lib/timezone.ts)
-- and sent as-is; this table only ever stores what it's given, it never
-- reinterprets a past row's date under a since-changed timezone. That's
-- deliberate: once a day's activity has been recorded against a local
-- date, it must never be silently rewritten later just because the user's
-- device timezone changed (e.g. after travel) — see record_daily_activity
-- below and lib/streak.ts's own header comment for the full reasoning.
--
-- No separate "streak summary" table: the current streak is a small, cheap
-- computation over this table's own rows (see lib/streak.ts's
-- computeCurrentStreak, called from getStreak()) — a fresh derived value
-- read on demand is simpler and can never drift from the activity rows
-- that are its actual source of truth, unlike a duplicated running counter
-- that would need to be kept in sync on every write and every timezone
-- edge case.

create table if not exists user_daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  -- The user's local calendar date, as computed by the client at the
  -- moment of the activity (lib/timezone.ts's getLocalDateString) — never
  -- derived from created_at/now() here, which would be UTC-anchored.
  activity_date_local date not null,
  -- The IANA timezone name (e.g. "Asia/Kolkata") used to compute the local
  -- date above — recorded for audit/debugging, not read back by any
  -- streak calculation (which only ever looks at activity_date_local
  -- itself, per-row, exactly as recorded).
  timezone text not null,
  first_activity_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  -- Analytics-only (how many qualifying activities happened this day) —
  -- never read by the streak calculation, which only cares whether a row
  -- exists for a given date, not how many activities it represents.
  activity_count integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- The actual guarantee: at most one row per user per local day,
  -- regardless of how many qualifying activities they complete that day or
  -- how many concurrent requests race to record them (see
  -- record_daily_activity's ON CONFLICT below, which makes that race safe
  -- at the database level rather than relying on client-side locking).
  unique (user_id, activity_date_local)
);

-- Fast "most recent activity days for this user" lookups — every
-- getStreak() call reads exactly this shape (see lib/streak.ts).
create index if not exists idx_user_daily_activity_user_date
  on user_daily_activity (user_id, activity_date_local desc);

alter table user_daily_activity enable row level security;

do $$ begin
  create policy "owner_all" on user_daily_activity for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

drop trigger if exists trg_user_daily_activity_updated_at on user_daily_activity;
create trigger trg_user_daily_activity_updated_at before update on user_daily_activity
  for each row execute function set_updated_at();

-- XP total lives directly on profiles (one running total per user, not
-- date-partitioned like streak) rather than a separate table — there is
-- exactly one number to store and it already has an owner_all RLS policy.
-- The per-activity award amounts (20 for a Reading/Listening/Writing/
-- Speaking submission, 15 for a lesson, 5 per correct practice question)
-- are the existing design already threaded through every
-- recordDailyActivity(userId, xpEarned) call site — this migration makes
-- that already-decided value persist for real instead of being silently
-- discarded, not a new point system.
alter table profiles add column if not exists xp integer not null default 0;

-- Atomically records one qualifying-activity event: upserts today's
-- (user, local-date) row (incrementing activity_count on an existing row
-- rather than duplicating it — the ON CONFLICT clause is what makes
-- concurrent/duplicate calls for the same user+day safe, per the unique
-- constraint above) and adds xp_earned to the user's running total, in a
-- single transaction. SECURITY INVOKER (the default) — relies on the
-- exact same owner_all RLS policies as any other client write, plus an
-- explicit check below for a clear error instead of a silent zero-row
-- no-op if the two ever mismatch.
create or replace function record_daily_activity(
  p_user_id uuid,
  p_activity_date_local date,
  p_timezone text,
  p_xp_earned integer default 0
) returns void
language plpgsql
as $$
begin
  if p_user_id <> auth.uid() then
    raise exception 'record_daily_activity: cannot record activity for another user';
  end if;

  insert into user_daily_activity (user_id, activity_date_local, timezone, first_activity_at, last_activity_at, activity_count)
  values (p_user_id, p_activity_date_local, p_timezone, now(), now(), 1)
  on conflict (user_id, activity_date_local) do update set
    activity_count = user_daily_activity.activity_count + 1,
    last_activity_at = now(),
    timezone = excluded.timezone,
    updated_at = now();

  if p_xp_earned > 0 then
    update profiles set xp = xp + p_xp_earned, updated_at = now() where id = p_user_id;
  end if;
end;
$$;

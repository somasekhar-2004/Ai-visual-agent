-- ============================================================================
-- RECOVERY NOTE (added 2026-11-06, Bandpath recovery session): this file was
-- missing from this git branch entirely (the repo stopped at 0015). Recovered
-- verbatim, statement-for-statement, from supabase_migrations.schema_migrations
-- on the live "Bandpath IELTS" project (kudgtxdwbpfqobteyeqy) via the
-- Supabase Management API (read-only token) — this IS the exact SQL that ran
-- there. Confirmed independently against the live schema itself: both
-- xp_operations and ai_operations (0017) exist as real tables, and
-- record_daily_activity has exactly the one 5-parameter signature this
-- migration leaves behind (no leftover 4-parameter overload). The header
-- comment immediately below, reading "NOT APPLIED — provided for review
-- only", is the AUTHOR's pre-deployment note at drafting time and is stale —
-- left verbatim rather than edited, since everything else in it (the
-- reasoning, the test history) is accurate and worth keeping.
-- ============================================================================
-- XP write idempotency (NOT APPLIED — provided for review only)
-- ============================================================================
-- record_daily_activity's own (user, local day) upsert already makes a
-- repeated call safe for the DAILY-ACTIVITY ROW itself (see
-- 0015_streak_activity.sql's ON CONFLICT clause) — but the XP increment
-- right below it, `update profiles set xp = xp + p_xp_earned`, is
-- ADDITIVE, not idempotent: calling it twice for the SAME real action
-- (e.g. a client retry after the RPC committed server-side but the
-- client's own local "already awarded" checkpoint never caught up before
-- the app died) genuinely adds the XP twice. This is the one write in the
-- app's "resume after a crash" surface that a client-side completion
-- marker alone cannot make safe.
--
-- Every OTHER write this effort covers (question_attempts, reading/
-- listening/writing/speaking's own result rows, band_scores) needs NO
-- schema change at all: each of those tables already has
-- `id uuid primary key default gen_random_uuid()`, and a client-generated
-- id (lib/operationId.ts's generateOperationId, persisted before the
-- first attempt and reused on every retry) can simply be supplied
-- explicitly in the insert payload instead of using the column default —
-- a retry with the SAME id hits the EXISTING primary-key uniqueness
-- constraint, which is all the server-side idempotency those writes need,
-- and is ALREADY active today, independent of this migration. See
-- services/repository/*.ts for where that id is threaded through.
--
-- This migration is intentionally minimal and additive: a new table plus
-- a function signature change for record_daily_activity. Nothing here
-- drops, renames, or rewrites any EXISTING column, table, or row.
--
-- WHAT CHANGED FROM THE FIRST DRAFT OF THIS MIGRATION (review feedback):
-- 1. The dedup check now runs for the ENTIRE operation — including a
--    0-XP "qualify today for the streak" call — BEFORE user_daily_activity
--    or profiles is ever touched, not only when xp_earned > 0. A retried
--    0-XP call (app/practice-session.tsx's qualifyOperationId) is now a
--    true no-op on a repeat, not just "harmless because the day-row's own
--    upsert happens to also be idempotent."
-- 2. xp_operations now stores the operation's FULL original payload
--    (xp_earned, activity_date_local, timezone), not just xp_earned. A
--    retry with the identical payload is a no-op; a retry that reuses the
--    same operation_id with a DIFFERENT payload is rejected with an
--    exception instead of either silently applying it or silently
--    ignoring it — see the `v_existing` comparison below.
-- 3. The function now explicitly rejects a missing auth.uid() (not just a
--    MISMATCHED one) with its own clear error — see the comment at that
--    check for exactly why the original `p_user_id <> auth.uid()` check
--    alone was not reliably catching an unauthenticated caller.
-- 4. EXECUTE on this function is now explicitly revoked from PUBLIC and
--    granted only to `authenticated` — previously neither the old nor the
--    new draft had ANY explicit grant/revoke on it anywhere in the
--    migration history, relying entirely on Postgres's default "EXECUTE
--    granted to PUBLIC" behavior for a newly created function.
--
-- IMPORTANT — function-signature change, not a plain CREATE OR REPLACE:
-- Postgres identifies a function by name PLUS its declared parameter
-- list; adding a new trailing parameter (even one with a DEFAULT) to an
-- existing function via `create or replace function` does NOT replace
-- the old 4-parameter function — it creates a SECOND, OVERLOADED
-- function alongside it (5 declared parameters, the last defaulted).
-- Having both the old 4-parameter and a new 5-parameter overload live at
-- once risks exactly the "which one matches a 4-argument call" ambiguity
-- the Postgres manual explicitly warns default-argument overloading can
-- cause — not a safe bet to leave to call-resolution behavior on a
-- function this central. The DROP FUNCTION below removes the old
-- 4-parameter signature BY ITS EXACT TYPE LIST first, so there is only
-- ever ONE record_daily_activity function after this migration runs, for
-- any caller, old or new, with no overload to disambiguate at all.
--
-- TESTING STATUS: executed against a real (WASM-embedded, not Docker)
-- Postgres instance — @electric-sql/pglite — in this environment, since
-- no psql/Docker/local Supabase CLI stack is available here (`supabase
-- start` needs Docker, which isn't installed). That executed suite (not
-- committed as part of this migration; run against a throwaway in-memory
-- database, never this project's real Supabase project) covers 35
-- individual checks across 10 scenarios: identical-payload retries
-- (including a 3rd repeat), payload-mismatch rejection (separately for a
-- different xp amount, date, and timezone), 0-XP event deduplication
-- (including that a ledger row IS still created for it), a next-day
-- retry correctly reusing the original date/timezone (plus a negative
-- control showing a recomputed-date retry IS treated as a new day,
-- confirming the fix must live client-side), simulated concurrent
-- retries (two sequential transactions racing the same operation_id — a
-- real approximation of Postgres's actual unique-constraint-blocks-the-
-- second-committer behavior, but not genuine parallel network
-- connections, which pglite's single in-process connection can't
-- produce), explicit auth.uid()-is-null / mismatched-user rejections
-- (auth.uid() stubbed to a session-local setting, since pglite has no
-- real Supabase auth/JWT layer), the pre-existing negative-XP guard, and
-- legacy no-operation_id calls confirmed to still genuinely double-award
-- (proving that gap is real, not accidentally caught by something else).
--
-- Also executed, not merely statically reviewed: the function's EXECUTE
-- grant and xp_operations' RLS policies, using `SET ROLE anon` / `SET
-- ROLE authenticated` to genuinely drop the test session's privilege
-- level to a real non-superuser role (confirmed empirically: pglite's
-- bootstrap connection IS a superuser, which Postgres never subjects to
-- RLS or GRANT checks, but SET ROLE to a plain role actually triggers
-- real enforcement under it, verified by first confirming `anon` WAS
-- rejected before adding the grant it needed). That confirmed: anon
-- (never granted EXECUTE) is rejected at the permission layer before the
-- function body even runs; authenticated (granted EXECUTE) can call it;
-- a different authenticated user's SELECT on xp_operations with no
-- filter at all sees zero rows (RLS hides them entirely, not just
-- filters); and a cross-user INSERT attempt is rejected by the
-- owner_insert policy's WITH CHECK. The test harness's auth/profiles/
-- user_daily_activity preconditions (schema usage, table grants, RLS
-- policies) were written to mirror what the real Supabase project
-- already has from earlier migrations, not something this migration
-- itself creates.
--
-- UPDATE — also executed against a REAL staging Supabase project (ref
-- kudgtxdwbpfqobteyeqy), closing the two gaps the pglite harness above
-- couldn't: this exact migration file was applied there via a direct
-- Postgres connection (confirmed before/after: one 4-arg overload and no
-- xp_operations table before, exactly one 5-arg overload after — the
-- DROP FUNCTION left no ambiguity on a real system either), then
-- exercised through the REAL Supabase JS client against the real hosted
-- REST API, signed in as a real auth user (no `auth.uid()` stub — the
-- project's actual JWT verification), covering:
-- - 8 GENUINELY simultaneous identical RPC calls (`Promise.all`, real
--   concurrent HTTP requests racing each other over the real network,
--   not sequential transactions): all 8 succeeded, XP increased by
--   exactly the single award amount (not 8x), exactly one ledger row.
-- - A same-operation_id retry with a different xp amount: rejected over
--   the real RPC path with the payload-mismatch error; XP reflects only
--   the first call.
-- - A legacy call with no operation_id: still succeeds unchanged, for
--   the call sites this effort never touched.
-- The real test account's XP and activity row were restored to their
-- exact pre-test baseline afterward, and all test ledger rows deleted.
--
-- Still NOT exercised anywhere: this exact Postgres version/extension
-- set under genuinely adversarial conditions (e.g. a deliberately
-- malicious replayed request), and production itself — this migration
-- has been applied to staging only; it still needs applying to
-- production separately and deliberately, never implicitly from this
-- testing.

-- One row per XP-earning (or 0-XP, streak-qualifying) operation that has
-- actually been applied — the ledger that makes the WHOLE operation
-- idempotent, not just the XP increment. A client retry inserting the
-- SAME (user, operation) pair hits this table's own primary-key
-- constraint before ever reaching user_daily_activity or profiles below,
-- which is exactly how the duplicate is detected before anything else
-- happens.
--
-- Keyed by (user_id, operation_id), not operation_id alone: this ties
-- the ledger's own uniqueness check directly to the authenticated owner
-- it's scoped to (the function below also independently verifies
-- `auth.uid() = p_user_id` before ever touching this table), and means
-- even the astronomically unlikely case of two DIFFERENT users' clients
-- generating the same operation_id value can never cross-contaminate —
-- each user's ledger entries live entirely within their own key space.
--
-- activity_date_local/timezone store the operation's ORIGINAL payload (in
-- addition to xp_earned) so a retry can be verified against it, not just
-- deduplicated by id alone — see record_daily_activity's payload-mismatch
-- check below.
create table if not exists xp_operations (
  user_id uuid not null references profiles (id) on delete cascade,
  operation_id uuid not null,
  xp_earned integer not null,
  activity_date_local date not null,
  timezone text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, operation_id)
);

-- Lets a user audit their own XP history; not read by any application
-- code today.
create index if not exists idx_xp_operations_user on xp_operations (user_id, created_at desc);

alter table xp_operations enable row level security;

-- Select-only for the client — ownership-checked like every other table
-- in this app (auth.uid() = user_id). There is deliberately NO insert/
-- update/delete policy for direct client access: the only path that ever
-- writes a row here is record_daily_activity below, which runs as
-- SECURITY INVOKER (the calling user, same as every other RPC in this
-- app) and is therefore itself still subject to this table's RLS — the
-- insert inside it will only succeed when `auth.uid() = p_user_id`, which
-- the function also checks explicitly up front for a clear error instead
-- of a silent RLS-denied no-op.
do $$ begin
  create policy "owner_select" on xp_operations for select
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "owner_insert" on xp_operations for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Explicit table-level permissions for the intended role only — matches
-- 0007_grants.sql's explicit-grant convention for every other table, and
-- (unlike that migration, which only ever ADDS a grant) also explicitly
-- revokes the default PUBLIC grant first, so anon/public access depends
-- on nothing implicit.
revoke all on table public.xp_operations from public;

grant select, insert on table public.xp_operations to authenticated;

-- Removes ONLY the exact old 4-parameter overload by its declared type
-- list — see this file's header comment on why a plain `create or
-- replace` would leave it behind as an ambiguous second overload instead
-- of actually being replaced. `if exists` makes this safe to re-run (a
-- second application of this migration finds nothing left to drop here).
drop function if exists record_daily_activity(uuid, date, text, integer);

-- The one and only record_daily_activity after this migration. Still
-- SECURITY INVOKER (the default): runs as the calling user, under their
-- own RLS, same as before.
create or replace function record_daily_activity(
  p_user_id uuid,
  p_activity_date_local date,
  p_timezone text,
  p_xp_earned integer default 0,
  p_operation_id uuid default null
) returns void
language plpgsql
as $$
declare
  v_existing xp_operations%rowtype;
begin
  -- Explicit, distinct rejection for a MISSING auth context — not merely
  -- relying on the mismatched-user check below. In SQL's three-valued
  -- logic, `p_user_id <> auth.uid()` evaluates to NULL (neither true nor
  -- false) when auth.uid() is NULL, so an `if ... then raise` guarded
  -- only by that comparison silently does NOT raise for an
  -- unauthenticated caller — it would fall through to the rest of the
  -- function. RLS underneath (auth.uid() = user_id, which is also NULL =
  -- user_id, i.e. never true) still blocks any actual write in that case,
  -- but relying on that alone means an unauthenticated call fails late
  -- and opaquely (a generic RLS-denied error from whichever write
  -- happens to run first) instead of with this function's own clear,
  -- immediate error.
  if auth.uid() is null then
    raise exception 'record_daily_activity: authentication required' using errcode = '28000';
  end if;

  if p_user_id <> auth.uid() then
    raise exception 'record_daily_activity: cannot record activity for another user' using errcode = '42501';
  end if;

  -- Payload validation: a negative amount would (self-)drain the
  -- caller's own XP rather than award it — never a legitimate call from
  -- any real code path in this app, so reject it outright rather than
  -- silently applying it. (The auth checks above already confine any
  -- such call to the caller's OWN profile, so this is a data-integrity
  -- guard, not a cross-user security boundary.)
  if p_xp_earned < 0 then
    raise exception 'record_daily_activity: p_xp_earned must not be negative (got %)', p_xp_earned;
  end if;

  if p_operation_id is not null then
    -- Claims the ledger row FIRST, before user_daily_activity or profiles
    -- is touched at all — this is what makes the ENTIRE operation
    -- idempotent (including a 0-XP streak-qualification call), not just
    -- the XP portion of it. Atomic with everything below: this whole
    -- function runs inside ONE implicit transaction (a single plpgsql
    -- function call), so either the ledger insert and the activity/XP
    -- changes below all happen, or (on any error, including the
    -- unique-violation path right here) none of them does.
    --
    -- Concurrent retries: if two calls for the SAME (user, operation)
    -- race each other, Postgres serializes them at this insert — the
    -- second to reach it blocks until the first commits or rolls back,
    -- then either hits the unique-violation handled right here (first
    -- committed: compare payloads below) or proceeds normally (first
    -- rolled back: this one is now the sole writer). No deadlock risk:
    -- this is a single insert against one row's key, not a multi-
    -- resource lock cycle.
    begin
      insert into xp_operations (user_id, operation_id, xp_earned, activity_date_local, timezone)
      values (p_user_id, p_operation_id, p_xp_earned, p_activity_date_local, p_timezone);
      -- Freshly claimed — fall through and apply the activity/XP changes
      -- below exactly once.
    exception when unique_violation then
      -- Someone already claimed this (user, operation_id) pair — load
      -- what they stored and compare it against THIS call's payload.
      select * into v_existing from xp_operations
        where user_id = p_user_id and operation_id = p_operation_id;
      if v_existing.xp_earned = p_xp_earned
         and v_existing.activity_date_local = p_activity_date_local
         and v_existing.timezone = p_timezone then
        -- An identical retry of the exact same operation — already fully
        -- applied earlier (or is being applied right now by the call
        -- that won the race). Make NO further changes and return —
        -- never touches user_daily_activity or profiles again for this
        -- operation_id.
        return;
      else
        -- The SAME operation_id reused for a DIFFERENT payload — either
        -- a genuine client bug (e.g. two logically different operations
        -- accidentally sharing one id) or a tampered/replayed request.
        -- Never silently apply one version or the other; surface it as
        -- an error instead.
        raise exception 'record_daily_activity: operation_id % was already used with a different payload', p_operation_id;
      end if;
    end;
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

-- Explicit function-level permissions for the intended role only —
-- revokes the default PUBLIC execute grant Postgres gives a newly
-- created function (previously relied on implicitly, by neither this nor
-- any earlier migration ever running a GRANT/REVOKE on this function at
-- all) and grants it only to `authenticated`. Declared AFTER the
-- `create or replace function` above, specific to this exact 5-parameter
-- signature, so it always applies to the one real function left standing
-- once this migration finishes (see the DROP FUNCTION above).
revoke all on function record_daily_activity(uuid, date, text, integer, uuid) from public;

grant execute on function record_daily_activity(uuid, date, text, integer, uuid) to authenticated;

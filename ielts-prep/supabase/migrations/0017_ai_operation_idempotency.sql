-- ============================================================================
-- RECOVERY NOTE (added 2026-11-06, Bandpath recovery session): this file was
-- missing from this git branch entirely (the repo stopped at 0015). Recovered
-- verbatim, statement-for-statement, from supabase_migrations.schema_migrations
-- on the live "Bandpath IELTS" project (kudgtxdwbpfqobteyeqy) via the
-- Supabase Management API (read-only token) — this IS the exact SQL that ran
-- there. Confirmed independently: the ai_operations table exists in the live
-- schema, and the deployed evaluate-writing/evaluate-speaking/transcribe-audio
-- functions (v10/v10/v7, last updated 2026-10-29T11:22:59Z) literally import
-- and call claimOrGetCachedResult/recordOperationSuccess/recordOperationFailure
-- from supabase/functions/_shared/aiOperations.ts, which depends on this
-- exact table. The header comment immediately below, reading "NOT APPLIED —
-- provided for review only", is the AUTHOR's pre-deployment note at drafting
-- time and is stale — left verbatim rather than edited, since the reasoning
-- in it is accurate and worth keeping. Also recovered this session, from the
-- same live project: supabase/functions/_shared/aiOperations.ts,
-- aiOperationDecision.ts, aiProviders.ts and the three functions' index.ts
-- (see those files' own contents for the exact deployed logic) — client code
-- in lib/operationId.ts and services/ai/edgeFunctionProvider.ts was
-- reconciled against them in the same session (notably: operationId must be
-- a real RFC 4122 v4 UUID — the deployed schema validates it with Zod's
-- z.string().uuid(), which rejects any other format outright).
-- ============================================================================
-- AI provider-call idempotency (NOT APPLIED — provided for review only)
-- ============================================================================
-- Closes a gap flagged during review of the "Writing/Speaking AI errors
-- that are intermittent and can succeed on retry" investigation: raising
-- the CLIENT's own request timeout (services/ai/edgeFunctionProvider.ts)
-- stops the client from giving up before the Edge Function's own retry
-- logic could finish, but it does NOT by itself prevent a genuine
-- duplicate call to the paid AI provider. Two real, independent ways that
-- can still happen even with the client timeout fixed:
--
-- 1. Supabase Edge Functions have a 150-SECOND WALL-CLOCK REQUEST-IDLE
--    TIMEOUT ON EVERY PLAN (not just free) — see
--    https://supabase.com/docs/guides/troubleshooting/edge-function-wall-clock-time-limit-reached-Nk38bW
--    and https://github.com/orgs/supabase/discussions/40074. The platform
--    itself can kill a function mid-execution if it runs longer than
--    that, independent of anything the client does. If that happens
--    while the function's own outbound fetch() to the AI provider is
--    still in flight, the PROVIDER may still finish generating (and
--    billing for) that response — with zero record of it on our side,
--    since the function never reached its own recordUsage() call. A
--    client retry afterward would then be a genuine second provider
--    call for the same logical attempt.
-- 2. Even without a platform kill, a dropped mobile connection, an app
--    backgrounded mid-request, or simply a user who gets impatient and
--    retries, can all race a second request against a first one that's
--    still genuinely in flight server-side.
--
-- Client-side timeout tuning can't close either of these — only the
-- SERVER can, by recognizing "this exact logical operation was already
-- completed (or is still running) under this id" BEFORE ever calling the
-- provider a second time. This migration adds exactly that, mirroring
-- 0016_xp_operation_idempotency.sql's ledger pattern.
--
-- Also see the corresponding server-side retry-budget tightening in
-- supabase/functions/_shared/aiProviders.ts (transcription's maxAttempts
-- reduced from 3 to 2): 3 attempts at 60s each, with backoff, has a
-- worst case of 181.8s — ALREADY LONGER than the 150s platform ceiling
-- above, meaning the function could be killed mid-retry before even
-- reaching its own final failure/success logic. 2 attempts brings that
-- down to 120.6s, safely under the platform limit with real margin for
-- the rest of the function's own overhead (auth, rate-limit check, etc).
--
-- This table is intentionally minimal and additive, matching 0016's
-- precedent: a new table, with its own RLS, granted only to
-- `authenticated`. Nothing here drops, renames, or rewrites any existing
-- column, table, or row.

-- One row per (user, client-supplied operation id) for the THREE paid AI
-- calls this covers (writing eval, speaking eval, transcription) — see
-- supabase/functions/_shared/aiOperations.ts for the claim/complete/fail
-- lifecycle that writes and reads this. `result`/`provider` are only
-- ever populated once `status = 'completed'`; a `'pending'` row has
-- neither yet, and a `'failed'` row's `error_message` is diagnostic only
-- (never returned verbatim to a DIFFERENT request that reclaims the id —
-- see aiOperationDecision.ts, which treats 'failed' as "safe to retry
-- fresh," not as something to replay).
create table if not exists ai_operations (
  user_id uuid not null references profiles (id) on delete cascade,
  operation_id uuid not null,
  -- Which of the three call types this is — kept mainly for audit/
  -- debugging (e.g. telling a stuck 'pending' writing-eval row apart
  -- from a stuck transcription row at a glance); the actual dedup key is
  -- (user_id, operation_id) alone, same reasoning as 0016's xp_operations
  -- (operation ids are generated client-side per logical attempt, never
  -- reused across different attempts, so the type is redundant with the
  -- id itself for correctness purposes — this column is observability,
  -- not a second idempotency dimension).
  operation_type text not null check (operation_type in ('writing_eval', 'speaking_eval', 'transcription')),
  status text not null check (status in ('pending', 'completed', 'failed')),
  result jsonb,
  provider text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, operation_id)
);

-- Lets a stale-'pending' sweep (or manual debugging) find old rows
-- without a full table scan; not read by any application code's normal
-- request path today (aiOperationDecision.ts's staleness check reads the
-- single already-fetched row's own updated_at, not a separate query).
create index if not exists idx_ai_operations_pending_age
  on ai_operations (status, updated_at) where status = 'pending';

alter table ai_operations enable row level security;

-- Owner-scoped, matching every other per-user table in this app — the
-- Edge Functions run as the calling user (SECURITY INVOKER, the
-- default), so these policies are what actually confines a claim/update
-- to the authenticated caller's own rows, not merely the function's own
-- explicit auth.uid() checks (see aiOperations.ts).
do $$ begin
  create policy "owner_select" on ai_operations for select
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "owner_insert" on ai_operations for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "owner_update" on ai_operations for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- Explicit, matching 0007_grants.sql's convention for every table — even
-- though that migration's `alter default privileges` already covers any
-- table a later migration creates for `authenticated`. SELECT/INSERT/
-- UPDATE only (UPDATE is needed to complete or fail a claimed row). No
-- DELETE: rows are never deleted by application code (a completed/failed
-- row is harmless to keep indefinitely, same reasoning as xp_operations;
-- a cleanup/retention job is an operational choice for later, not part
-- of this migration).
revoke all on table public.ai_operations from anon;

revoke all on table public.ai_operations from authenticated;

grant select, insert, update on table public.ai_operations to authenticated;

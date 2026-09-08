-- Server-side audit log + rate-limit source of truth for every paid AI
-- operation (Writing eval, Speaking eval, AI Coach, transcription, study
-- plan suggestion). Written exclusively by the Supabase Edge Functions in
-- supabase/functions/ — see supabase/functions/_shared/rateLimit.ts, which
-- counts today's rows for a user+operation before allowing another call and
-- inserts a new row after every attempt. The mobile client never writes to
-- this table directly, and Demo Mode never touches it (no network calls at
-- all when Supabase isn't configured).
do $$ begin
  create type ai_operation as enum (
    'writing_eval', 'speaking_eval', 'ai_coach', 'transcription', 'study_plan_suggestion'
  );
exception when duplicate_object then null; end $$;

create table if not exists ai_usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  operation ai_operation not null,
  provider text not null,
  success boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_ai_usage_log_user_op_created on ai_usage_log (user_id, operation, created_at);

alter table ai_usage_log enable row level security;

-- Owner-only, immutable audit log: users can read their own usage history
-- and rows are inserted with their own id (matches the owner_all pattern
-- used for every other user-scoped table in 0001_init.sql), but there are
-- deliberately no update/delete policies — usage log rows must never be
-- editable by the client.
do $$ begin
  create policy "owner_read" on ai_usage_log for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "owner_insert" on ai_usage_log for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ============================================================================
-- RevenueCat webhook support
-- ============================================================================
-- Backs supabase/functions/revenuecat-webhook — the server-side, webhook-
-- driven sync of a user's real RevenueCat entitlement into `subscriptions`,
-- which is what supabase/functions/_shared/rateLimit.ts's server-side quota
-- check actually reads. Client-side syncSubscriptionEntitlement() (see
-- services/repository/core.ts) still exists as a fast local top-up when the
-- app is open, but the webhook is what keeps `subscriptions` correct even
-- when the app isn't running (a renewal, cancellation, or expiration that
-- happens while the user hasn't opened the app).

-- Tracks the timestamp of the last webhook event actually applied to a
-- user's subscription, so a late-arriving retry of an OLDER event can never
-- regress state a newer event already applied (RevenueCat's webhook
-- delivery is at-least-once and not guaranteed in-order).
alter table subscriptions add column if not exists last_webhook_event_at timestamptz;

-- Idempotency ledger: RevenueCat retries a webhook delivery on anything but
-- a fast 2xx response, so the SAME event can arrive more than once. Each
-- event's own unique id is inserted here before it's acted on; a duplicate
-- insert (primary-key conflict) is how the webhook function recognizes and
-- skips an already-processed event. Never queried or written by anything
-- but the webhook Edge Function's service-role client — the app itself has
-- no reason to ever read this table.
create table if not exists revenuecat_webhook_events (
  id text primary key,
  event_type text not null,
  app_user_id text,
  received_at timestamptz not null default now()
);

-- RLS enabled with NO policies defined below is a deliberate default-deny:
-- the anon and authenticated roles (everything the client app can ever act
-- as) get zero access to this table in either direction. Only the
-- service-role key — used exclusively by the webhook Edge Function, never
-- shipped to the client — bypasses RLS entirely, which is the only way this
-- table is ever meant to be touched.
alter table revenuecat_webhook_events enable row level security;

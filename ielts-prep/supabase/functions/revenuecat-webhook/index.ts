// Server-side sync of RevenueCat's real entitlement state into
// `subscriptions` — the table supabase/functions/_shared/rateLimit.ts's
// isPremium() actually reads for every server-side quota check. This is
// what keeps that table correct even when the app isn't open (a renewal,
// cancellation, or expiration that happens between app sessions);
// services/repository/core.ts's client-side syncSubscriptionEntitlement()
// is only a fast local top-up for while the app IS open, never the
// authoritative source.
//
// Configure this URL as the webhook in the RevenueCat dashboard (Project
// settings → Integrations → Webhooks), and set the SAME value in this
// project's REVENUECAT_WEBHOOK_AUTH_TOKEN secret as the "Authorization
// header value" RevenueCat is configured to send — that shared secret is
// the only thing proving a request genuinely came from RevenueCat and not
// an attacker forging a "this user is premium now" event. See README.md's
// RevenueCat setup section for the exact dashboard steps.
import { createClient } from 'npm:@supabase/supabase-js@2';

import { errorResponse, jsonResponse } from '../_shared/responses.ts';
import { deriveSubscriptionUpdate, type RevenueCatWebhookEvent } from '../_shared/revenuecatWebhook.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const WEBHOOK_AUTH_TOKEN = Deno.env.get('REVENUECAT_WEBHOOK_AUTH_TOKEN');

Deno.serve(async (req) => {
  if (req.method !== 'POST') return errorResponse(405, 'method_not_allowed', 'Use POST.');
  if (!SERVICE_ROLE_KEY) return errorResponse(500, 'server_not_configured', 'SUPABASE_SERVICE_ROLE_KEY is not set.');
  if (!WEBHOOK_AUTH_TOKEN) return errorResponse(500, 'server_not_configured', 'REVENUECAT_WEBHOOK_AUTH_TOKEN is not set.');

  // RevenueCat sends back exactly the "Authorization header value"
  // configured in its dashboard's webhook settings on every request — this
  // shared secret is the only authentication RevenueCat's webhooks support
  // (there is no HMAC signature). Never optional: with the header missing
  // or not matching, reject outright rather than accepting an
  // unauthenticated write to a real user's subscription.
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== WEBHOOK_AUTH_TOKEN) return errorResponse(401, 'unauthorized', 'Invalid or missing webhook authorization.');

  let body: { event?: RevenueCatWebhookEvent };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'invalid_json', 'Request body must be valid JSON.');
  }
  const event = body.event;
  if (!event?.id || !event.type || !event.app_user_id) {
    return errorResponse(400, 'invalid_request', 'Malformed event: id, type, and app_user_id are required.');
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Idempotency: insert this event's own id BEFORE acting on it. A unique-
  // constraint violation means this exact event was already processed (a
  // RevenueCat retry) — acknowledge with 200 and stop, never double-apply.
  const { error: dedupError } = await admin
    .from('revenuecat_webhook_events')
    .insert({ id: event.id, event_type: event.type, app_user_id: event.app_user_id });
  if (dedupError) {
    if (dedupError.code === '23505') return jsonResponse({ status: 'duplicate' });
    console.error('[revenuecat-webhook] failed to record event:', dedupError.message);
    return errorResponse(500, 'internal_error', 'Failed to record webhook event.');
  }

  const update = deriveSubscriptionUpdate(event);
  if (update) {
    const eventTimeIso = event.event_timestamp_ms ? new Date(event.event_timestamp_ms).toISOString() : new Date().toISOString();

    // Never let a late, out-of-order retry of an OLDER event overwrite
    // state a NEWER event already applied for this user — RevenueCat's
    // webhook delivery is at-least-once and not guaranteed in-order.
    const { data: current, error: readError } = await admin
      .from('subscriptions')
      .select('last_webhook_event_at')
      .eq('user_id', event.app_user_id)
      .maybeSingle();
    if (readError) {
      console.error('[revenuecat-webhook] failed to read current subscription:', readError.message);
      return errorResponse(500, 'internal_error', 'Failed to read current subscription state.');
    }

    const isNewerOrEqual = !current?.last_webhook_event_at || eventTimeIso >= current.last_webhook_event_at;
    if (isNewerOrEqual) {
      const { error: updateError } = await admin
        .from('subscriptions')
        .update({ ...update, revenuecat_customer_id: event.app_user_id, last_webhook_event_at: eventTimeIso })
        .eq('user_id', event.app_user_id);
      if (updateError) {
        console.error('[revenuecat-webhook] failed to update subscription:', updateError.message);
        return errorResponse(500, 'internal_error', 'Failed to update subscription.');
      }
    } else {
      console.warn(`[revenuecat-webhook] ignored out-of-order event ${event.id} for ${event.app_user_id} (older than last-applied event)`);
    }
  }

  return jsonResponse({ status: 'ok' });
});

// Pure event-mapping logic for the RevenueCat webhook — kept separate from
// revenuecat-webhook/index.ts (which has a top-level Deno.serve(...) and
// therefore can't be safely imported by a test file, same reason
// evaluate-writing/index.ts etc. are never imported by _shared/*.test.ts —
// see that directory's existing tests) so this logic is directly unit-
// testable with no server/database/network involved.

// Must match services/purchases/types.ts's PREMIUM_ENTITLEMENT_ID.
export const ENTITLEMENT_ID = 'premium';

export type RevenueCatWebhookEvent = {
  id: string;
  type: string;
  app_user_id: string;
  product_id?: string;
  entitlement_ids?: string[];
  expiration_at_ms?: number | null;
  event_timestamp_ms?: number;
};

/** Maps a RevenueCat product id to this app's plan naming — mirrors
 * services/purchases/revenuecatProvider.ts's identical helper so the client
 * and this webhook always agree on which product means which plan. Adjust
 * both together if your real Play Console product ids don't follow an
 * "...annual.../...yearly..." naming convention. */
export function planFromProductId(productId: string | undefined | null): 'premium_monthly' | 'premium_yearly' {
  const id = (productId ?? '').toLowerCase();
  return id.includes('annual') || id.includes('year') ? 'premium_yearly' : 'premium_monthly';
}

export type SubscriptionUpdate = { plan: 'free' | 'premium_monthly' | 'premium_yearly'; status: string; current_period_end: string | null };

/** Pure decision function: given one RevenueCat webhook event, what (if
 * anything) should be written to `subscriptions`. Returns null for event
 * types that intentionally require no state change (BILLING_ISSUE,
 * SUBSCRIPTION_PAUSED, etc.) — the event is still recorded in
 * revenuecat_webhook_events for audit purposes either way, just not acted
 * on here. */
export function deriveSubscriptionUpdate(event: RevenueCatWebhookEvent): SubscriptionUpdate | null {
  const entitled = !event.entitlement_ids || event.entitlement_ids.length === 0 || event.entitlement_ids.includes(ENTITLEMENT_ID);
  const currentPeriodEnd = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;

  switch (event.type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'UNCANCELLATION':
    case 'PRODUCT_CHANGE':
    case 'NON_RENEWING_PURCHASE':
    case 'TRANSFER':
      if (!entitled) return null;
      return { plan: planFromProductId(event.product_id), status: 'active', current_period_end: currentPeriodEnd };
    case 'CANCELLATION':
      // Auto-renew turned off — the entitlement itself typically stays
      // active until `expiration_at_ms`, so the plan is kept (not reset to
      // free) and only the status changes, matching how
      // syncSubscriptionEntitlement's client-side equivalent already
      // treats `willRenew === false`.
      return { plan: planFromProductId(event.product_id), status: 'cancelled', current_period_end: currentPeriodEnd };
    case 'EXPIRATION':
      return { plan: 'free', status: 'expired', current_period_end: null };
    default:
      // BILLING_ISSUE, SUBSCRIPTION_PAUSED, SUBSCRIPTION_EXTENDED, TEST,
      // and any future event type: acknowledged (still recorded in the
      // idempotency ledger below) but deliberately not acted on here,
      // rather than guessing at behavior the task didn't specify.
      return null;
  }
}

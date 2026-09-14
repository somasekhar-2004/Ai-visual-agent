// Unit tests for the pure event-mapping logic used by
// revenuecat-webhook/index.ts. Run with (from supabase/functions/):
//   deno test --allow-env --allow-read --node-modules-dir=none _shared/revenuecatWebhook.test.ts
import { strict as assert } from 'node:assert';

import { deriveSubscriptionUpdate, planFromProductId, type RevenueCatWebhookEvent } from './revenuecatWebhook.ts';

function baseEvent(overrides: Partial<RevenueCatWebhookEvent>): RevenueCatWebhookEvent {
  return {
    id: 'evt-1',
    type: 'INITIAL_PURCHASE',
    app_user_id: 'user-1',
    product_id: 'com.ieltsprep.app.premium.monthly',
    entitlement_ids: ['premium'],
    ...overrides,
  };
}

Deno.test('planFromProductId: an annual/yearly product id maps to premium_yearly', () => {
  assert.equal(planFromProductId('com.ieltsprep.app.premium.yearly'), 'premium_yearly');
  assert.equal(planFromProductId('com.ieltsprep.app.premium.annual'), 'premium_yearly');
});

Deno.test('planFromProductId: anything else (including monthly, unknown, or missing) maps to premium_monthly', () => {
  assert.equal(planFromProductId('com.ieltsprep.app.premium.monthly'), 'premium_monthly');
  assert.equal(planFromProductId('something_unexpected'), 'premium_monthly');
  assert.equal(planFromProductId(undefined), 'premium_monthly');
  assert.equal(planFromProductId(null), 'premium_monthly');
});

Deno.test('deriveSubscriptionUpdate: INITIAL_PURCHASE grants the correct plan as active', () => {
  const update = deriveSubscriptionUpdate(baseEvent({ type: 'INITIAL_PURCHASE', expiration_at_ms: 1735689600000 }));
  assert.deepEqual(update, { plan: 'premium_monthly', status: 'active', current_period_end: new Date(1735689600000).toISOString() });
});

Deno.test('deriveSubscriptionUpdate: RENEWAL, UNCANCELLATION, PRODUCT_CHANGE, NON_RENEWING_PURCHASE, TRANSFER all grant active premium', () => {
  for (const type of ['RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE', 'NON_RENEWING_PURCHASE', 'TRANSFER']) {
    const update = deriveSubscriptionUpdate(baseEvent({ type, product_id: 'com.ieltsprep.app.premium.yearly' }));
    assert.equal(update?.plan, 'premium_yearly');
    assert.equal(update?.status, 'active');
  }
});

Deno.test('deriveSubscriptionUpdate: CANCELLATION keeps the plan but marks status cancelled (still entitled until expiration)', () => {
  const update = deriveSubscriptionUpdate(baseEvent({ type: 'CANCELLATION', product_id: 'com.ieltsprep.app.premium.yearly', expiration_at_ms: 1735689600000 }));
  assert.deepEqual(update, { plan: 'premium_yearly', status: 'cancelled', current_period_end: new Date(1735689600000).toISOString() });
});

Deno.test('deriveSubscriptionUpdate: EXPIRATION resets to free with no period end', () => {
  const update = deriveSubscriptionUpdate(baseEvent({ type: 'EXPIRATION' }));
  assert.deepEqual(update, { plan: 'free', status: 'expired', current_period_end: null });
});

Deno.test('deriveSubscriptionUpdate: an event for a different entitlement (not "premium") is never acted on', () => {
  const update = deriveSubscriptionUpdate(baseEvent({ type: 'INITIAL_PURCHASE', entitlement_ids: ['some_other_addon'] }));
  assert.equal(update, null);
});

Deno.test('deriveSubscriptionUpdate: an event with no entitlement_ids at all is still acted on (older RevenueCat payloads may omit it)', () => {
  const update = deriveSubscriptionUpdate(baseEvent({ type: 'INITIAL_PURCHASE', entitlement_ids: undefined }));
  assert.equal(update?.status, 'active');
});

Deno.test('deriveSubscriptionUpdate: unrecognized/informational event types (BILLING_ISSUE, etc.) are acknowledged but never change subscription state', () => {
  for (const type of ['BILLING_ISSUE', 'SUBSCRIPTION_PAUSED', 'SUBSCRIPTION_EXTENDED', 'SOME_FUTURE_EVENT_TYPE']) {
    assert.equal(deriveSubscriptionUpdate(baseEvent({ type })), null);
  }
});

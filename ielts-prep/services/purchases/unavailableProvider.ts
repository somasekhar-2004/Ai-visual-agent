import type { EntitlementStatus, PurchaseProduct, PurchaseResult, PurchasesProvider } from './types';

/** Used when a real Supabase backend is configured but RevenueCat's API key
 * isn't set yet — i.e. real user accounts exist, but there is no real
 * payment processor wired up. In this state the app must NEVER fall back
 * to MockPurchasesProvider's simulated "always succeeds" purchase: that
 * would let a real account write a fabricated active Premium subscription
 * into the real `subscriptions` table with no payment ever taking place.
 * Every method here fails safely instead — no products to buy, no purchase
 * to make, nothing to restore, never entitled. */
export class UnavailablePurchasesProvider implements PurchasesProvider {
  readonly name = 'unavailable';

  async getProducts(): Promise<PurchaseProduct[]> {
    return [];
  }

  async purchase(): Promise<PurchaseResult> {
    return { success: false, kind: 'error', error: 'Subscriptions are not available yet. Please try again later.' };
  }

  async restore(): Promise<PurchaseResult> {
    return { success: false, kind: 'error', error: 'Subscriptions are not available yet. Please try again later.' };
  }

  async checkEntitlement(): Promise<EntitlementStatus> {
    return { active: false, plan: null, expirationDate: null, willRenew: null };
  }

  async login(): Promise<void> {}
  async logout(): Promise<void> {}
}

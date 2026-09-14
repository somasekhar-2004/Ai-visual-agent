import type { EntitlementStatus, PurchaseProduct, PurchaseResult, PurchasesProvider } from './types';

// Placeholder pricing for Demo Mode only (no real Supabase/RevenueCat
// configured) — reflects the app's initial India launch pricing direction
// (₹299/month, ₹2,499/year) purely so the simulated paywall looks
// realistic. This is NEVER what a real purchase charges: with RevenueCat
// actually configured, every price shown anywhere in the app comes from
// `PurchasesPackage.product.priceString` (see revenuecatProvider.ts),
// already formatted and localized by the store for the buyer's own
// country/currency — nothing about a real price is ever hardcoded here or
// in the UI that renders it.
const PRODUCTS: PurchaseProduct[] = [
  {
    identifier: 'premium_monthly',
    plan: 'premium_monthly',
    title: 'Premium Monthly',
    description: 'Full access to all IELTS Prep features, billed monthly.',
    priceString: '₹299/month',
    price: 299,
    pricePerMonth: 299,
    period: 'monthly',
    trialDays: 7,
  },
  {
    identifier: 'premium_yearly',
    plan: 'premium_yearly',
    title: 'Premium Yearly',
    description: 'Full access to all IELTS Prep features — best value, billed yearly.',
    priceString: '₹2,499/year',
    price: 2499,
    pricePerMonth: 2499 / 12,
    period: 'yearly',
    trialDays: 7,
  },
];

/** Simulates App Store / Play Store purchases so the whole paywall flow can
 * be demoed without a RevenueCat project or real store products configured.
 * Only ever used in genuine Demo Mode (no real Supabase project) — see
 * services/purchases/index.ts's provider selection. A real Supabase backend
 * with RevenueCat not yet configured gets UnavailablePurchasesProvider
 * instead, specifically so a "successful" simulated purchase here can never
 * write a fabricated Premium subscription into a real user's account. */
export class MockPurchasesProvider implements PurchasesProvider {
  readonly name = 'mock';

  async getProducts(): Promise<PurchaseProduct[]> {
    return PRODUCTS;
  }

  async purchase(productIdentifier: string): Promise<PurchaseResult> {
    await new Promise((r) => setTimeout(r, 600));
    const product = PRODUCTS.find((p) => p.identifier === productIdentifier);
    if (!product) return { success: false, kind: 'error', error: 'Unknown product.' };
    return { success: true, kind: 'success', plan: product.plan };
  }

  async restore(): Promise<PurchaseResult> {
    await new Promise((r) => setTimeout(r, 400));
    return { success: false, kind: 'error', error: 'No previous purchase found in Demo Mode.' };
  }

  async checkEntitlement(): Promise<EntitlementStatus> {
    // Demo Mode has no external store to re-check against — the locally
    // stored subscription record (set at purchase time) is already the
    // source of truth, so there is nothing to reconcile here.
    return { active: false, plan: null, expirationDate: null, willRenew: null };
  }

  // No real store identity to attach/detach in Demo Mode.
  async login(): Promise<void> {}
  async logout(): Promise<void> {}
}

import type { EntitlementStatus, PurchaseProduct, PurchaseResult, PurchasesProvider } from './types';

// Placeholder pricing used only by this test double (never wired into the
// runtime provider selection in services/purchases/index.ts — see that
// file) — reflects the app's initial India launch pricing direction
// (₹299/month, ₹2,499/year) purely so tests exercising the paywall have
// realistic-looking data. This is NEVER what a real purchase charges: with
// RevenueCat actually configured, every price shown anywhere in the app
// comes from `PurchasesPackage.product.priceString` (see
// revenuecatProvider.ts), already formatted and localized by the store for
// the buyer's own country/currency — nothing about a real price is ever
// hardcoded here or in the UI that renders it.
const PRODUCTS: PurchaseProduct[] = [
  {
    identifier: 'premium_monthly',
    plan: 'premium_monthly',
    title: 'Premium Monthly',
    description: 'Full access to all Bandpath IELTS features, billed monthly.',
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
    description: 'Full access to all Bandpath IELTS features — best value, billed yearly.',
    priceString: '₹2,499/year',
    price: 2499,
    pricePerMonth: 2499 / 12,
    period: 'yearly',
    trialDays: 7,
  },
];

/** Test double that simulates App Store / Play Store purchases, used only by
 * Jest tests exercising the paywall flow — see __tests__/purchases.test.ts.
 * NEVER imported by services/purchases/index.ts's runtime provider
 * selection: a real backend with RevenueCat not yet configured gets
 * UnavailablePurchasesProvider instead, specifically so a "successful"
 * simulated purchase can never write a fabricated Premium subscription into
 * a real user's account. */
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
    return { success: false, kind: 'error', error: 'No previous purchase found.' };
  }

  async checkEntitlement(): Promise<EntitlementStatus> {
    // No external store to re-check against in this test double — there is
    // nothing to reconcile here.
    return { active: false, plan: null, expirationDate: null, willRenew: null };
  }

  // No real store identity to attach/detach in this test double.
  async login(): Promise<void> {}
  async logout(): Promise<void> {}
}

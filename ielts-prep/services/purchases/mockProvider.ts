import type { PurchaseProduct, PurchaseResult, PurchasesProvider } from './types';

const PRODUCTS: PurchaseProduct[] = [
  {
    identifier: 'premium_monthly',
    plan: 'premium_monthly',
    title: 'Premium Monthly',
    description: 'Full access to all IELTS Prep features, billed monthly.',
    priceString: '$9.99/month',
    period: 'monthly',
    trialDays: 7,
  },
  {
    identifier: 'premium_yearly',
    plan: 'premium_yearly',
    title: 'Premium Yearly',
    description: 'Full access to all IELTS Prep features — best value, billed yearly.',
    priceString: '$59.99/year',
    period: 'yearly',
    trialDays: 7,
  },
];

/** Simulates App Store / Play Store purchases so the whole paywall flow can
 * be demoed without a RevenueCat project or real store products configured. */
export class MockPurchasesProvider implements PurchasesProvider {
  readonly name = 'mock';

  async getProducts(): Promise<PurchaseProduct[]> {
    return PRODUCTS;
  }

  async purchase(productIdentifier: string): Promise<PurchaseResult> {
    await new Promise((r) => setTimeout(r, 600));
    const product = PRODUCTS.find((p) => p.identifier === productIdentifier);
    if (!product) return { success: false, error: 'Unknown product.' };
    return { success: true, plan: product.plan };
  }

  async restore(): Promise<PurchaseResult> {
    await new Promise((r) => setTimeout(r, 400));
    return { success: false, error: 'No previous purchase found in Demo Mode.' };
  }
}

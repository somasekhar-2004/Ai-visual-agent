import { Platform } from 'react-native';

import { REVENUECAT_API_KEY_ANDROID, REVENUECAT_API_KEY_IOS } from '@/lib/env';

import type { EntitlementStatus, PurchaseProduct, PurchaseResult, PurchasesProvider } from './types';

let configured = false;

async function getPurchasesModule() {
  // Lazy import: react-native-purchases requires native code, so keep it out
  // of the bundle graph unless a real RevenueCat key is actually configured.
  const mod = await import('react-native-purchases');
  return mod.default;
}

async function ensureConfigured() {
  if (configured) return;
  const Purchases = await getPurchasesModule();
  const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
  Purchases.configure({ apiKey });
  configured = true;
}

export class RevenueCatProvider implements PurchasesProvider {
  readonly name = 'revenuecat';

  async getProducts(): Promise<PurchaseProduct[]> {
    await ensureConfigured();
    const Purchases = await getPurchasesModule();
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return [];
    return current.availablePackages.map((pkg) => ({
      identifier: pkg.identifier,
      plan: pkg.packageType === 'ANNUAL' ? 'premium_yearly' : 'premium_monthly',
      title: pkg.product.title,
      description: pkg.product.description,
      priceString: pkg.product.priceString,
      period: pkg.packageType === 'ANNUAL' ? 'yearly' : 'monthly',
    }));
  }

  async purchase(productIdentifier: string): Promise<PurchaseResult> {
    await ensureConfigured();
    const Purchases = await getPurchasesModule();
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find((p) => p.identifier === productIdentifier);
      if (!pkg) return { success: false, error: 'Product not found.' };
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPremium = Object.keys(customerInfo.entitlements.active).length > 0;
      return { success: isPremium, plan: pkg.packageType === 'ANNUAL' ? 'premium_yearly' : 'premium_monthly' };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  async restore(): Promise<PurchaseResult> {
    await ensureConfigured();
    const Purchases = await getPurchasesModule();
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = Object.keys(customerInfo.entitlements.active).length > 0;
      return { success: isPremium, error: isPremium ? undefined : 'No active subscription found for this account.' };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  /** Re-reads the store's own customer info — the source of truth for
   * whether a subscription is still active, independent of whatever the app
   * last wrote to Supabase/demoStore. Call on launch/foreground so a
   * cancellation or expiry made outside the app (App Store / Play Store
   * settings) is picked up without the user having to reopen the paywall. */
  async checkEntitlement(): Promise<EntitlementStatus> {
    await ensureConfigured();
    const Purchases = await getPurchasesModule();
    // Intentionally not caught here: a network/SDK failure should propagate
    // so the caller can leave the last-known local subscription state alone
    // instead of mistaking "couldn't check" for "confirmed not active."
    const customerInfo = await Purchases.getCustomerInfo();
    const active = Object.values(customerInfo.entitlements.active)[0] as
      | { productIdentifier?: string; expirationDate?: string | null; willRenew?: boolean }
      | undefined;
    if (!active) return { active: false, plan: null, expirationDate: null, willRenew: null };
    // Adjust this to match your actual RevenueCat product identifiers if
    // they don't follow an "...annual.../...yearly..." naming convention.
    const productId = (active.productIdentifier ?? '').toLowerCase();
    const plan = productId.includes('annual') || productId.includes('year') ? 'premium_yearly' : 'premium_monthly';
    return {
      active: true,
      plan,
      expirationDate: active.expirationDate ?? null,
      willRenew: active.willRenew ?? null,
    };
  }
}

import { Platform } from 'react-native';

import { REVENUECAT_API_KEY_ANDROID, REVENUECAT_API_KEY_IOS } from '@/lib/env';

import type { PurchaseProduct, PurchaseResult, PurchasesProvider } from './types';

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
}

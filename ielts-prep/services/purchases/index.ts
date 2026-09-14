import { isDemoMode, isRevenueCatConfigured } from '@/lib/env';

import { MockPurchasesProvider } from './mockProvider';
import { RevenueCatProvider } from './revenuecatProvider';
import type { PurchasesProvider } from './types';
import { UnavailablePurchasesProvider } from './unavailableProvider';

export * from './types';

// Provider selection is keyed off TWO independent facts, not one:
//  - isDemoMode: is there a real Supabase backend at all?
//  - isRevenueCatConfigured: is a real payment processor wired up?
// Demo Mode always gets the mock provider (there is no real account to
// corrupt). A REAL Supabase backend with RevenueCat not yet configured
// must NOT also get the mock provider — that would let a real account
// "purchase" a fabricated Premium subscription with no payment ever
// happening (see unavailableProvider.ts's comment) — it gets
// UnavailablePurchasesProvider instead, which fails safely with no fake
// success. Only a real backend with real RevenueCat keys gets the real
// provider.
const provider: PurchasesProvider = isDemoMode
  ? new MockPurchasesProvider()
  : isRevenueCatConfigured
    ? new RevenueCatProvider()
    : new UnavailablePurchasesProvider();

export function getPurchasesProvider(): PurchasesProvider {
  return provider;
}

export function isPurchasesMocked(): boolean {
  return provider.name === 'mock';
}

/** True when a real Supabase backend exists but RevenueCat hasn't been
 * configured yet — the paywall should say so plainly rather than pretend a
 * purchase can be made. */
export function isPurchasesUnavailable(): boolean {
  return provider.name === 'unavailable';
}

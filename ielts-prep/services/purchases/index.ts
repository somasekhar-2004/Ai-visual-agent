import { isRevenueCatConfigured } from '@/lib/env';

import { RevenueCatProvider } from './revenuecatProvider';
import type { PurchasesProvider } from './types';
import { UnavailablePurchasesProvider } from './unavailableProvider';

export * from './types';

// A real Supabase backend with RevenueCat not yet configured must NEVER get
// a mock/simulated purchase provider — that would let a real account
// "purchase" a fabricated Premium subscription with no payment ever
// happening (see unavailableProvider.ts's comment). It gets
// UnavailablePurchasesProvider instead, which fails safely with no fake
// success. Only real RevenueCat keys get the real provider.
const provider: PurchasesProvider = isRevenueCatConfigured ? new RevenueCatProvider() : new UnavailablePurchasesProvider();

export function getPurchasesProvider(): PurchasesProvider {
  return provider;
}

/** True when a real Supabase backend exists but RevenueCat hasn't been
 * configured yet — the paywall should say so plainly rather than pretend a
 * purchase can be made. */
export function isPurchasesUnavailable(): boolean {
  return provider.name === 'unavailable';
}

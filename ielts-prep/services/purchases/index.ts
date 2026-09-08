import { isRevenueCatConfigured } from '@/lib/env';

import { MockPurchasesProvider } from './mockProvider';
import { RevenueCatProvider } from './revenuecatProvider';
import type { PurchasesProvider } from './types';

export * from './types';

const provider: PurchasesProvider = isRevenueCatConfigured ? new RevenueCatProvider() : new MockPurchasesProvider();

export function getPurchasesProvider(): PurchasesProvider {
  return provider;
}

export function isPurchasesMocked(): boolean {
  return provider.name === 'mock';
}

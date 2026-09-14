import type { PurchaseProduct } from '@/services/purchases';

/** How much cheaper the yearly plan's monthly-equivalent rate is than
 * actually paying the monthly plan every month, as a whole-number
 * percentage (e.g. 30 for "30% cheaper"). Computed purely from the two
 * products' own numeric `pricePerMonth` (itself computed by RevenueCat from
 * the store's real localized price, never a hardcoded currency value) — so
 * this works correctly in whatever currency/region the buyer's store
 * actually charges in, with nothing about a specific price ever appearing
 * in this app's code. Returns null when either product's numeric price is
 * unavailable (nothing to safely compute a percentage from) rather than
 * guessing or falling back to a hardcoded figure. */
export function computeYearlySavingsPercent(monthly: PurchaseProduct | undefined, yearly: PurchaseProduct | undefined): number | null {
  const monthlyRate = monthly?.pricePerMonth ?? monthly?.price ?? null;
  const yearlyRate = yearly?.pricePerMonth;
  if (monthlyRate == null || yearlyRate == null || monthlyRate <= 0) return null;
  const savings = 1 - yearlyRate / monthlyRate;
  if (savings <= 0) return null;
  return Math.round(savings * 100);
}

import type { SubscriptionPlan } from '@/types/models';

export type PurchaseProduct = {
  identifier: string;
  plan: SubscriptionPlan;
  title: string;
  description: string;
  priceString: string;
  period: 'monthly' | 'yearly';
  trialDays?: number;
};

export type PurchaseResult = { success: boolean; plan?: SubscriptionPlan; error?: string };

/** The current entitlement state as the store actually sees it right now —
 * distinct from `PurchaseResult`, which only reports the outcome of a single
 * purchase/restore action. Used to detect expiry/cancellation that happened
 * outside the app (e.g. the user cancelled from the App Store settings). */
export type EntitlementStatus = {
  active: boolean;
  plan: SubscriptionPlan | null;
  /** ISO date the current entitlement period ends, if known. */
  expirationDate: string | null;
  /** false once the user has cancelled but the entitlement hasn't expired yet. null when unknown/not applicable. */
  willRenew: boolean | null;
};

export interface PurchasesProvider {
  readonly name: string;
  getProducts(): Promise<PurchaseProduct[]>;
  purchase(productIdentifier: string): Promise<PurchaseResult>;
  restore(): Promise<PurchaseResult>;
  /** Re-checks the store's own record of the user's entitlement, independent
   * of whatever is currently cached locally/in Supabase. Call this on app
   * launch/foreground so an expired or cancelled subscription is reflected
   * even if the user never opens the paywall/restore flow again. */
  checkEntitlement(): Promise<EntitlementStatus>;
}

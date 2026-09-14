import type { SubscriptionPlan } from '@/types/models';

/** The single RevenueCat entitlement this app grants premium access through
 * — configured once in the RevenueCat dashboard (Entitlements → create
 * "premium", attach both the monthly and yearly products to it). Checking
 * this specific identifier (rather than "is any entitlement active") is
 * deliberate: a future second entitlement (e.g. a one-off add-on) must
 * never be silently treated as full Premium access. */
export const PREMIUM_ENTITLEMENT_ID = 'premium';

export type PurchaseProduct = {
  identifier: string;
  plan: SubscriptionPlan;
  title: string;
  description: string;
  priceString: string;
  /** Raw numeric price in the local currency — never shown directly (use
   * `priceString`, which is already correctly formatted/localized), but
   * needed to compute a yearly-vs-monthly savings percentage without
   * parsing/hardcoding a currency symbol. Null when the store didn't report
   * a numeric price (e.g. the mock/unavailable providers, or an unusual
   * store product). */
  price: number | null;
  /** The product's price normalized to a monthly rate — for a yearly plan
   * this is the yearly price divided by 12 (RevenueCat computes this from
   * the store's own base-plan data). Used purely to compute "X% cheaper
   * than paying monthly" — never displayed as its own price string. */
  pricePerMonth: number | null;
  period: 'monthly' | 'yearly';
  trialDays?: number;
};

export type PurchaseResultKind =
  | 'success'
  | 'cancelled'
  | 'pending'
  | 'already_owned'
  | 'network_error'
  | 'error';

export type PurchaseResult = {
  success: boolean;
  plan?: SubscriptionPlan;
  error?: string;
  /** Distinguishes *why* a purchase/restore didn't succeed so the UI can
   * respond appropriately — a user backing out of the store sheet
   * (`cancelled`) must never be shown the same scary red error text as a
   * genuine failure. `success` alone can't carry this distinction. */
  kind: PurchaseResultKind;
};

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
  /** Identifies the current store customer as this specific, stable,
   * authenticated account id (the Supabase user id — never an email
   * address, which can change and isn't guaranteed unique/stable the same
   * way). Must be called after every sign-in, including switching from one
   * account to another on the same device, so a purchase/restore always
   * attaches to the right person. A no-op for providers with no real store
   * identity (mock/unavailable). */
  login(userId: string): Promise<void>;
  /** Reverts to an anonymous store identity on sign-out, so the next
   * session (a different account, or a fresh anonymous browse) never
   * inherits the previous user's cached entitlement. A no-op for providers
   * with no real store identity (mock/unavailable). */
  logout(): Promise<void>;
}

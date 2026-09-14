import { Platform } from 'react-native';

import { REVENUECAT_API_KEY_ANDROID, REVENUECAT_API_KEY_IOS } from '@/lib/env';

import { PREMIUM_ENTITLEMENT_ID } from './types';
import type { EntitlementStatus, PurchaseProduct, PurchaseResult, PurchaseResultKind, PurchasesProvider } from './types';

let configured = false;

async function getPurchasesModule() {
  // Lazy require (not a static top-of-file import): react-native-purchases
  // requires native code, so this keeps it from being touched at all unless
  // a purchases call is actually made. A plain `require()` here — rather
  // than `await import(...)` — is deliberate: Metro compiles both to the
  // same underlying module load, so there is no behavior difference in the
  // real app either way, but a literal runtime `import()` expression is
  // left untouched by babel-preset-expo (it targets an engine with native
  // dynamic-import support) and Jest's CJS test environment can't execute
  // that without `--experimental-vm-modules` — `require()` is what
  // `jest.mock('react-native-purchases', ...)` actually intercepts, which
  // is what makes this provider's tests possible at all (see
  // __tests__/subscriptionPurchaseFlow.test.ts).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('react-native-purchases');
  return mod.default as typeof import('react-native-purchases').default;
}

async function ensureConfigured() {
  if (configured) return;
  const Purchases = await getPurchasesModule();
  const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
  // Deliberately configured WITHOUT an appUserID here — this only runs once,
  // the first time any purchases call is made, which can happen before the
  // app knows which (if any) Supabase user is signed in. RevenueCat starts
  // this device on an anonymous id; login()/logout() below (called from
  // useAppStore's hydrate()/signOut()) are what actually attach the real,
  // stable Supabase user id, exactly as RevenueCat's own "identifying
  // users" guide recommends for apps whose own auth resolves after launch.
  Purchases.configure({ apiKey });
  configured = true;
}

function planFromProductId(productId: string | undefined | null): 'premium_monthly' | 'premium_yearly' {
  const id = (productId ?? '').toLowerCase();
  // Adjust this to match your actual RevenueCat/Play Console product ids if
  // they don't follow an "...annual.../...yearly..." naming convention —
  // see README's RevenueCat setup section for the exact ids this app
  // expects (com.ieltsprep.app.premium.monthly / .yearly).
  return id.includes('annual') || id.includes('year') ? 'premium_yearly' : 'premium_monthly';
}

function packageToProduct(pkg: import('react-native-purchases').PurchasesPackage): PurchaseProduct {
  return {
    identifier: pkg.identifier,
    plan: pkg.packageType === 'ANNUAL' ? 'premium_yearly' : 'premium_monthly',
    title: pkg.product.title,
    description: pkg.product.description,
    priceString: pkg.product.priceString,
    price: pkg.product.price ?? null,
    pricePerMonth: pkg.product.pricePerMonth ?? null,
    period: pkg.packageType === 'ANNUAL' ? 'yearly' : 'monthly',
  };
}

/** Maps a thrown react-native-purchases error to the result kind the UI
 * needs to react appropriately — most importantly, telling a user who
 * simply backed out of the store sheet (PURCHASE_CANCELLED_ERROR) apart
 * from an actual failure, so cancellation is never shown as a scary error. */
function classifyError(err: unknown): { kind: PurchaseResultKind; message: string } {
  const e = err as { code?: string; message?: string; userCancelled?: boolean | null } | undefined;
  const message = e?.message ?? 'Something went wrong with the purchase.';
  // '1' = PURCHASE_CANCELLED_ERROR. Checked by code first (the SDK's
  // documented, non-deprecated way); userCancelled is kept as a fallback in
  // case a given platform/SDK version only sets the older flag.
  if (e?.code === '1' || e?.userCancelled) return { kind: 'cancelled', message: 'Purchase cancelled.' };
  if (e?.code === '6') return { kind: 'already_owned', message: 'You already have an active subscription on this account.' };
  if (e?.code === '20') return { kind: 'pending', message: 'Your payment is pending approval — Premium will activate once it clears.' };
  if (e?.code === '10' || e?.code === '35') return { kind: 'network_error', message: 'No internet connection — check your network and try again.' };
  return { kind: 'error', message };
}

export class RevenueCatProvider implements PurchasesProvider {
  readonly name = 'revenuecat';

  async getProducts(): Promise<PurchaseProduct[]> {
    await ensureConfigured();
    const Purchases = await getPurchasesModule();
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return [];
    return current.availablePackages.map(packageToProduct);
  }

  async purchase(productIdentifier: string): Promise<PurchaseResult> {
    await ensureConfigured();
    const Purchases = await getPurchasesModule();
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find((p) => p.identifier === productIdentifier);
      if (!pkg) return { success: false, kind: 'error', error: 'Product not found.' };
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const entitled = Boolean(customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID]);
      if (!entitled) return { success: false, kind: 'error', error: 'Purchase completed, but the premium entitlement was not granted. Please contact support.' };
      return { success: true, kind: 'success', plan: pkg.packageType === 'ANNUAL' ? 'premium_yearly' : 'premium_monthly' };
    } catch (err) {
      const { kind, message } = classifyError(err);
      return { success: false, kind, error: message };
    }
  }

  async restore(): Promise<PurchaseResult> {
    await ensureConfigured();
    const Purchases = await getPurchasesModule();
    try {
      const customerInfo = await Purchases.restorePurchases();
      const active = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
      if (!active) return { success: false, kind: 'error', error: 'No active subscription found for this account.' };
      return { success: true, kind: 'success', plan: planFromProductId(active.productIdentifier) };
    } catch (err) {
      const { kind, message } = classifyError(err);
      return { success: false, kind, error: message };
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
    const active = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
    if (!active) return { active: false, plan: null, expirationDate: null, willRenew: null };
    return {
      active: true,
      plan: planFromProductId(active.productIdentifier),
      expirationDate: active.expirationDate ?? null,
      willRenew: active.willRenew ?? null,
    };
  }

  /** Attaches this device's RevenueCat customer to the given (Supabase)
   * user id. Safe to call on every sign-in, including switching from one
   * already-identified account to another — RevenueCat's logIn() handles
   * both "first time seeing this id" and "already this id" cases. */
  async login(userId: string): Promise<void> {
    await ensureConfigured();
    const Purchases = await getPurchasesModule();
    await Purchases.logIn(userId);
  }

  /** Reverts to a fresh anonymous RevenueCat identity. Call on sign-out so
   * the next person to use this device (or the same person browsing before
   * signing back in) never sees the previous account's cached entitlement. */
  async logout(): Promise<void> {
    await ensureConfigured();
    const Purchases = await getPurchasesModule();
    await Purchases.logOut();
  }
}

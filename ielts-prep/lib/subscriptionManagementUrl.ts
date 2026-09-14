// Must match app.json's android.package exactly — Google Play's
// subscription-center deep link is keyed by package name, not any
// RevenueCat/app identifier.
const ANDROID_PACKAGE_NAME = 'com.ieltsprep.app';

/** The Google Play Store URL that opens this app's active subscription
 * directly in the user's subscription-management settings — tapping
 * "Manage subscription" hands the user off to Play's own cancel/change-plan
 * UI rather than this app trying to implement subscription cancellation
 * itself (Google Play requires and handles that natively; an app-side
 * "cancel" button would not actually cancel real billing). Passing a
 * `productId` deep-links straight to that specific subscription; omitting
 * it opens the account's full subscriptions list. */
export function googlePlaySubscriptionManagementUrl(productId?: string | null): string {
  const params = new URLSearchParams({ package: ANDROID_PACKAGE_NAME });
  if (productId) params.set('sku', productId);
  return `https://play.google.com/store/account/subscriptions?${params.toString()}`;
}

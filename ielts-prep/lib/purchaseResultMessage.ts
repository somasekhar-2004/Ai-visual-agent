import type { PurchaseResult } from '@/services/purchases';

export type PurchaseResultDisplay = {
  /** 'info' for a benign/expected outcome (cancellation) that must never
   * render with error styling — everything else is 'error'. */
  tone: 'info' | 'error';
  message: string;
};

/** The single place that turns a PurchaseResult into user-facing copy, so
 * the paywall and the subscription-management screen never drift into
 * showing different wording for the same outcome. A user simply closing
 * the store's purchase sheet is common and expected — showing it with the
 * same red, alarming styling as a real failure (a declined card, a network
 * timeout) would be a bad, confusing experience, so `cancelled` gets its
 * own calm, neutral tone and copy here. */
export function purchaseResultMessage(result: PurchaseResult): PurchaseResultDisplay {
  switch (result.kind) {
    case 'success':
      return { tone: 'info', message: 'Success! Welcome to Premium.' };
    case 'cancelled':
      return { tone: 'info', message: 'No changes made — you cancelled the purchase.' };
    case 'pending':
      return { tone: 'info', message: result.error ?? 'Your payment is pending approval — Premium will activate once it clears.' };
    case 'already_owned':
      return { tone: 'info', message: result.error ?? 'You already have an active subscription on this account. Try Restore purchases.' };
    case 'network_error':
      return { tone: 'error', message: result.error ?? 'No internet connection — check your network and try again.' };
    case 'error':
    default:
      return { tone: 'error', message: result.error ?? 'Purchase could not be completed. Please try again.' };
  }
}

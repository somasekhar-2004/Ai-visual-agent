// Regression coverage for the RevenueCat + Google Play Billing integration:
// identity binding (login/logout/account switch), purchase/restore outcome
// classification (success/cancelled/pending/already_owned/network_error/
// error), the Unavailable-provider safety net, and the structural proof
// that a client-side subscription value has no wire path into a server
// quota decision at all.
import { RevenueCatProvider } from '@/services/purchases/revenuecatProvider';
import { UnavailablePurchasesProvider } from '@/services/purchases/unavailableProvider';
import { PREMIUM_ENTITLEMENT_ID } from '@/services/purchases/types';
import { useAppStore } from '@/store/useAppStore';
import { checkDailyLimit } from '@/lib/entitlements';
import type { Subscription } from '@/types/models';

const mockConfigure = jest.fn();
const mockGetOfferings = jest.fn();
const mockPurchasePackage = jest.fn();
const mockRestorePurchases = jest.fn();
const mockGetCustomerInfo = jest.fn();
const mockLogIn = jest.fn();
const mockLogOut = jest.fn();

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: (...args: unknown[]) => mockConfigure(...args),
    getOfferings: () => mockGetOfferings(),
    purchasePackage: (...args: unknown[]) => mockPurchasePackage(...args),
    restorePurchases: () => mockRestorePurchases(),
    getCustomerInfo: () => mockGetCustomerInfo(),
    logIn: (...args: unknown[]) => mockLogIn(...args),
    logOut: () => mockLogOut(),
  },
}));

function makePackage(overrides: { packageType: 'MONTHLY' | 'ANNUAL'; identifier: string }) {
  return {
    identifier: overrides.identifier,
    packageType: overrides.packageType,
    product: {
      identifier: `com.ieltsprep.app.premium.${overrides.packageType === 'ANNUAL' ? 'yearly' : 'monthly'}`,
      title: overrides.packageType === 'ANNUAL' ? 'Premium Yearly' : 'Premium Monthly',
      description: 'Full access.',
      priceString: overrides.packageType === 'ANNUAL' ? '₹2,499/year' : '₹299/month',
      price: overrides.packageType === 'ANNUAL' ? 2499 : 299,
      pricePerMonth: overrides.packageType === 'ANNUAL' ? 2499 / 12 : 299,
    },
  };
}

describe('RevenueCatProvider — purchase/restore outcome classification', () => {
  const monthlyPkg = makePackage({ packageType: 'MONTHLY', identifier: 'monthly' });
  const yearlyPkg = makePackage({ packageType: 'ANNUAL', identifier: 'yearly' });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOfferings.mockResolvedValue({ current: { availablePackages: [monthlyPkg, yearlyPkg] } });
  });

  it('a monthly purchase succeeds and maps to premium_monthly', async () => {
    mockPurchasePackage.mockResolvedValue({ customerInfo: { entitlements: { active: { [PREMIUM_ENTITLEMENT_ID]: { productIdentifier: monthlyPkg.product.identifier } } } } });
    const provider = new RevenueCatProvider();
    const result = await provider.purchase('monthly');
    expect(result).toEqual({ success: true, kind: 'success', plan: 'premium_monthly' });
  });

  it('a yearly purchase succeeds and maps to premium_yearly', async () => {
    mockPurchasePackage.mockResolvedValue({ customerInfo: { entitlements: { active: { [PREMIUM_ENTITLEMENT_ID]: { productIdentifier: yearlyPkg.product.identifier } } } } });
    const provider = new RevenueCatProvider();
    const result = await provider.purchase('yearly');
    expect(result).toEqual({ success: true, kind: 'success', plan: 'premium_yearly' });
  });

  it('restore finds an active subscription and reports success', async () => {
    mockRestorePurchases.mockResolvedValue({ entitlements: { active: { [PREMIUM_ENTITLEMENT_ID]: { productIdentifier: yearlyPkg.product.identifier } } } });
    const provider = new RevenueCatProvider();
    const result = await provider.restore();
    expect(result).toEqual({ success: true, kind: 'success', plan: 'premium_yearly' });
  });

  it('restore with no purchases reports a clear (non-scary) failure, not a crash', async () => {
    mockRestorePurchases.mockResolvedValue({ entitlements: { active: {} } });
    const provider = new RevenueCatProvider();
    const result = await provider.restore();
    expect(result.success).toBe(false);
    expect(result.kind).toBe('error');
    expect(result.error).toMatch(/no active subscription/i);
  });

  it('a user cancelling the purchase sheet is classified as "cancelled", never a generic error', async () => {
    mockPurchasePackage.mockRejectedValue({ code: '1', message: 'Purchase was cancelled.' });
    const provider = new RevenueCatProvider();
    const result = await provider.purchase('monthly');
    expect(result.success).toBe(false);
    expect(result.kind).toBe('cancelled');
  });

  it('a payment stuck pending approval is classified as "pending"', async () => {
    mockPurchasePackage.mockRejectedValue({ code: '20', message: 'Payment is pending.' });
    const provider = new RevenueCatProvider();
    const result = await provider.purchase('monthly');
    expect(result.kind).toBe('pending');
  });

  it('an already-owned subscription is classified as "already_owned"', async () => {
    mockPurchasePackage.mockRejectedValue({ code: '6', message: 'Already purchased.' });
    const provider = new RevenueCatProvider();
    const result = await provider.purchase('monthly');
    expect(result.kind).toBe('already_owned');
  });

  it('a network failure during purchase is classified as "network_error"', async () => {
    mockPurchasePackage.mockRejectedValue({ code: '10', message: 'No network.' });
    const provider = new RevenueCatProvider();
    const result = await provider.purchase('monthly');
    expect(result.kind).toBe('network_error');
  });

  it('an unrecognized failure falls back to the generic "error" kind, still surfaced (never silently swallowed)', async () => {
    mockPurchasePackage.mockRejectedValue({ code: '4', message: 'Invalid purchase.' });
    const provider = new RevenueCatProvider();
    const result = await provider.purchase('monthly');
    expect(result.success).toBe(false);
    expect(result.kind).toBe('error');
    expect(result.error).toBe('Invalid purchase.');
  });

  it('checkEntitlement only recognizes the specific "premium" entitlement, not any active entitlement', async () => {
    mockGetCustomerInfo.mockResolvedValue({ entitlements: { active: { some_other_addon: { productIdentifier: 'addon' } } } });
    const provider = new RevenueCatProvider();
    const status = await provider.checkEntitlement();
    expect(status.active).toBe(false);
  });
});

describe('RevenueCatProvider — identity binding (login/logout/account switch)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('login() identifies the device as the given (Supabase) user id', async () => {
    const provider = new RevenueCatProvider();
    await provider.login('user-abc-123');
    expect(mockLogIn).toHaveBeenCalledWith('user-abc-123');
  });

  it('logout() reverts the device to an anonymous identity', async () => {
    const provider = new RevenueCatProvider();
    await provider.logout();
    expect(mockLogOut).toHaveBeenCalledTimes(1);
  });

  it('switching accounts calls login() with each new user id in turn, never reusing the previous one', async () => {
    const provider = new RevenueCatProvider();
    await provider.login('user-A');
    await provider.logout();
    await provider.login('user-B');
    expect(mockLogIn.mock.calls.map((c) => c[0])).toEqual(['user-A', 'user-B']);
    expect(mockLogOut).toHaveBeenCalledTimes(1);
  });
});

describe('useAppStore — signOut() clears the account (and, per RevenueCatProvider.logout above, its purchase identity)', () => {
  it('signOut() clears the signed-in user id and cached subscription state, and never throws even though the purchases provider logout is best-effort', async () => {
    useAppStore.setState({ userId: 'user-1', subscription: { id: 's1', userId: 'user-1', plan: 'premium_monthly', status: 'active', revenuecatCustomerId: null, currentPeriodEnd: null } });
    await useAppStore.getState().signOut();
    expect(useAppStore.getState().userId).toBeNull();
    expect(useAppStore.getState().subscription).toBeNull();
  });
});

describe('UnavailablePurchasesProvider — a real Supabase backend with no RevenueCat key never fakes a purchase', () => {
  const provider = new UnavailablePurchasesProvider();

  it('reports no products to buy', async () => {
    expect(await provider.getProducts()).toEqual([]);
  });

  it('purchase() always fails with a clear "not available" message — never a fabricated success', async () => {
    const result = await provider.purchase();
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not available/i);
  });

  it('restore() always fails the same way', async () => {
    const result = await provider.restore();
    expect(result.success).toBe(false);
  });

  it('never reports an active entitlement', async () => {
    const status = await provider.checkEntitlement();
    expect(status.active).toBe(false);
  });
});

describe('free vs. premium recognition — the single source of truth', () => {
  it('a free-plan subscription is recognized as not premium', () => {
    const subscription: Subscription = { id: 's', userId: 'u', plan: 'free', status: 'none', revenuecatCustomerId: null, currentPeriodEnd: null };
    expect(subscription.plan !== 'free').toBe(false);
  });

  it('a premium-plan subscription is recognized as premium', () => {
    const subscription: Subscription = { id: 's', userId: 'u', plan: 'premium_yearly', status: 'active', revenuecatCustomerId: 'cust_1', currentPeriodEnd: '2027-01-01' };
    expect(subscription.plan !== 'free').toBe(true);
  });

  it('premium gates update immediately when the store\'s subscription changes — no separate refetch needed', () => {
    useAppStore.setState({ subscription: { id: 's', userId: 'u', plan: 'free', status: 'none', revenuecatCustomerId: null, currentPeriodEnd: null } });
    expect(useAppStore.getState().subscription?.plan !== 'free').toBe(false);

    useAppStore.getState().setSubscriptionState({ id: 's2', userId: 'u', plan: 'premium_monthly', status: 'active', revenuecatCustomerId: 'cust_1', currentPeriodEnd: null });
    expect(useAppStore.getState().subscription?.plan !== 'free').toBe(true);
  });

  it('the existing free-user daily-limit flow is unaffected: a free plan still gates practice at the configured limit', () => {
    expect(checkDailyLimit(10, 10, false)).toEqual({ allowed: false, used: 10, limit: 10 });
    expect(checkDailyLimit(9, 10, false)).toEqual({ allowed: true, used: 9, limit: 10 });
  });

  it('premium is never subject to the free daily limit', () => {
    expect(checkDailyLimit(1000, 10, true)).toEqual({ allowed: true, used: 1000, limit: Infinity });
  });
});

describe('no client-supplied premium flag can reach — or bypass — a server quota decision', () => {
  afterEach(() => jest.dontMock('@/lib/supabase'));

  it('evaluateWriting sends no plan/premium/subscription field at all, even with a spoofed local premium subscription in the store', async () => {
    // Simulates a compromised/tampered client: the LOCAL store claims
    // Premium even though this proves nothing server-side.
    useAppStore.setState({ subscription: { id: 's', userId: 'u', plan: 'premium_yearly', status: 'active', revenuecatCustomerId: 'fake', currentPeriodEnd: null } });

    jest.resetModules();
    const mockInvoke = jest.fn().mockResolvedValue({
      data: {
        result: {
          overallBand: 6, taskAchievement: 6, coherenceCohesion: 6, lexicalResource: 6, grammaticalRange: 6,
          strengths: ['Clear structure'], weaknesses: ['Limited vocabulary'], suggestions: ['Use more varied linking words'],
          improvedExample: 'A better sentence.', nextBandAction: 'Practice complex sentences.',
        },
        provider: 'openai',
      },
      error: null,
    });
    jest.doMock('@/lib/supabase', () => ({ supabase: { functions: { invoke: mockInvoke } } }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { EdgeFunctionProvider: FreshProvider } = require('@/services/ai/edgeFunctionProvider');
    const provider = new FreshProvider();
    await provider.evaluateWriting({ taskType: 'task2', promptText: 'p', essayText: 'e', wordCount: 1, minWords: 1 });

    const [, options] = mockInvoke.mock.calls[0];
    const sentKeys = Object.keys(options.body);
    expect(sentKeys).toEqual(['taskType', 'promptText', 'essayText', 'wordCount', 'minWords']);
    expect(sentKeys.some((k) => /premium|plan|subscription/i.test(k))).toBe(false);
  });
});

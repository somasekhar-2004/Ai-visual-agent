// Regression suite for the release-blocking incident: Demo Mode and its
// fabricated seed data ("Alex", seeded bands, a 3-day streak) must never
// exist anywhere in runtime code again, and account state must never leak
// between two different signed-in users on the same device.

import { render } from '@testing-library/react-native';
import React from 'react';

import SignInScreen from '@/app/(auth)/sign-in';
import AccountScreen from '@/app/(onboarding)/account';
import { ThemeProvider } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush, back: jest.fn() }),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/services/auth', () => ({
  getCurrentUserId: jest.fn().mockResolvedValue(null),
  hasCompletedOnboarding: jest.fn().mockResolvedValue(false),
  setOnboardingComplete: jest.fn(),
  signOut: jest.fn(),
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
}));

jest.mock('@/services/repository', () => ({
  getProfile: jest.fn(),
  getActiveGoal: jest.fn(),
  getLatestBandScores: jest.fn(),
  getSubscription: jest.fn(),
  getStreak: jest.fn(),
  getXp: jest.fn(),
  saveOnboardingGoal: jest.fn(),
  setNotificationPref: jest.fn(),
  syncSubscriptionEntitlement: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/services/notifications', () => ({
  applyNotificationPreferences: jest.fn(),
}));

describe('Demo Mode does not exist in runtime code', () => {
  it('lib/demoStore.ts no longer exists', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    expect(() => require('@/lib/demoStore')).toThrow();
  });

  it('services/auth.ts does not export signInDemo', () => {
    // @/services/auth is mocked for the render tests later in this file —
    // requireActual bypasses that to check the real module's exports.
    const auth = jest.requireActual('@/services/auth');
    expect(auth.signInDemo).toBeUndefined();
  });

  it('lib/env.ts does not export isDemoMode', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const env = require('@/lib/env');
    expect(env.isDemoMode).toBeUndefined();
    expect(typeof env.isBackendMisconfigured).toBe('boolean');
  });

  it('store/useAppStore.ts does not expose an enterDemoMode action', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAppStore } = require('@/store/useAppStore');
    expect((useAppStore.getState() as Record<string, unknown>).enterDemoMode).toBeUndefined();
  });

  it('services/purchases/index.ts does not export isPurchasesMocked', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const purchases = require('@/services/purchases');
    expect(purchases.isPurchasesMocked).toBeUndefined();
  });
});

describe('Signup/sign-in screens never mention Demo Mode', () => {
  beforeEach(() => jest.clearAllMocks());

  it('the sign-in screen never renders the text "Demo Mode"', async () => {
    const { queryByText } = await render(React.createElement(ThemeProvider, null, React.createElement(SignInScreen)));
    expect(queryByText(/Demo Mode/i)).toBeNull();
  });

  it('the onboarding account screen never renders the text "Demo Mode"', async () => {
    useAppStore.setState({ userId: null });
    const { queryByText } = await render(React.createElement(ThemeProvider, null, React.createElement(AccountScreen)));
    expect(queryByText(/Demo Mode/i)).toBeNull();
    expect(queryByText(/No Supabase project configured/i)).toBeNull();
  });
});

describe('Account isolation: sign-out clears every user-specific field', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.doMock('@/services/auth', () => ({
      getCurrentUserId: jest.fn().mockResolvedValue(null),
      hasCompletedOnboarding: jest.fn().mockResolvedValue(false),
      setOnboardingComplete: jest.fn(),
      signOut: jest.fn().mockResolvedValue(undefined),
    }));
    jest.doMock('@/services/purchases', () => ({
      getPurchasesProvider: () => ({ logout: jest.fn().mockResolvedValue(undefined), login: jest.fn().mockResolvedValue(undefined) }),
    }));
  });

  it('signOut() resets profile/goal/bandScores/subscription/streak/xp to their empty defaults', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAppStore } = require('@/store/useAppStore');
    useAppStore.setState({
      userId: 'account-1',
      profile: { id: 'account-1', fullName: 'Priya', avatarUrl: null, createdAt: '2026-01-01' },
      goal: { id: 'g1', userId: 'account-1' } as any,
      bandScores: { overall: 7 },
      subscription: { id: 's1', userId: 'account-1' } as any,
      streak: { count: 5, lastActiveDate: '2026-01-01' },
      xp: 500,
    });

    await useAppStore.getState().signOut();

    const state = useAppStore.getState();
    expect(state.userId).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.goal).toBeNull();
    expect(state.bandScores).toEqual({});
    expect(state.subscription).toBeNull();
    expect(state.streak).toEqual({ count: 0, lastActiveDate: null });
    expect(state.xp).toBe(0);
  });
});

describe('Account isolation: hydrate() always fetches by the currently authenticated user id', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('a second hydrate() for a different account fetches and stores that account\'s own id, not the previous one\'s', async () => {
    const mockGetCurrentUserId = jest.fn();
    jest.doMock('@/services/auth', () => ({
      getCurrentUserId: mockGetCurrentUserId,
      hasCompletedOnboarding: jest.fn().mockResolvedValue(true),
      setOnboardingComplete: jest.fn(),
      signOut: jest.fn(),
    }));
    jest.doMock('@/services/purchases', () => ({
      getPurchasesProvider: () => ({ login: jest.fn().mockResolvedValue(undefined), logout: jest.fn().mockResolvedValue(undefined) }),
    }));
    jest.doMock('@/services/repository', () => ({
      getProfile: jest.fn((userId: string) => Promise.resolve({ id: userId, fullName: `name-${userId}`, avatarUrl: null, createdAt: '2026-01-01' })),
      getActiveGoal: jest.fn().mockResolvedValue(null),
      getLatestBandScores: jest.fn().mockResolvedValue({}),
      getSubscription: jest.fn().mockResolvedValue(null),
      getStreak: jest.fn().mockResolvedValue({ count: 0, lastActiveDate: null }),
      getXp: jest.fn().mockResolvedValue(0),
      syncSubscriptionEntitlement: jest.fn().mockResolvedValue(undefined),
    }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAppStore } = require('@/store/useAppStore');

    mockGetCurrentUserId.mockResolvedValue('account-1');
    await useAppStore.getState().hydrate();
    expect(useAppStore.getState().userId).toBe('account-1');
    expect(useAppStore.getState().profile?.fullName).toBe('name-account-1');

    mockGetCurrentUserId.mockResolvedValue('account-2');
    await useAppStore.getState().hydrate();
    expect(useAppStore.getState().userId).toBe('account-2');
    expect(useAppStore.getState().profile?.fullName).toBe('name-account-2');
  });
});

describe('Production env detection uses the actual Expo EXPO_PUBLIC_ variables', () => {
  const ORIGINAL_ENV = process.env;

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.resetModules();
  });

  it('reads EXPO_PUBLIC_SUPABASE_URL/EXPO_PUBLIC_SUPABASE_ANON_KEY exactly as EAS injects them at build time', () => {
    jest.resetModules();
    process.env = {
      ...ORIGINAL_ENV,
      EXPO_PUBLIC_SUPABASE_URL: 'https://kudgtxdwbpfqobteyeqy.supabase.co',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: 'a-real-looking-anon-key',
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const env = require('@/lib/env') as typeof import('@/lib/env');
    expect(env.isSupabaseConfigured).toBe(true);
    expect(env.isBackendMisconfigured).toBe(false);
  });
});

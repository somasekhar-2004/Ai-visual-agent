// Recent activity: starting/resuming a session must update Home's Recent
// activity immediately — Home is a persistent tab that stays mounted while
// the user is in a session — without ever being recorded as an attempt.
// Opens live only in on-device storage (services/sessionOpens.ts), never in
// test_history, so Test history, scores, streaks, the weekly chart and the
// AI Coach quota cannot be affected.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import { useRecordSessionOpen } from '@/hooks/useRecordSessionOpen';
import { recentActivityForHome, type RecentActivityKey } from '@/lib/recentActivity';
import * as repository from '@/services/repository';
import {
  getSessionOpens,
  markSessionOpened,
  sessionOpensQueryKey,
  sessionOpensStorageKey,
} from '@/services/sessionOpens';
import { useAppStore } from '@/store/useAppStore';

// Every repository write is a mock, so the test can prove none is called.
jest.mock('@/services/repository', () => ({
  addTestHistory: jest.fn(),
  recordQuestionAttempt: jest.fn(),
  recordStudyActivity: jest.fn(),
  getTestHistory: jest.fn().mockResolvedValue([]),
}));

let mockFocusCallbacks: (() => void)[] = [];
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void) => {
    mockFocusCallbacks.push(cb);
  },
}));

/** Fires the session screen's latest registered focus callback, exactly as
 * navigating to (or back to) that screen would, and lets the async storage
 * write + cache update settle. RNTL v14's act() is async — always awaited. */
async function fireFocus() {
  const cb = mockFocusCallbacks[mockFocusCallbacks.length - 1];
  await act(async () => {
    cb();
    await new Promise((r) => setTimeout(r, 0));
  });
}

function SessionScreen({ activity }: { activity: RecentActivityKey }) {
  useRecordSessionOpen(activity);
  return null;
}

/** Stand-in for Home's Recent activity card: observes the same query and
 * stays mounted throughout, exactly like the Home tab. */
function HomeRecentActivity() {
  const userId = useAppStore((s) => s.userId);
  const opens = useQuery({
    queryKey: sessionOpensQueryKey(userId),
    queryFn: () => getSessionOpens(userId!),
    enabled: Boolean(userId),
  });
  const rows = recentActivityForHome([], { opens: opens.data ?? {} });
  return <Text testID="recent">{rows.length ? rows.map((r) => `${r.activityType}:${r.kind}`).join(',') : 'none'}</Text>;
}

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  mockFocusCallbacks = [];
  jest.clearAllMocks();
  useAppStore.setState({ userId: 'user-1' });
});

describe('services/sessionOpens', () => {
  it('round-trips one timestamp per kind, latest wins', async () => {
    await markSessionOpened('user-1', 'reading', new Date('2026-11-15T10:00:00Z'));
    await markSessionOpened('user-1', 'reading', new Date('2026-11-15T11:00:00Z'));
    await markSessionOpened('user-1', 'grammar', new Date('2026-11-15T09:00:00Z'));
    expect(await getSessionOpens('user-1')).toEqual({
      reading: '2026-11-15T11:00:00.000Z',
      grammar: '2026-11-15T09:00:00.000Z',
    });
  });

  it('keeps each user separate on a shared device', async () => {
    await markSessionOpened('user-1', 'reading');
    expect(await getSessionOpens('user-2')).toEqual({});
  });

  it('treats corrupt or invalid stored data as no activity instead of crashing Home', async () => {
    await AsyncStorage.setItem(sessionOpensStorageKey('user-1'), '{not json');
    expect(await getSessionOpens('user-1')).toEqual({});
    await AsyncStorage.setItem(sessionOpensStorageKey('user-1'), JSON.stringify({ reading: 'garbage', listening: 42 }));
    expect(await getSessionOpens('user-1')).toEqual({});
  });
});

describe('useRecordSessionOpen', () => {
  it('updates an already-mounted Home immediately when a session is started, and again on resume', async () => {
    const { getByTestId } = await renderWithClient(
      <>
        <HomeRecentActivity />
        <SessionScreen activity="reading" />
      </>
    );
    await waitFor(() => expect(getByTestId('recent').props.children).toBe('none'));

    await fireFocus(); // start
    await waitFor(() => expect(getByTestId('recent').props.children).toBe('reading:opened'));
    const firstOpen = (await getSessionOpens('user-1')).reading!;

    await new Promise((r) => setTimeout(r, 5));
    await fireFocus(); // resume (coming back to the session screen)
    expect((await getSessionOpens('user-1')).reading).not.toBe(firstOpen);
    // Still exactly one row for repeated visits.
    expect(getByTestId('recent').props.children).toBe('reading:opened');
  });

  it('never records a completed attempt, question answer, study activity or test history row', async () => {
    await renderWithClient(<SessionScreen activity="mock_test" />);
    await fireFocus();
    expect((await getSessionOpens('user-1')).mock_test).toBeDefined();
    expect(repository.addTestHistory).not.toHaveBeenCalled();
    expect((repository as any).recordQuestionAttempt).not.toHaveBeenCalled();
    expect((repository as any).recordStudyActivity).not.toHaveBeenCalled();
    const keys = await AsyncStorage.getAllKeys();
    expect(keys).toEqual([sessionOpensStorageKey('user-1')]);
  });

  it('does nothing when signed out', async () => {
    useAppStore.setState({ userId: null });
    await renderWithClient(<SessionScreen activity="reading" />);
    await fireFocus();
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });
});

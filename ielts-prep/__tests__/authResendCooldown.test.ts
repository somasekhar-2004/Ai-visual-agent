// Regression coverage for the FINAL AUTH RELEASE AUDIT's cooldown
// requirements: an absolute-expiry-timestamp-based cooldown (never a blind
// decrement), independent per resend "lane" (signup confirmation vs
// password reset), and surviving a component remount or app background/
// foreground — see hooks/useResendCooldown.ts and lib/authCooldown.ts.
//
// Uses modern fake timers throughout (never real 1s+ waits): the hook's
// countdown is driven by a real `setInterval`, and a real, unadvanced
// interval left running past the end of a test can interleave with the
// next test's render and corrupt React's act() flush timing. Fake timers
// also fake Date, so `jest.setSystemTime()` can move the wall clock forward
// WITHOUT firing the interval — exactly what's needed to simulate "real
// time passed while backgrounded, before the app (and its timers) resumed."
//
// Every rendered hook is explicitly, awaited-ly unmounted at the end of its
// own test (never left to auto-cleanup alone): this hook holds a live
// AppState subscription and setInterval, and an un-awaited `unmount()`
// (itself async — see @testing-library/react-native's render.js) leaves a
// dangling act() scope that corrupts a LATER test's render, and/or an
// unmounted-but-not-actually-torn-down subscription that inflates another
// test's AppState.addEventListener spy count. Found the hard way — see the
// two bugs this file's own history fixed if this regresses.

import { act, cleanup, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { useResendCooldown } from '@/hooks/useResendCooldown';
import { AUTH_RESEND_COOLDOWN_SECONDS, getCooldownExpiry } from '@/lib/authCooldown';

describe('useResendCooldown', () => {
  beforeEach(() => {
    jest.useFakeTimers({ legacyFakeTimers: false });
  });

  // Explicitly clean up (which flushes effect-cleanup functions, including
  // this hook's own clearInterval/AppState-unsubscribe calls) WHILE fake
  // timers are still installed, before switching back to real timers.
  afterEach(async () => {
    await cleanup();
    jest.useRealTimers();
  });

  it('starts idle (no cooldown) for an email with no prior request', async () => {
    const rendered = await renderHook(() => useResendCooldown('password-reset', 'fresh@example.com'));
    expect(rendered.result.current.isActive).toBe(false);
    expect(rendered.result.current.secondsRemaining).toBe(0);
    await rendered.unmount();
  });

  it('start() only begins counting after being explicitly called — a failed request must never start it', async () => {
    const rendered = await renderHook(() => useResendCooldown('password-reset', 'never-started@example.com'));
    // Simulating a failed send: nothing calls start(), so it stays idle.
    expect(rendered.result.current.isActive).toBe(false);
    expect(rendered.result.current.secondsRemaining).toBe(0);
    await rendered.unmount();
  });

  it('start() persists an absolute expiry timestamp (Date.now() + seconds), not just an in-memory counter', async () => {
    const before = Date.now();
    const rendered = await renderHook(() => useResendCooldown('password-reset', 'persisted@example.com'));
    await act(async () => {
      await rendered.result.current.start(AUTH_RESEND_COOLDOWN_SECONDS);
    });
    const expiry = await getCooldownExpiry('password-reset', 'persisted@example.com');
    expect(expiry).not.toBeNull();
    expect(expiry as number).toBeGreaterThanOrEqual(before + AUTH_RESEND_COOLDOWN_SECONDS * 1000);
    await rendered.unmount();
  });

  it('becomes active with exactly the configured duration right after start()', async () => {
    const rendered = await renderHook(() => useResendCooldown('password-reset', 'active@example.com'));
    await act(async () => {
      await rendered.result.current.start(AUTH_RESEND_COOLDOWN_SECONDS);
    });
    expect(rendered.result.current.isActive).toBe(true);
    expect(rendered.result.current.secondsRemaining).toBe(AUTH_RESEND_COOLDOWN_SECONDS);
    await rendered.unmount();
  });

  it('decrements as time advances and re-enables (becomes inactive) once it reaches 0', async () => {
    const rendered = await renderHook(() => useResendCooldown('password-reset', 'decrements@example.com'));
    await act(async () => {
      await rendered.result.current.start(3);
    });
    expect(rendered.result.current.secondsRemaining).toBe(3);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(rendered.result.current.secondsRemaining).toBe(2);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(rendered.result.current.isActive).toBe(false);
    expect(rendered.result.current.secondsRemaining).toBe(0);
    await rendered.unmount();
  });

  it('survives a remount — a cooldown already in flight resumes instead of resetting to idle or back to the full duration', async () => {
    const email = 'remount@example.com';
    const first = await renderHook(() => useResendCooldown('password-reset', email));
    await act(async () => {
      await first.result.current.start(AUTH_RESEND_COOLDOWN_SECONDS);
    });
    // Real time (5s) passes before the screen is left and returned to.
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    await first.unmount();

    const second = await renderHook(() => useResendCooldown('password-reset', email));
    // The hook's mount effect resumes a persisted cooldown via an async
    // AsyncStorage read — one tick of a real act() lets that microtask
    // chain (which involves no fake timers) settle.
    await act(async () => {});
    expect(second.result.current.isActive).toBe(true);
    // Resumed at (approximately) the remaining time, not reset to the full
    // AUTH_RESEND_COOLDOWN_SECONDS just because the hook remounted.
    expect(second.result.current.secondsRemaining).toBeLessThan(AUTH_RESEND_COOLDOWN_SECONDS);
    expect(second.result.current.secondsRemaining).toBeGreaterThan(0);
    await second.unmount();
  });

  it('resyncs against the absolute expiry when the app returns to the foreground', async () => {
    const email = 'foreground@example.com';
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener');
    const rendered = await renderHook(() => useResendCooldown('password-reset', email));
    await act(async () => {
      await rendered.result.current.start(AUTH_RESEND_COOLDOWN_SECONDS);
    });
    expect(rendered.result.current.isActive).toBe(true);

    // Move the wall clock forward past the expiry WITHOUT letting the
    // interval fire (jest.setSystemTime, unlike advanceTimersByTime, moves
    // the fake clock without running the timer queue) — this is exactly
    // what "backgrounded, so the interval never ticked, but real time still
    // passed" looks like. Only firing the app's own foreground callback
    // should be what notices. The LAST registered 'change' handler is this
    // test's own — earlier ones (if any survive a prior test's teardown
    // timing) belong to already-unmounted instances.
    const changeCalls = addEventListenerSpy.mock.calls.filter(([event]) => event === 'change');
    const onChange = changeCalls[changeCalls.length - 1]?.[1] as (state: string) => void;
    expect(onChange).toBeDefined();
    await act(async () => {
      jest.setSystemTime(Date.now() + (AUTH_RESEND_COOLDOWN_SECONDS + 5) * 1000);
    });
    await act(async () => onChange('active'));

    expect(rendered.result.current.isActive).toBe(false);
    addEventListenerSpy.mockRestore();
    await rendered.unmount();
  });

  it('two independent lanes for the same email never affect each other', async () => {
    const email = 'shared@example.com';
    const signup = await renderHook(() => useResendCooldown('signup-confirmation', email));
    const reset = await renderHook(() => useResendCooldown('password-reset', email));

    await act(async () => {
      await signup.result.current.start(AUTH_RESEND_COOLDOWN_SECONDS);
    });

    expect(signup.result.current.isActive).toBe(true);
    // The password-reset lane for the exact same email must stay idle.
    expect(reset.result.current.isActive).toBe(false);
    await signup.unmount();
    await reset.unmount();
  });

  it('only ever runs one interval at a time — calling start() again while already active does not stack timers', async () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const rendered = await renderHook(() => useResendCooldown('password-reset', 'no-stacking@example.com'));
    await act(async () => {
      await rendered.result.current.start(AUTH_RESEND_COOLDOWN_SECONDS);
    });
    const intervalsAfterFirstStart = setIntervalSpy.mock.calls.length;
    await act(async () => {
      await rendered.result.current.start(AUTH_RESEND_COOLDOWN_SECONDS);
    });
    // A second start() must clear the previous interval before starting a
    // new one — never accumulate concurrently running intervals.
    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(setIntervalSpy.mock.calls.length).toBe(intervalsAfterFirstStart + 1);
    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
    await rendered.unmount();
  });
});

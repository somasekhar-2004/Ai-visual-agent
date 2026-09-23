import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { type AuthCooldownKey, clearCooldown, getCooldownExpiry, startCooldown } from '@/lib/authCooldown';

/**
 * Drives a resend-email cooldown button (signup confirmation, password
 * reset) off an absolute expiry timestamp persisted in AsyncStorage, keyed
 * by `cooldownKey` + `email` — never a blindly-decrementing in-memory
 * counter. That's what makes the cooldown:
 *  - survive the component remounting (leaving and returning to the screen)
 *  - survive the app backgrounding and foregrounding (recomputed from
 *    `Date.now()` on resume, not resumed from a stale in-memory number)
 *  - never reset to the full duration just because the component remounted
 *  - stay independent per `cooldownKey` — a signup-confirmation cooldown and
 *    a password-reset cooldown never share or clobber each other's state
 *
 * Only ever one `setInterval` is live at a time (cleared before every new
 * one starts, and on unmount) regardless of how many times `start()` is
 * called or the screen remounts.
 */
export function useResendCooldown(cooldownKey: AuthCooldownKey, email: string) {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiresAtRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const recompute = useCallback(
    (expiresAt: number | null) => {
      if (!expiresAt) {
        setSecondsRemaining(0);
        return;
      }
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        expiresAtRef.current = null;
        clearTimer();
        // Best-effort cleanup — a stale expiry left behind is harmless
        // (it's simply in the past next time it's read), so a failure here
        // is never surfaced to the caller.
        void clearCooldown(cooldownKey, email);
      }
    },
    [clearTimer, cooldownKey, email]
  );

  const runFrom = useCallback(
    (expiresAt: number) => {
      expiresAtRef.current = expiresAt;
      clearTimer();
      recompute(expiresAt);
      intervalRef.current = setInterval(() => recompute(expiresAtRef.current), 1000);
    },
    [clearTimer, recompute]
  );

  // On mount (and whenever the lane/email changes), resume any cooldown
  // already in flight for this exact lane + email rather than starting
  // fresh at zero.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const persisted = await getCooldownExpiry(cooldownKey, email);
      if (cancelled) return;
      if (persisted && persisted > Date.now()) {
        runFrom(persisted);
      } else {
        setSecondsRemaining(0);
      }
    })();
    return () => {
      cancelled = true;
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cooldownKey, email]);

  // The interval above is paused while the app is backgrounded (JS timers
  // don't reliably fire off-screen) — resync immediately against the
  // absolute expiry the moment the app comes back to the foreground, so the
  // displayed countdown never shows stale time.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && expiresAtRef.current) recompute(expiresAtRef.current);
    });
    return () => subscription?.remove();
  }, [recompute]);

  const start = useCallback(
    async (seconds: number) => {
      const expiresAt = await startCooldown(cooldownKey, email, seconds);
      runFrom(expiresAt);
    },
    [cooldownKey, email, runFrom]
  );

  return { secondsRemaining, isActive: secondsRemaining > 0, start };
}

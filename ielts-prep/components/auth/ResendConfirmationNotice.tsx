import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { useResendCooldown } from '@/hooks/useResendCooldown';
import { useTheme } from '@/hooks/useTheme';
import { AUTH_RESEND_COOLDOWN_SECONDS } from '@/lib/authCooldown';
import { resendConfirmationEmail } from '@/services/auth';

type Status = 'idle' | 'sending' | 'sent' | 'error';

// resendConfirmationEmail() is designed to never throw or hang (see its own
// comment in services/auth.ts) — but that guarantee is only as good as the
// underlying supabase-js call actually settling. A stalled connection, or a
// wedged state in the shared Supabase auth client (it serializes auth calls
// through an internal lock — see lib/supabase.ts), can leave that network
// request neither resolving nor rejecting. Without a bound on how long this
// screen will wait, that leaves `status` stuck at 'sending' — the button
// disabled, showing "Sending…" — until the user kills and reopens the app,
// which is one of the exact symptoms reported for this flow. Racing against
// a fixed timeout turns an indefinite hang into an honest, recoverable error
// state the user can retry from immediately, without claiming a delivery
// outcome the app never actually learned.
//
// IMPORTANT LIMITATION: this timeout does not, and cannot, cancel the
// underlying request. supabase-js's `auth.resend()` takes no AbortSignal or
// fetch-options override in the installed version (checked against
// node_modules/@supabase/auth-js's ResendParams type) — there is no public
// way to actually abort it. So after a timeout, the original network call
// keeps running in the background; if it was merely slow rather than truly
// hung, Supabase may still receive and act on it for real. Retrying after a
// timeout therefore CAN result in two real `/resend` requests reaching
// Supabase for the same email — this is an accepted trade-off (risking an
// extra email, which Supabase's own per-address rate limit also guards
// against) rather than leaving the user stuck until they restart the app.
// What this code DOES guarantee, via requestIdRef below, is that the
// component's own displayed state can never be corrupted by that abandoned
// request's late response — only the most recent handleResend() invocation
// is ever allowed to call setStatus/setMessage/cooldown.start.
const RESEND_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/** Shown after signUpWithEmail/signInWithEmail return `pendingConfirmation`
 * — the account exists but has no confirmed session yet. Offers the
 * purpose-built resend path instead of leaving the user to guess whether a
 * second signup attempt will do anything, plus a direct way to sign in once
 * they're actually confirmed.
 *
 * - `alreadyRegistered`: this is a returning user with an existing-but-
 *   unconfirmed account (from an attempted sign-up or sign-in that turned
 *   out to be a duplicate), not a brand-new signup — only affects copy
 *   ("Email not confirmed yet" vs "Check your email to confirm your
 *   account").
 * - `justResent`: a confirmation email was already sent as a side effect of
 *   getting here (services/auth.ts's disambiguateExistingAccount resends
 *   automatically to tell an unconfirmed duplicate apart from a confirmed
 *   one) — shows the "sent" state and starts the cooldown immediately,
 *   rather than a resend genuinely fired from a sign-in rejection, which
 *   sent nothing on its own.
 */
export function ResendConfirmationNotice({
  email,
  alreadyRegistered,
  justResent,
}: {
  email: string;
  alreadyRegistered?: boolean;
  justResent?: boolean;
}) {
  const theme = useTheme();
  const router = useRouter();
  const [status, setStatus] = useState<Status>(justResent ? 'sent' : 'idle');
  const [message, setMessage] = useState<string | null>(
    justResent ? 'We just sent a fresh confirmation link — check your inbox and spam folder.' : null
  );
  const cooldown = useResendCooldown('signup-confirmation', email);
  // React state updates (and therefore the Button's own loading-derived
  // `disabled`) aren't reflected in the already-rendered tree until the next
  // render — a genuinely rapid double-tap can fire twice before that render
  // happens. This ref is checked synchronously, before any `await` or state
  // update, so it closes that gap regardless of render timing.
  const sendingRef = useRef(false);
  // Incremented at the start of every handleResend() call; each call
  // captures its own snapshot and checks it again after the await — see
  // RESEND_TIMEOUT_MS's comment above for why an abandoned (timed-out)
  // request's eventual real response must never be allowed to overwrite
  // whatever a later, newer request already set.
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (justResent) void cooldown.start(AUTH_RESEND_COOLDOWN_SECONDS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleResend() {
    // Checked and set synchronously, before the `sending` status (and the
    // Button's derived `disabled`) has had a chance to actually re-render —
    // see sendingRef's own comment above for why the render-based guard
    // alone isn't enough to prevent an accidental double-tap.
    if (sendingRef.current) return;
    sendingRef.current = true;
    const myRequestId = ++requestIdRef.current;
    setStatus('sending');
    setMessage(null);
    // Every other Supabase call in services/auth.ts returns { error } rather
    // than throwing, but auth.resend()'s underlying fetch can still reject
    // outright on a genuine network failure (no connectivity, DNS failure —
    // a well-known React Native fetch failure mode). Without this catch, that
    // rejection left `status` stuck at 'sending' forever: the button (whose
    // `loading` prop already disables it) never re-enabled and showed no
    // error, so a resend after a flaky connection looked like it silently
    // "didn't work" with no way to retry short of leaving and re-entering
    // this screen.
    try {
      const result = await withTimeout(
        resendConfirmationEmail(email),
        RESEND_TIMEOUT_MS,
        'This is taking longer than expected. Check your connection and try again.'
      );
      // A newer handleResend() call has started (and bumped requestIdRef)
      // since this one began — this invocation's outcome is stale and must
      // not touch status/message/cooldown, which the newer call already
      // owns. In the current withTimeout implementation this branch is not
      // actually reachable (the race's promise can only settle once, so
      // there's no code left to run after a timeout already won), but it's
      // kept as an explicit, cheap invariant rather than relying on that.
      if (requestIdRef.current !== myRequestId) return;
      if (result.ok) {
        setStatus('sent');
        setMessage('Confirmation email sent again — check your inbox and spam folder.');
        await cooldown.start(AUTH_RESEND_COOLDOWN_SECONDS);
      } else {
        setStatus('error');
        setMessage(result.error ?? 'Could not resend the confirmation email.');
        if (result.retryAfterSeconds) await cooldown.start(result.retryAfterSeconds);
      }
    } catch (err) {
      if (requestIdRef.current !== myRequestId) return;
      // Reached either by the timeout above, or (belt-and-suspenders,
      // since resendConfirmationEmail already catches its own network
      // errors) a genuine unexpected rejection — either way `status` must
      // still clear to 'error' so the button re-enables for an immediate
      // retry rather than staying stuck on "Sending…".
      setStatus('error');
      setMessage((err as Error).message || 'Could not resend the confirmation email. Check your connection and try again.');
    } finally {
      if (requestIdRef.current === myRequestId) sendingRef.current = false;
    }
  }

  const onCooldown = cooldown.isActive;
  const buttonLabel = status === 'sending' ? 'Sending…' : onCooldown ? `Resend available in ${cooldown.secondsRemaining}s` : 'Resend confirmation email';

  return (
    <Card style={{ gap: theme.spacing.sm }}>
      <Text variant="bodyMedium">{alreadyRegistered ? 'Email not confirmed yet' : 'Check your email to confirm your account'}</Text>
      <Text variant="body" color="secondary">
        We sent a confirmation link to {email}. Once you confirm it, come back and sign in.
      </Text>
      <View style={{ marginTop: theme.spacing.xs, gap: theme.spacing.sm }}>
        <Button label={buttonLabel} variant="outline" onPress={handleResend} loading={status === 'sending'} disabled={onCooldown} fullWidth />
        <Button label="Sign in" variant="ghost" onPress={() => router.replace('/(auth)/sign-in')} fullWidth />
      </View>
      {message ? <Text color={status === 'error' ? 'error' : 'secondary'}>{message}</Text> : null}
    </Card>
  );
}

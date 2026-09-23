import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { useResendCooldown } from '@/hooks/useResendCooldown';
import { useTheme } from '@/hooks/useTheme';
import { AUTH_RESEND_COOLDOWN_SECONDS } from '@/lib/authCooldown';
import { resendConfirmationEmail } from '@/services/auth';

type Status = 'idle' | 'sending' | 'sent' | 'error';

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
      const result = await resendConfirmationEmail(email);
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
      setStatus('error');
      setMessage((err as Error).message || 'Could not resend the confirmation email. Check your connection and try again.');
    } finally {
      sendingRef.current = false;
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

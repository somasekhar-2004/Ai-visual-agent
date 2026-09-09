import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { resendConfirmationEmail } from '@/services/auth';

type Status = 'idle' | 'sending' | 'sent' | 'error';

// Supabase's default per-address cooldown for resending a signup
// confirmation email. Applied optimistically right after a successful
// resend (which itself carries no cooldown info back) so the button doesn't
// invite an immediate rate-limit error; a real 429 response overrides this
// with the exact remaining time Supabase reports.
const DEFAULT_RESEND_COOLDOWN_SECONDS = 60;

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
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (justResent) startCooldown(DEFAULT_RESEND_COOLDOWN_SECONDS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startCooldown(seconds: number) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsRemaining(seconds);
    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleResend() {
    setStatus('sending');
    setMessage(null);
    const result = await resendConfirmationEmail(email);
    if (result.ok) {
      setStatus('sent');
      setMessage('Confirmation email sent again — check your inbox and spam folder.');
      startCooldown(DEFAULT_RESEND_COOLDOWN_SECONDS);
    } else {
      setStatus('error');
      setMessage(result.error ?? 'Could not resend the confirmation email.');
      if (result.retryAfterSeconds) startCooldown(result.retryAfterSeconds);
    }
  }

  const onCooldown = secondsRemaining > 0;
  const buttonLabel = status === 'sending' ? 'Sending…' : onCooldown ? `Resend available in ${secondsRemaining}s` : 'Resend confirmation email';

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

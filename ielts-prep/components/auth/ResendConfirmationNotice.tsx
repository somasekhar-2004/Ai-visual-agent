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
 * second signup attempt will do anything. */
export function ResendConfirmationNotice({ email }: { email: string }) {
  const theme = useTheme();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
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
      <Text variant="bodyMedium">Check your email to confirm your account</Text>
      <Text variant="body" color="secondary">
        We sent a confirmation link to {email}. Once you confirm it, come back and sign in.
      </Text>
      <View style={{ marginTop: theme.spacing.xs }}>
        <Button label={buttonLabel} variant="outline" onPress={handleResend} loading={status === 'sending'} disabled={onCooldown} fullWidth />
      </View>
      {message ? <Text color={status === 'error' ? 'error' : 'secondary'}>{message}</Text> : null}
    </Card>
  );
}

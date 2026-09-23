import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { View } from 'react-native';

import { Button, Screen, ScreenHeader, Text, TextField } from '@/components/ui';
import { useResendCooldown } from '@/hooks/useResendCooldown';
import { useTheme } from '@/hooks/useTheme';
import { AUTH_RESEND_COOLDOWN_SECONDS } from '@/lib/authCooldown';
import { sendPasswordReset } from '@/services/auth';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const NEUTRAL_SENT_MESSAGE = 'If an account exists for this email, a password reset link has been sent.';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const normalizedEmail = email.trim().toLowerCase();
  const cooldown = useResendCooldown('password-reset', normalizedEmail);
  // Closes the same rapid-double-tap gap resendConfirmationEmail's UI does —
  // checked synchronously, before any `await` or state update, since a
  // render-only guard (the Button's own `loading`/`disabled`) can still miss
  // a second tap that fires before that render lands.
  const sendingRef = useRef(false);

  async function handleSend() {
    if (sendingRef.current || cooldown.isActive || !email) return;
    sendingRef.current = true;
    setStatus('sending');
    setMessage(null);
    try {
      const result = await sendPasswordReset(email);
      if (result.ok) {
        setStatus('sent');
        setMessage(NEUTRAL_SENT_MESSAGE);
        await cooldown.start(AUTH_RESEND_COOLDOWN_SECONDS);
      } else {
        // A real error (network failure, genuine rate limit) — never say a
        // link was sent when Supabase actually rejected the request. This
        // is distinct from the neutral anti-enumeration message above:
        // Supabase's resetPasswordForEmail already reports `ok: true`
        // regardless of whether the address has an account, so an `ok:
        // false` here always means something genuinely went wrong, not
        // "no such account."
        setStatus('error');
        setMessage(result.error ?? 'Could not send the password reset email.');
        if (result.retryAfterSeconds) await cooldown.start(result.retryAfterSeconds);
      }
    } catch (err) {
      setStatus('error');
      setMessage((err as Error).message || 'Could not send the password reset email. Check your connection and try again.');
    } finally {
      sendingRef.current = false;
    }
  }

  const onCooldown = cooldown.isActive;
  const buttonLabel =
    status === 'sending'
      ? 'Sending…'
      : onCooldown
        ? `Resend in ${cooldown.secondsRemaining}s`
        : status === 'sent' || status === 'error'
          ? 'Resend reset email'
          : 'Send reset link';

  return (
    <Screen scroll>
      <ScreenHeader title="Reset password" showBack />
      <View style={{ gap: theme.spacing.md }}>
        <Text variant="body" color="secondary">
          Enter your account email and we’ll send you a link to reset your password.
        </Text>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={status !== 'sending'}
        />
        {message ? <Text color={status === 'error' ? 'error' : 'secondary'}>{message}</Text> : null}
        <Button label={buttonLabel} onPress={handleSend} loading={status === 'sending'} disabled={onCooldown || !email} fullWidth />
      </View>
      <Button label="Back to sign in" variant="ghost" onPress={() => router.back()} style={{ marginTop: theme.spacing.lg }} />
    </Screen>
  );
}

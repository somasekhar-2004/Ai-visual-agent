import React, { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { resendConfirmationEmail } from '@/services/auth';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/** Shown after signUpWithEmail/signInWithEmail return `pendingConfirmation`
 * — the account exists but has no confirmed session yet. Offers the
 * purpose-built resend path instead of leaving the user to guess whether a
 * second signup attempt will do anything. */
export function ResendConfirmationNotice({ email }: { email: string }) {
  const theme = useTheme();
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function handleResend() {
    setStatus('sending');
    setMessage(null);
    const result = await resendConfirmationEmail(email);
    if (result.ok) {
      setStatus('sent');
      setMessage('Confirmation email sent again — check your inbox and spam folder.');
    } else {
      setStatus('error');
      setMessage(result.error ?? 'Could not resend the confirmation email.');
    }
  }

  return (
    <Card style={{ gap: theme.spacing.sm }}>
      <Text variant="bodyMedium">Check your email to confirm your account</Text>
      <Text variant="body" color="secondary">
        We sent a confirmation link to {email}. Once you confirm it, come back and sign in.
      </Text>
      <View style={{ marginTop: theme.spacing.xs }}>
        <Button
          label={status === 'sending' ? 'Sending…' : 'Resend confirmation email'}
          variant="outline"
          onPress={handleResend}
          loading={status === 'sending'}
          fullWidth
        />
      </View>
      {message ? <Text color={status === 'error' ? 'error' : 'secondary'}>{message}</Text> : null}
    </Card>
  );
}

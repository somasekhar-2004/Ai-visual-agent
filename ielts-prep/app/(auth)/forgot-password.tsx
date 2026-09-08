import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Button, Screen, ScreenHeader, Text, TextField } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { sendPasswordReset } from '@/services/auth';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Reset password" showBack />
      {sent ? (
        <Text variant="body">
          If an account exists for {email}, we’ve sent password reset instructions to that address.
        </Text>
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          <Text variant="body" color="secondary">
            Enter your account email and we’ll send you a link to reset your password.
          </Text>
          <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <Button label="Send reset link" onPress={handleSend} loading={loading} fullWidth />
        </View>
      )}
      <Button label="Back to sign in" variant="ghost" onPress={() => router.back()} style={{ marginTop: theme.spacing.lg }} />
    </Screen>
  );
}

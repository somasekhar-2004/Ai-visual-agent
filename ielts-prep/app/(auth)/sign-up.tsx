import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Button, Screen, ScreenHeader, Text, TextField } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { signUpWithEmail } from '@/services/auth';

export default function SignUpScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setError(null);
    if (!fullName || !email || !password) {
      setError('Please fill in every field.');
      return;
    }
    setLoading(true);
    try {
      const result = await signUpWithEmail(email, password, fullName);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      // A brand new account has no goals yet — route through onboarding to collect them.
      router.replace('/(onboarding)/ielts-type');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Create account" showBack />
      <View style={{ gap: theme.spacing.md }}>
        <TextField label="Full name" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
        <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry hint="At least 8 characters" />
        {error ? <Text color="error">{error}</Text> : null}
      </View>
      <View style={{ marginTop: theme.spacing.xl }}>
        <Button label="Create account" onPress={handleSignUp} loading={loading} fullWidth />
      </View>
    </Screen>
  );
}

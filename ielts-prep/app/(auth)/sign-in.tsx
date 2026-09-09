import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { ResendConfirmationNotice } from '@/components/auth/ResendConfirmationNotice';
import { Button, IconCircle, Screen, Text, TextField } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { isDemoMode } from '@/lib/env';
import { setOnboardingComplete, signInWithEmail } from '@/services/auth';
import { useAppStore } from '@/store/useAppStore';

export default function SignInScreen() {
  const theme = useTheme();
  const router = useRouter();
  const hydrate = useAppStore((s) => s.hydrate);
  const enterDemoMode = useAppStore((s) => s.enterDemoMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await signInWithEmail(email, password);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      if ('pendingConfirmation' in result) {
        setPendingEmail(result.email);
        return;
      }
      await setOnboardingComplete();
      await hydrate();
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setLoading(true);
    try {
      await enterDemoMode();
      await setOnboardingComplete();
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  }

  if (pendingEmail) {
    return (
      <Screen scroll>
        <View style={{ alignItems: 'center', gap: theme.spacing.md, marginTop: theme.spacing.xl, marginBottom: theme.spacing.xl }}>
          <IconCircle name="log-in-outline" size={64} />
          <Text variant="h1">Welcome back</Text>
        </View>
        <ResendConfirmationNotice email={pendingEmail} alreadyRegistered />
        <View style={{ marginTop: theme.spacing.xl }}>
          <Button label="Back to sign in" variant="ghost" onPress={() => setPendingEmail(null)} fullWidth />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ alignItems: 'center', gap: theme.spacing.md, marginTop: theme.spacing.xl, marginBottom: theme.spacing.xl }}>
        <IconCircle name="log-in-outline" size={64} />
        <Text variant="h1">Welcome back</Text>
        <Text variant="body" color="secondary" align="center">
          Sign in to continue your IELTS preparation.
        </Text>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {error ? <Text color="error">{error}</Text> : null}
        <Link href="/(auth)/forgot-password" asChild>
          <Text color="brand">Forgot password?</Text>
        </Link>
      </View>

      <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.xl }}>
        <Button label="Sign in" onPress={handleSignIn} loading={loading} fullWidth />
        {isDemoMode ? <Button label="Continue with Demo Mode" variant="secondary" onPress={handleDemo} fullWidth /> : null}
        <Button label="Create a new account" variant="ghost" onPress={() => router.push('/(auth)/sign-up')} fullWidth />
      </View>
    </Screen>
  );
}

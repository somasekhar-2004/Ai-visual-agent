import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { DevAuthVersionBadge } from '@/components/auth/DevAuthVersionBadge';
import { ResendConfirmationNotice } from '@/components/auth/ResendConfirmationNotice';
import { Button, Screen, ScreenHeader, Text, TextField } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { signUpWithEmail } from '@/services/auth';

type FlowState =
  | { kind: 'idle' }
  | { kind: 'pendingConfirmation'; email: string; alreadyRegistered?: boolean }
  | { kind: 'existingConfirmed'; email: string };

export default function SignUpScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [flow, setFlow] = useState<FlowState>({ kind: 'idle' });

  async function handleSignUp() {
    setError(null);
    if (!fullName || !email || !password) {
      setError('Please fill in every field.');
      return;
    }
    setLoading(true);
    try {
      const result = await signUpWithEmail(email, password, fullName);
      if ('existingConfirmedAccount' in result) {
        setFlow({ kind: 'existingConfirmed', email: result.email });
        return;
      }
      if ('pendingConfirmation' in result) {
        setFlow({ kind: 'pendingConfirmation', email: result.email, alreadyRegistered: result.alreadyRegistered });
        return;
      }
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

  const goToSignIn = () => router.replace('/(auth)/sign-in');

  if (flow.kind === 'existingConfirmed') {
    return (
      <Screen scroll>
        <DevAuthVersionBadge />
        <ScreenHeader title="Account already exists" showBack />
        <Text color="secondary">An account with {flow.email} already exists.</Text>
        <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.sm }}>
          <Button label="Sign in" onPress={goToSignIn} fullWidth />
          <Button label="Use a different email" variant="ghost" onPress={() => setFlow({ kind: 'idle' })} fullWidth />
        </View>
      </Screen>
    );
  }

  if (flow.kind === 'pendingConfirmation') {
    return (
      <Screen scroll>
        <DevAuthVersionBadge />
        <ScreenHeader title="Create account" showBack />
        <ResendConfirmationNotice email={flow.email} alreadyRegistered={flow.alreadyRegistered} justResent={flow.alreadyRegistered} />
        <View style={{ marginTop: theme.spacing.xl }}>
          <Button label="Use a different email" variant="ghost" onPress={() => setFlow({ kind: 'idle' })} fullWidth />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <DevAuthVersionBadge />
      <ScreenHeader title="Create account" showBack />
      <View style={{ gap: theme.spacing.md }}>
        <TextField label="Full name" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
        <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry hint="At least 8 characters" />
        {error ? <Text color="error">{error}</Text> : null}
      </View>
      <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.sm }}>
        <Button label="Create account" onPress={handleSignUp} loading={loading} fullWidth />
        <Button label="Already have an account? Sign in" variant="ghost" onPress={goToSignIn} fullWidth />
      </View>
    </Screen>
  );
}

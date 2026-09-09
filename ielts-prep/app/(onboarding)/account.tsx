import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { ResendConfirmationNotice } from '@/components/auth/ResendConfirmationNotice';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Text, TextField } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { isDemoMode } from '@/lib/env';
import { signUpWithEmail } from '@/services/auth';
import { useAppStore } from '@/store/useAppStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function AccountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const onboarding = useOnboardingStore();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [mode, setMode] = useState<'choice' | 'form'>('choice');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  async function finishOnboarding() {
    await completeOnboarding({
      ieltsType: onboarding.ieltsType ?? 'academic',
      currentBand: onboarding.currentBand,
      targetBand: onboarding.targetBand ?? 7,
      examDate: onboarding.examDate,
      weakestSkill: onboarding.weakestSkill,
      dailyStudyMinutes: onboarding.dailyStudyMinutes ?? 30,
    });
    router.replace('/(onboarding)/plan-ready');
  }

  async function handleDemo() {
    setLoading(true);
    try {
      await finishOnboarding();
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount() {
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
      if ('pendingConfirmation' in result) {
        setPendingEmail(result.email);
        return;
      }
      await finishOnboarding();
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'choice') {
    return (
      <OnboardingScaffold
        step={8}
        totalSteps={9}
        title="Create your account"
        subtitle="Save your progress and sync across devices — or jump straight in with Demo Mode."
        primaryLabel="Create account with email"
        onPrimary={() => setMode('form')}
        secondaryLabel="Continue with Demo Mode"
        onSecondary={handleDemo}
        loading={loading}
      >
        <View />
      </OnboardingScaffold>
    );
  }

  if (pendingEmail) {
    return (
      <OnboardingScaffold
        step={8}
        totalSteps={9}
        title="Create your account"
        onPrimary={() => setPendingEmail(null)}
        primaryLabel="Use a different email"
        secondaryLabel="Back"
        onSecondary={() => {
          setPendingEmail(null);
          setMode('choice');
        }}
      >
        <ResendConfirmationNotice email={pendingEmail} />
      </OnboardingScaffold>
    );
  }

  return (
    <OnboardingScaffold
      step={8}
      totalSteps={9}
      title="Create your account"
      onPrimary={handleCreateAccount}
      primaryLabel="Create account"
      loading={loading}
      secondaryLabel="Back"
      onSecondary={() => setMode('choice')}
    >
      <View style={{ gap: theme.spacing.md }}>
        <TextField label="Full name" value={fullName} onChangeText={setFullName} autoCapitalize="words" placeholder="Alex Kim" />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 8 characters" />
        {error ? <Text color="error">{error}</Text> : null}
        {isDemoMode ? (
          <Text variant="caption" color="tertiary">
            No Supabase project configured yet — account creation will continue in Demo Mode instead.
          </Text>
        ) : null}
      </View>
    </OnboardingScaffold>
  );
}

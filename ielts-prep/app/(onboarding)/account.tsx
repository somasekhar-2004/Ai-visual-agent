import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { DevAuthVersionBadge } from '@/components/auth/DevAuthVersionBadge';
import { ResendConfirmationNotice } from '@/components/auth/ResendConfirmationNotice';
import { OnboardingScaffold } from '@/components/onboarding/OnboardingScaffold';
import { Button, Text, TextField } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { isDemoMode } from '@/lib/env';
import { firstMissingOnboardingStepRoute, validateOnboardingInput } from '@/lib/onboardingValidation';
import { signUpWithEmail } from '@/services/auth';
import { useAppStore } from '@/store/useAppStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';

type FlowState =
  | { kind: 'idle' }
  | { kind: 'pendingConfirmation'; email: string; alreadyRegistered?: boolean }
  | { kind: 'existingConfirmed'; email: string };

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
  const [flow, setFlow] = useState<FlowState>({ kind: 'idle' });
  // Lazy initializer (not an effect) so this is decided once, from the
  // store's value at first render — see the effect below for why.
  const [autoCompleting, setAutoCompleting] = useState(() => Boolean(useAppStore.getState().userId));

  async function finishOnboarding() {
    // Never fabricate a missing required answer (ieltsType/targetBand/
    // dailyStudyMinutes) — this screen is normally only reached after the
    // gated earlier steps (each disables "Next" until answered), but that's
    // an invariant this relies on, not something it trusts blindly. If
    // something is still missing (a stale deep link, a skipped step), send
    // the user back to answer it rather than saving an invented value.
    const input = validateOnboardingInput(onboarding);
    if (!input) {
      const route = firstMissingOnboardingStepRoute(onboarding);
      if (route) router.replace(route);
      return;
    }
    await completeOnboarding(input);
    router.replace('/(onboarding)/plan-ready');
  }

  useEffect(() => {
    // Reaching this screen already authenticated (userId already set in the
    // store at first render, per autoCompleting's lazy initializer above)
    // means the user signed up earlier in this same wizard —
    // app/(auth)/sign-up.tsx sets it before routing into onboarding for a
    // brand-new account — and is just finishing the goal-setup questions
    // for that already-real account. They must never be shown "Create your
    // account" / "Account already exists — sign in" again for an account
    // they already have (the exact bug this fixes): skip straight to
    // saving their answers under the real id. Runs once on mount only, so
    // this never races handleCreateAccount's own direct finishOnboarding()
    // call for the normal, not-yet-authenticated path (autoCompleting
    // starts false there, so this is a no-op).
    if (!autoCompleting) return;
    finishOnboarding().catch((err) => {
      setAutoCompleting(false);
      setError((err as Error).message);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDemo() {
    setLoading(true);
    setError(null);
    try {
      await finishOnboarding();
    } catch (err) {
      setError((err as Error).message);
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
      // signUpWithEmail() just established a real, immediate session (no
      // email confirmation required) and returned that user's real id — but
      // nothing else has put it into useAppStore yet. Without this,
      // completeOnboarding() below finds get().userId still null and falls
      // back to signInDemo(), silently attaching this onboarding data to the
      // wrong (demo) identity instead of the real account that was just
      // created — see lib/env.ts's isBackendMisconfigured comment and
      // services/auth.ts's signInDemo() for the guard that now also refuses
      // that fallback outright when a real backend is configured.
      useAppStore.setState({ userId: result.userId });
      await finishOnboarding();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const goToSignIn = () => router.replace('/(auth)/sign-in');

  if (autoCompleting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  let body: React.ReactNode;

  if (mode === 'choice') {
    body = (
      <OnboardingScaffold
        step={8}
        totalSteps={9}
        title="Create your account"
        subtitle={isDemoMode ? "Save your progress and sync across devices — or jump straight in with Demo Mode." : 'Save your progress and sync across devices.'}
        primaryLabel="Create account with email"
        onPrimary={() => setMode('form')}
        // Demo Mode only exists as a way to try the whole app without a
        // configured backend at all — a build with a real Supabase project
        // must never offer it, since signInDemo() (see services/auth.ts)
        // now correctly refuses to run there, and offering the button would
        // just be a dead end that surfaces a confusing error.
        secondaryLabel={isDemoMode ? 'Continue with Demo Mode' : undefined}
        onSecondary={isDemoMode ? handleDemo : undefined}
        loading={loading}
      >
        <View style={{ alignItems: 'center', gap: theme.spacing.sm }}>
          {error ? <Text color="error">{error}</Text> : null}
          <Button label="Already have an account? Sign in" variant="ghost" onPress={goToSignIn} />
        </View>
      </OnboardingScaffold>
    );
  } else if (flow.kind === 'existingConfirmed') {
    body = (
      <OnboardingScaffold
        step={8}
        totalSteps={9}
        title="Account already exists"
        onPrimary={goToSignIn}
        primaryLabel="Sign in"
        secondaryLabel="Use a different email"
        onSecondary={() => setFlow({ kind: 'idle' })}
      >
        <Text color="secondary">An account with {flow.email} already exists. Sign in to continue.</Text>
      </OnboardingScaffold>
    );
  } else if (flow.kind === 'pendingConfirmation') {
    body = (
      <OnboardingScaffold
        step={8}
        totalSteps={9}
        title="Create your account"
        onPrimary={() => setFlow({ kind: 'idle' })}
        primaryLabel="Use a different email"
        secondaryLabel="Back"
        onSecondary={() => {
          setFlow({ kind: 'idle' });
          setMode('choice');
        }}
      >
        <ResendConfirmationNotice email={flow.email} alreadyRegistered={flow.alreadyRegistered} justResent={flow.alreadyRegistered} />
      </OnboardingScaffold>
    );
  } else {
    body = (
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
          <View style={{ alignItems: 'center' }}>
            <Button label="Already have an account? Sign in" variant="ghost" onPress={goToSignIn} />
          </View>
        </View>
      </OnboardingScaffold>
    );
  }

  return (
    <>
      <DevAuthVersionBadge />
      {body}
    </>
  );
}

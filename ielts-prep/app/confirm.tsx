import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Button, IconCircle, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { exchangeConfirmationCode, setOnboardingComplete } from '@/services/auth';
import { useAppStore } from '@/store/useAppStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';

type Status = 'exchanging' | 'success' | 'error';

/**
 * Deep-link target for the confirmation email — resolves from
 * EMAIL_CONFIRMATION_REDIRECT_URL (services/auth.ts) via Expo Router's
 * file-based linking, e.g. ieltsprep://confirm?code=... . Supabase redirects
 * here itself after verifying the link, either with `code` (success — PKCE
 * flow, see lib/supabase.ts's flowType) or `error`/`error_description`
 * (an invalid or expired link never reaches app code at all).
 */
export default function ConfirmScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; error?: string; error_description?: string }>();
  const hydrate = useAppStore((s) => s.hydrate);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const onboarding = useOnboardingStore();

  const [status, setStatus] = useState<Status>('exchanging');
  const [errorMessage, setErrorMessage] = useState('');
  const [continuing, setContinuing] = useState(false);
  const [continueError, setContinueError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (params.error) {
        if (!cancelled) {
          setErrorMessage(
            params.error_description ? decodeURIComponent(params.error_description.replace(/\+/g, ' ')) : 'This confirmation link is invalid or has expired.'
          );
          setStatus('error');
        }
        return;
      }
      if (!params.code) {
        if (!cancelled) {
          setErrorMessage('This confirmation link is missing its code — open the link from the email again, or request a new one.');
          setStatus('error');
        }
        return;
      }
      const result = await exchangeConfirmationCode(params.code);
      if (cancelled) return;
      if (!result.ok) {
        setErrorMessage(result.error ?? 'This confirmation link is invalid or has expired.');
        setStatus('error');
        return;
      }
      setStatus('success');
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [params.code, params.error, params.error_description]);

  async function handleContinue() {
    setContinuing(true);
    setContinueError(null);
    try {
      // hydrate() first so useAppStore's userId reflects the real session
      // that exchangeConfirmationCode just established — completeOnboarding
      // falls back to creating a demo user when userId is unset, which
      // would be wrong here since this user is genuinely authenticated.
      await hydrate();
      if (onboarding.ieltsType) {
        // The onboarding wizard's answers (collected before "Create
        // account with email" was even tapped) previously never made it
        // into a saved goal for this flow — completeOnboarding was only
        // ever called from the demo/immediate-session signup path in
        // app/(onboarding)/account.tsx, never after an email-confirmation
        // round trip. That's why Home kept showing "Let's set up your
        // study goal" even though the goal-setup screens had already been
        // filled in: they genuinely never got saved.
        await completeOnboarding({
          ieltsType: onboarding.ieltsType,
          currentBand: onboarding.currentBand,
          targetBand: onboarding.targetBand ?? 7,
          examDate: onboarding.examDate,
          weakestSkill: onboarding.weakestSkill,
          dailyStudyMinutes: onboarding.dailyStudyMinutes ?? 30,
        });
        onboarding.reset();
      } else {
        // No wizard answers to save — either this is a re-confirmation for
        // an account whose goal already exists, or the answers were lost
        // (e.g. the app process was killed while waiting for the email,
        // before the persisted-store write below existed). Either way,
        // fabricating a goal from nothing would be worse than honestly
        // leaving Home to show its own "let's set up your goal" state.
        await setOnboardingComplete();
      }
      router.replace('/(tabs)');
    } catch (err) {
      setContinueError((err as Error).message);
    } finally {
      setContinuing(false);
    }
  }

  if (status === 'exchanging') {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text color="secondary">Confirming your email…</Text>
        </View>
      </Screen>
    );
  }

  if (status === 'error') {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
          <IconCircle name="alert-circle-outline" backgroundColor={theme.colors.errorSoft} color={theme.colors.error} size={64} />
          <Text variant="h2" align="center">
            Confirmation link didn&apos;t work
          </Text>
          <Text color="secondary" align="center">
            {errorMessage}
          </Text>
          <Button
            label="Go to sign in"
            onPress={() => router.replace('/(auth)/sign-in')}
            fullWidth
            style={{ marginTop: theme.spacing.md }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md }}>
        <IconCircle name="checkmark-circle-outline" backgroundColor={theme.colors.successSoft} color={theme.colors.success} size={64} />
        <Text variant="h2" align="center">
          Email confirmed
        </Text>
        <Text color="secondary" align="center">
          Your account is ready. Let&apos;s get started.
        </Text>
        {continueError ? (
          <Text color="error" align="center">
            {continueError}
          </Text>
        ) : null}
        <Button label="Continue" onPress={handleContinue} loading={continuing} fullWidth style={{ marginTop: theme.spacing.md }} />
      </View>
    </Screen>
  );
}

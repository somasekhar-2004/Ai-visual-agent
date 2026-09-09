import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Badge, Button, Card, IconCircle, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getPurchasesProvider, isPurchasesMocked } from '@/services/purchases';
import { setSubscription } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

const PLAN_LABEL: Record<string, string> = {
  free: 'Free',
  premium_monthly: 'Premium (Monthly)',
  premium_yearly: 'Premium (Yearly)',
};

export default function SubscriptionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { userId, subscription, refreshUserData } = useAppStore(useShallow((s) => ({
    userId: s.userId,
    subscription: s.subscription,
    refreshUserData: s.refreshUserData,
  })));

  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);

  const isPremium = subscription?.plan !== 'free';
  const isCancelled = subscription?.status === 'cancelled';
  const periodEndLabel = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : null;

  async function handleRestore() {
    setRestoring(true);
    setError(null);
    setRestored(false);
    try {
      const result = await getPurchasesProvider().restore();
      if (result.success && result.plan && userId) {
        await setSubscription(userId, result.plan, 'active');
        await refreshUserData(userId);
        setRestored(true);
      } else {
        setError(result.error ?? 'No purchase to restore.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRestoring(false);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Subscription" showBack />
      <View style={{ alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
        <IconCircle name="star" size={64} backgroundColor={isPremium ? theme.colors.warningSoft : theme.colors.surfaceAlt} color={theme.colors.warning} />
        <Badge label={PLAN_LABEL[subscription?.plan ?? 'free']} tone={isPremium ? 'brand' : 'neutral'} />
        {isCancelled && periodEndLabel ? <Badge label={`Cancelled — active until ${periodEndLabel}`} tone="warning" /> : null}
        {subscription?.status === 'expired' ? <Badge label="Subscription expired" tone="error" /> : null}
      </View>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="body" color="secondary">
          {isPremium
            ? 'You have full access to unlimited practice, full mock tests, the AI Speaking Examiner, AI Writing Evaluator, and unlimited AI Coach messages.'
            : 'Free plan includes selected lessons, limited daily practice, limited AI messages, one sample mock test, and basic progress tracking.'}
        </Text>
        {isCancelled && periodEndLabel ? (
          <Text variant="caption" color="warning" style={{ marginTop: theme.spacing.xs }}>
            Auto-renewal is off. You&apos;ll keep Premium access until {periodEndLabel}, then the account reverts to Free.
          </Text>
        ) : null}
      </Card>

      {!isPremium ? <Button label="Upgrade to Premium" onPress={() => router.push('/paywall')} fullWidth style={{ marginBottom: theme.spacing.sm }} /> : null}
      <Button label="Restore purchases" variant="secondary" onPress={handleRestore} loading={restoring} fullWidth />

      {error ? (
        <Text color="error" style={{ marginTop: theme.spacing.sm }}>
          {error}
        </Text>
      ) : null}
      {restored ? (
        <Text color="success" style={{ marginTop: theme.spacing.sm }}>
          Purchase restored.
        </Text>
      ) : null}

      {isPurchasesMocked() ? (
        <Text variant="caption" color="tertiary" align="center" style={{ marginTop: theme.spacing.lg }}>
          RevenueCat isn&apos;t configured — plan changes here are simulated for Demo Mode and are not real purchases.
        </Text>
      ) : (
        <Text variant="caption" color="tertiary" align="center" style={{ marginTop: theme.spacing.lg }}>
          To cancel or change your plan, use your App Store or Google Play subscription settings — changes sync here automatically the next time you open the app.
        </Text>
      )}
    </Screen>
  );
}

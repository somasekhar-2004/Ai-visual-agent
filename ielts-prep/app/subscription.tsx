import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Badge, Button, Card, IconCircle, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { purchaseResultMessage } from '@/lib/purchaseResultMessage';
import { googlePlaySubscriptionManagementUrl } from '@/lib/subscriptionManagementUrl';
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
  const [result, setResult] = useState<{ tone: 'info' | 'error'; message: string } | null>(null);

  const isPremium = subscription?.plan !== 'free';
  const isCancelled = subscription?.status === 'cancelled';
  const periodEndLabel = subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : null;

  async function handleRestore() {
    setRestoring(true);
    setResult(null);
    try {
      const restoreResult = await getPurchasesProvider().restore();
      setResult(purchaseResultMessage(restoreResult));
      if (restoreResult.success && restoreResult.plan && userId) {
        await setSubscription(userId, restoreResult.plan, 'active');
        await refreshUserData(userId);
      }
    } catch (err) {
      setResult({ tone: 'error', message: (err as Error).message });
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
            ? 'You have full access to all premium mock tests, premium analytics, and a much higher daily AI Writing/Speaking evaluation allowance.'
            : 'Free plan includes core practice, 10 AI Writing and 10 AI Speaking evaluations a day, a separate Full Mock allowance, and basic progress tracking.'}
        </Text>
        {isCancelled && periodEndLabel ? (
          <Text variant="caption" color="warning" style={{ marginTop: theme.spacing.xs }}>
            Auto-renewal is off. You&apos;ll keep Premium access until {periodEndLabel}, then the account reverts to Free.
          </Text>
        ) : null}
      </Card>

      {!isPremium ? (
        <Button label="Upgrade to Premium" onPress={() => router.push('/paywall')} fullWidth style={{ marginBottom: theme.spacing.sm }} />
      ) : (
        <Button
          label="Manage subscription"
          variant="secondary"
          onPress={() => Linking.openURL(googlePlaySubscriptionManagementUrl())}
          fullWidth
          style={{ marginBottom: theme.spacing.sm }}
        />
      )}
      <Button label="Restore purchases" variant="secondary" onPress={handleRestore} loading={restoring} fullWidth />

      {result ? (
        <Text color={result.tone === 'error' ? 'error' : 'success'} style={{ marginTop: theme.spacing.sm }}>
          {result.message}
        </Text>
      ) : null}

      {isPurchasesMocked() ? (
        <Text variant="caption" color="tertiary" align="center" style={{ marginTop: theme.spacing.lg }}>
          RevenueCat isn&apos;t configured — plan changes here are simulated for Demo Mode and are not real purchases.
        </Text>
      ) : (
        <Text variant="caption" color="tertiary" align="center" style={{ marginTop: theme.spacing.lg }}>
          To cancel or change your plan, use &quot;Manage subscription&quot; above (Google Play) — changes sync here automatically the next time you open the app.
        </Text>
      )}
    </Screen>
  );
}

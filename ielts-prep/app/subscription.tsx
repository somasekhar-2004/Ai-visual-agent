import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Badge, Button, Card, IconCircle, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getPurchasesProvider } from '@/services/purchases';
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

  const isPremium = subscription?.plan !== 'free';

  async function handleRestore() {
    const result = await getPurchasesProvider().restore();
    if (result.success && result.plan && userId) {
      await setSubscription(userId, result.plan, 'active');
      await refreshUserData(userId);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Subscription" showBack />
      <View style={{ alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
        <IconCircle name="star" size={64} backgroundColor={isPremium ? theme.colors.warningSoft : theme.colors.surfaceAlt} color={theme.colors.warning} />
        <Badge label={PLAN_LABEL[subscription?.plan ?? 'free']} tone={isPremium ? 'brand' : 'neutral'} />
      </View>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="body" color="secondary">
          {isPremium
            ? 'You have full access to unlimited practice, full mock tests, the AI Speaking Examiner, AI Writing Evaluator, and unlimited AI Coach messages.'
            : 'Free plan includes selected lessons, limited daily practice, limited AI messages, one sample mock test, and basic progress tracking.'}
        </Text>
      </Card>

      {!isPremium ? <Button label="Upgrade to Premium" onPress={() => router.push('/paywall')} fullWidth style={{ marginBottom: theme.spacing.sm }} /> : null}
      <Button label="Restore purchases" variant="secondary" onPress={handleRestore} fullWidth />
    </Screen>
  );
}

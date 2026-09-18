import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Badge, Button, Card, IconCircle, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { purchaseResultMessage } from '@/lib/purchaseResultMessage';
import { computeYearlySavingsPercent } from '@/lib/purchasePricing';
import { googlePlaySubscriptionManagementUrl } from '@/lib/subscriptionManagementUrl';
import { getPurchasesProvider, isPurchasesMocked, isPurchasesUnavailable } from '@/services/purchases';
import { setSubscription } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

const FEATURES = [
  'All premium mock tests',
  'Premium progress analytics',
  'More AI Writing evaluations',
  'More AI Speaking evaluations',
  'Advanced predicted-band insights',
  'Full premium study experience',
];

export default function PaywallScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { userId, isPremium, refreshUserData } = useAppStore(useShallow((s) => ({
    userId: s.userId,
    isPremium: s.subscription?.plan !== 'free',
    refreshUserData: s.refreshUserData,
  })));

  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState<'purchase' | 'restore' | null>(null);
  const [result, setResult] = useState<{ tone: 'info' | 'error'; message: string } | null>(null);

  const productsQuery = useQuery({ queryKey: ['purchase-products'], queryFn: () => getPurchasesProvider().getProducts() });
  const products = productsQuery.data ?? [];
  const monthly = products.find((p) => p.period === 'monthly');
  const yearly = products.find((p) => p.period === 'yearly');
  const activeProduct = products.find((p) => p.identifier === selected) ?? yearly ?? products[0];
  const savingsPercent = computeYearlySavingsPercent(monthly, yearly);

  async function handlePurchase() {
    if (!userId || !activeProduct) return;
    setLoading('purchase');
    setResult(null);
    try {
      const purchaseResult = await getPurchasesProvider().purchase(activeProduct.identifier);
      setResult(purchaseResultMessage(purchaseResult));
      if (!purchaseResult.success || !purchaseResult.plan) return;
      // Local write for immediate UI feedback (the store's own webhook, once
      // deployed, is the authoritative sync — see
      // supabase/functions/revenuecat-webhook — this just avoids the user
      // seeing stale "Free" state for the few seconds until that fires).
      await setSubscription(userId, purchaseResult.plan, 'active');
      await refreshUserData(userId);
      router.back();
    } catch (err) {
      setResult({ tone: 'error', message: (err as Error).message });
    } finally {
      setLoading(null);
    }
  }

  async function handleRestore() {
    setLoading('restore');
    setResult(null);
    try {
      const restoreResult = await getPurchasesProvider().restore();
      setResult(purchaseResultMessage(restoreResult));
      if (restoreResult.success && restoreResult.plan && userId) {
        await setSubscription(userId, restoreResult.plan, 'active');
        await refreshUserData(userId);
        router.back();
      }
    } catch (err) {
      setResult({ tone: 'error', message: (err as Error).message });
    } finally {
      setLoading(null);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Go Premium" showBack />
      <View style={{ alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
        <IconCircle name="star" size={64} backgroundColor={theme.colors.warningSoft} color={theme.colors.warning} />
        <Text variant="h2" align="center">
          Unlock everything IELTS Prep offers
        </Text>
      </View>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        {FEATURES.map((f) => (
          <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, marginBottom: theme.spacing.xs }}>
            <Ionicons name="checkmark-circle" size={18} color={theme.colors.success} />
            <Text variant="body">{f}</Text>
          </View>
        ))}
      </Card>

      {isPremium ? (
        <Card style={{ marginBottom: theme.spacing.lg, alignItems: 'center', gap: theme.spacing.sm }}>
          <Badge label="You're already Premium" tone="success" />
          <Button label="Manage subscription" variant="secondary" onPress={() => Linking.openURL(googlePlaySubscriptionManagementUrl())} fullWidth />
        </Card>
      ) : (
        <>
          {products.map((p) => (
            <Card
              key={p.identifier}
              onPress={() => setSelected(p.identifier)}
              style={{
                marginBottom: theme.spacing.sm,
                borderColor: activeProduct?.identifier === p.identifier ? theme.colors.primary : theme.colors.border,
                borderWidth: activeProduct?.identifier === p.identifier ? 2 : 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.sm,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">{p.title}</Text>
                <Text variant="caption" color="secondary">
                  {p.priceString}
                  {p.trialDays ? ` • ${p.trialDays}-day free trial` : ''}
                </Text>
              </View>
              {p.period === 'yearly' && savingsPercent ? <Badge label={`Save ${savingsPercent}%`} tone="success" /> : null}
            </Card>
          ))}

          {result ? (
            <Text color={result.tone === 'error' ? 'error' : 'secondary'} style={{ marginBottom: theme.spacing.sm }}>
              {result.message}
            </Text>
          ) : null}

          <Button
            label={`Start Premium${activeProduct ? ` — ${activeProduct.priceString}` : ''}`}
            onPress={handlePurchase}
            loading={loading === 'purchase'}
            fullWidth
            disabled={!activeProduct || loading !== null}
          />
          <Button label="Restore purchases" variant="ghost" onPress={handleRestore} loading={loading === 'restore'} disabled={loading !== null} fullWidth style={{ marginTop: theme.spacing.xs }} />
        </>
      )}

      {isPurchasesUnavailable() ? (
        <Text variant="caption" color="tertiary" align="center" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.md }}>
          Subscriptions aren&apos;t available yet — check back soon.
        </Text>
      ) : isPurchasesMocked() ? (
        <Text variant="caption" color="tertiary" align="center" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.md }}>
          RevenueCat isn&apos;t configured yet — this is a simulated purchase for demo purposes. No payment will be charged.
        </Text>
      ) : (
        <Text variant="caption" color="tertiary" align="center" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.md }}>
          Payment will be charged to your Google Play account. Subscriptions renew automatically at the plan&apos;s price unless cancelled before the renewal date.
        </Text>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.huge }}>
        <Text variant="caption" color="brand" onPress={() => router.push('/help')}>
          Terms of Use
        </Text>
        <Text variant="caption" color="tertiary">
          •
        </Text>
        <Text variant="caption" color="brand" onPress={() => router.push('/help')}>
          Privacy Policy
        </Text>
      </View>
    </Screen>
  );
}

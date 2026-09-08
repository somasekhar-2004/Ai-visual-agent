import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Badge, Button, Card, IconCircle, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getPurchasesProvider, isPurchasesMocked } from '@/services/purchases';
import { setSubscription } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

const FEATURES = [
  'Unlimited practice questions',
  'Full-length mock tests',
  'AI Speaking Examiner',
  'AI Writing Evaluator',
  'Unlimited AI Coach messages',
  'Advanced analytics & personalized plans',
  'Complete lesson & vocabulary library',
];

export default function PaywallScreen() {
  const theme = useTheme();
  const router = useRouter();
  const userId = useAppStore((s) => s.userId);
  const refreshUserData = useAppStore((s) => s.refreshUserData);

  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productsQuery = useQuery({ queryKey: ['purchase-products'], queryFn: () => getPurchasesProvider().getProducts() });
  const products = productsQuery.data ?? [];
  const activeProduct = products.find((p) => p.identifier === selected) ?? products.find((p) => p.period === 'yearly') ?? products[0];

  async function handlePurchase() {
    if (!userId || !activeProduct) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getPurchasesProvider().purchase(activeProduct.identifier);
      if (!result.success || !result.plan) {
        setError(result.error ?? 'Purchase could not be completed.');
        return;
      }
      await setSubscription(userId, result.plan, 'active');
      await refreshUserData(userId);
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setLoading(true);
    setError(null);
    try {
      const result = await getPurchasesProvider().restore();
      if (result.success && result.plan && userId) {
        await setSubscription(userId, result.plan, 'active');
        await refreshUserData(userId);
        router.back();
      } else {
        setError(result.error ?? 'No purchase to restore.');
      }
    } finally {
      setLoading(false);
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
          {p.period === 'yearly' ? <Badge label="Best value" tone="success" /> : null}
        </Card>
      ))}

      {error ? (
        <Text color="error" style={{ marginBottom: theme.spacing.sm }}>
          {error}
        </Text>
      ) : null}

      <Button label={`Continue${activeProduct ? ` — ${activeProduct.priceString}` : ''}`} onPress={handlePurchase} loading={loading} fullWidth disabled={!activeProduct} />
      <Button label="Restore purchases" variant="ghost" onPress={handleRestore} fullWidth style={{ marginTop: theme.spacing.xs }} />

      {isPurchasesMocked() ? (
        <Text variant="caption" color="tertiary" align="center" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.huge }}>
          RevenueCat isn’t configured yet — this is a simulated purchase for demo purposes. No payment will be charged.
        </Text>
      ) : (
        <Text variant="caption" color="tertiary" align="center" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.huge }}>
          Payment will be charged to your App Store or Google Play account. Subscriptions renew automatically unless cancelled.
        </Text>
      )}
    </Screen>
  );
}

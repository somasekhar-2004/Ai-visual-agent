import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Badge, Card, Divider, IconCircle, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/useAppStore';

type Row = { title: string; icon: keyof typeof Ionicons.glyphMap; href: string; badge?: string };

const ROWS: Row[] = [
  { title: 'Edit profile & goals', icon: 'person-outline', href: '/profile-edit' },
  { title: 'Progress & analytics', icon: 'stats-chart-outline', href: '/analytics' },
  { title: 'Achievements', icon: 'trophy-outline', href: '/achievements' },
  { title: 'Notification settings', icon: 'notifications-outline', href: '/notification-settings' },
  { title: 'Subscription', icon: 'star-outline', href: '/subscription' },
  { title: 'Help & support', icon: 'help-circle-outline', href: '/help' },
  // Dev-build-only — see app/dev-health-check.tsx's own __DEV__ guard, which
  // also protects direct navigation to it.
  ...(__DEV__ ? [{ title: 'Developer health check', icon: 'pulse-outline' as const, href: '/dev-health-check' }] : []),
];

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { profile, goal, subscription, signOut } = useAppStore(useShallow((s) => ({
    profile: s.profile,
    goal: s.goal,
    subscription: s.subscription,
    signOut: s.signOut,
  })));

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)/sign-in');
  }

  return (
    <Screen scroll>
      <View style={{ alignItems: 'center', marginBottom: theme.spacing.xl, gap: theme.spacing.xs }}>
        <IconCircle name="person" size={80} />
        <Text variant="h2">{profile?.fullName ?? 'Student'}</Text>
        <Badge
          label={subscription?.plan === 'free' ? 'Free plan' : subscription?.plan === 'premium_yearly' ? 'Premium (yearly)' : 'Premium (monthly)'}
          tone={subscription?.plan === 'free' ? 'neutral' : 'brand'}
        />
        {goal ? (
          <Text variant="caption" color="secondary" style={{ textTransform: 'capitalize' }}>
            IELTS {goal.ieltsType} • Target Band {goal.targetBand.toFixed(1)}
          </Text>
        ) : null}
      </View>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        {ROWS.map((row, i) => (
          <View key={row.title}>
            <Pressable
              onPress={() => router.push(row.href as any)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, paddingVertical: theme.spacing.sm }}
            >
              <Ionicons name={row.icon} size={20} color={theme.colors.textSecondary} />
              <Text variant="body" style={{ flex: 1 }}>
                {row.title}
              </Text>
              {row.badge ? <Badge label={row.badge} tone="brand" /> : null}
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </Pressable>
            {i < ROWS.length - 1 ? <Divider /> : null}
          </View>
        ))}
      </Card>

      <Card onPress={handleSignOut} style={{ marginBottom: theme.spacing.huge, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
        <Text color="error">Sign out</Text>
      </Card>
    </Screen>
  );
}

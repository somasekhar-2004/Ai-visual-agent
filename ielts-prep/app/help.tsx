import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, View } from 'react-native';

import { Button, Card, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { confirmAsync } from '@/lib/confirm';
import { deleteAccount } from '@/services/auth';
import { useAppStore } from '@/store/useAppStore';

export default function HelpScreen() {
  const theme = useTheme();
  const router = useRouter();
  const signOut = useAppStore((s) => s.signOut);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    const confirmed = await confirmAsync(
      'Delete account',
      'This permanently deletes your profile, progress, and test history. This cannot be undone.',
      'Delete account'
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      const result = await deleteAccount();
      if (!result.ok) {
        Alert.alert('Could not delete account', result.message ?? 'Please try again later.');
        return;
      }
      await signOut();
      router.replace('/(auth)/sign-in');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Help & support" showBack />

      <Card style={{ marginBottom: theme.spacing.md }}>
        <Text variant="bodyMedium" style={{ marginBottom: theme.spacing.xs }}>
          Frequently asked questions
        </Text>
        <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
          Q: Are the AI band scores official?{'\n'}A: No — every AI-generated score in this app is an estimate for practice purposes only, and is
          never an official IELTS result.
        </Text>
        <Text variant="body" color="secondary">
          Q: Can I use the app without an internet connection?{'\n'}A: Demo Mode works fully offline. Real AI evaluation and Supabase sync require
          a connection.
        </Text>
      </Card>

      <Card onPress={() => Linking.openURL('mailto:support@ieltsprep.app')} style={{ marginBottom: theme.spacing.md }}>
        <Text variant="bodyMedium">Contact support</Text>
        <Text variant="caption" color="secondary">
          support@ieltsprep.app
        </Text>
      </Card>

      <Card style={{ marginBottom: theme.spacing.md }}>
        <Text variant="bodyMedium" style={{ marginBottom: theme.spacing.xs }}>
          Privacy Policy
        </Text>
        <Text variant="caption" color="secondary">
          Placeholder — replace with your real privacy policy before publishing to the App Store or Google Play. This app stores study progress,
          practice attempts, and (if you use a real AI provider) submits your writing/speaking responses to that provider for evaluation.
        </Text>
      </Card>

      <Card style={{ marginBottom: theme.spacing.lg }}>
        <Text variant="bodyMedium" style={{ marginBottom: theme.spacing.xs }}>
          Terms of Service
        </Text>
        <Text variant="caption" color="secondary">
          Placeholder — replace with your real terms before publishing. All band scores shown in this app are AI-generated estimates for practice
          purposes and are not affiliated with or endorsed by IDP, British Council, or Cambridge Assessment English.
        </Text>
      </Card>

      <View style={{ marginBottom: theme.spacing.huge }}>
        <Button label="Delete account" variant="danger" onPress={confirmDelete} loading={deleting} fullWidth />
      </View>
    </Screen>
  );
}

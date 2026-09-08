import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Button, IconCircle, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: theme.spacing.lg }}>
        <IconCircle name="school-outline" size={88} />
        <Text variant="display" align="center">
          IELTS Prep
        </Text>
        <Text variant="bodyLg" color="secondary" align="center" style={{ maxWidth: 320 }}>
          Your personal path to the band score you need — Reading, Listening, Writing, and Speaking, with AI feedback on every attempt.
        </Text>
      </View>
      <View style={{ gap: theme.spacing.sm }}>
        <Button label="Get started" onPress={() => router.push('/(onboarding)/ielts-type')} fullWidth />
        <Button
          label="I already have an account"
          variant="ghost"
          onPress={() => router.push('/(auth)/sign-in')}
          fullWidth
        />
      </View>
    </Screen>
  );
}

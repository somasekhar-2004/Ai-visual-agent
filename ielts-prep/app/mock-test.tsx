import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Badge, Button, Card, IconCircle, Screen, ScreenHeader, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { content } from '@/lib/content';
import { buildMockFlowSteps, hrefForFlowStep } from '@/lib/mockFlow';
import { getInProgressMockAttempt, getMockSections, startMockAttempt } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

const SKILL_LABEL: Record<string, string> = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking' };
const SKILL_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  listening: 'headset-outline',
  reading: 'book-outline',
  writing: 'create-outline',
  speaking: 'mic-outline',
};

export default function MockTestIntroScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { mockTestId } = useLocalSearchParams<{ mockTestId: string }>();
  const userId = useAppStore((s) => s.userId);
  const isPremium = useAppStore((s) => s.subscription?.plan !== 'free');
  const [starting, setStarting] = useState(false);

  const mockTest = content.mockTests.find((t) => t.id === mockTestId);
  const sections = useMemo(() => getMockSections(mockTestId), [mockTestId]);
  const totalMinutes = sections.reduce((sum, s) => sum + s.durationMinutes, 0);

  async function handleStart() {
    if (!userId || !mockTest) return;
    if (!mockTest.isFree && !isPremium) {
      router.push('/paywall');
      return;
    }
    setStarting(true);
    try {
      const existing = await getInProgressMockAttempt(userId, mockTest.id);
      const attempt = existing ?? (await startMockAttempt(userId, mockTest.id));

      const steps = buildMockFlowSteps(mockTest.id);
      if (!steps.length) return;
      router.push(hrefForFlowStep(steps[0], mockTest.id, attempt.id, 0) as any);
    } finally {
      setStarting(false);
    }
  }

  if (!mockTest) {
    return (
      <Screen>
        <ScreenHeader title="Mock test" showBack />
        <Text color="secondary">This mock test could not be found.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <ScreenHeader title={mockTest.title} showBack />
      <Badge label={`${totalMinutes} minutes total`} tone="brand" />
      <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
        This full mock test moves through all four sections in order, just like the real IELTS test. Once started, you can also complete it in
        one sitting or resume if you close the app.
      </Text>

      {sections.map((section) => (
        <Card key={section.id} style={{ marginBottom: theme.spacing.sm, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <IconCircle name={SKILL_ICON[section.skill]} color={theme.skillColors[section.skill]} backgroundColor={theme.skillColors[section.skill] + '22'} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">{SKILL_LABEL[section.skill]}</Text>
            <Text variant="caption" color="secondary">
              {section.durationMinutes} minutes
            </Text>
          </View>
        </Card>
      ))}

      <Button label="Start full test" onPress={handleStart} loading={starting} fullWidth style={{ marginTop: theme.spacing.lg, marginBottom: theme.spacing.huge }} />
    </Screen>
  );
}

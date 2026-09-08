import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Badge, Card, IconCircle, Screen, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { content } from '@/lib/content';
import { listMockTests } from '@/services/repository';

const SECTION_TESTS: { title: string; description: string; icon: keyof typeof Ionicons.glyphMap; href: string }[] = [
  { title: 'Reading test', description: '1 passage, timed, examiner-style interface', icon: 'book-outline', href: '/reading-test' },
  { title: 'Listening test', description: '2 sections, audio playback, note-style answers', icon: 'headset-outline', href: '/listening-test' },
  { title: 'Writing test', description: 'Task 1 or Task 2, timed with AI evaluation', icon: 'create-outline', href: '/writing-test' },
  { title: 'Speaking test', description: 'AI examiner across Parts 1, 2 and 3', icon: 'mic-outline', href: '/speaking-session' },
];

export default function TestsHubScreen() {
  const theme = useTheme();
  const router = useRouter();
  const mockTests = listMockTests();

  return (
    <Screen scroll>
      <Text variant="h1" style={{ marginBottom: theme.spacing.xs }}>
        Tests
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.lg }}>
        Full IELTS-style mock tests and section-specific timed tests.
      </Text>

      <Text variant="h3" style={{ marginBottom: theme.spacing.sm }}>
        Full mock tests
      </Text>
      {mockTests.map((test) => (
        <Card
          key={test.id}
          onPress={() => router.push({ pathname: '/mock-test', params: { mockTestId: test.id } })}
          style={{ marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
        >
          <IconCircle name="albums-outline" />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">{test.title}</Text>
            <Text variant="caption" color="secondary" style={{ textTransform: 'capitalize' }}>
              {test.ieltsType} • {content.mockSections.filter((s) => s.mockTestId === test.id).length} sections
            </Text>
          </View>
          {test.isFree ? <Badge label="Free" tone="success" /> : <Badge label="Premium" tone="brand" />}
        </Card>
      ))}

      <Text variant="h3" style={{ marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}>
        Section-specific tests
      </Text>
      {SECTION_TESTS.map((t) => (
        <Card
          key={t.title}
          onPress={() => router.push(t.href as any)}
          style={{ marginBottom: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
        >
          <IconCircle name={t.icon} />
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium">{t.title}</Text>
            <Text variant="caption" color="secondary">
              {t.description}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
        </Card>
      ))}

      <Card
        onPress={() => router.push('/test-history')}
        style={{ marginBottom: theme.spacing.huge, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}
      >
        <IconCircle name="time-outline" />
        <View style={{ flex: 1 }}>
          <Text variant="bodyMedium">Test history</Text>
          <Text variant="caption" color="secondary">
            View all past attempts and detailed reports
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
      </Card>
    </Screen>
  );
}

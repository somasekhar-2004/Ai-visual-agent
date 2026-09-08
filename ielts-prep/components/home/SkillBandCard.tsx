import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { Card, ProgressBar, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import type { SkillKey } from '@/types/models';

const SKILL_META: Record<SkillKey, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  listening: { label: 'Listening', icon: 'headset-outline' },
  reading: { label: 'Reading', icon: 'book-outline' },
  writing: { label: 'Writing', icon: 'create-outline' },
  speaking: { label: 'Speaking', icon: 'mic-outline' },
};

export function SkillBandCard({ skill, band, onPress }: { skill: SkillKey; band: number | null; onPress?: () => void }) {
  const theme = useTheme();
  const meta = SKILL_META[skill];
  const color = theme.skillColors[skill];

  return (
    <Card onPress={onPress} style={{ flex: 1, gap: theme.spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Ionicons name={meta.icon} size={16} color={color} />
        <Text variant="caption" color="secondary">
          {meta.label}
        </Text>
      </View>
      <Text variant="h2">{band ? band.toFixed(1) : '—'}</Text>
      <ProgressBar progress={(band ?? 0) / 9} color={color} height={6} />
    </Card>
  );
}

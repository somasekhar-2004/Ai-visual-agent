import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';
import { getAiProviderName, isRealAiActive } from '@/services/ai';

/** Shown next to every AI-generated result so it is never mistaken for a
 * real model's output when no AI credentials are configured (or for a
 * real provider's output when they are). Never hide this — see AGENTS
 * requirement: "Never silently present mocked scoring as real AI scoring." */
export function DemoAiBadge() {
  const theme = useTheme();
  const real = isRealAiActive();

  const bg = real ? theme.colors.successSoft : theme.colors.warningSoft;
  const fg = real ? theme.colors.success : theme.colors.warning;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'center',
        backgroundColor: bg,
        borderRadius: theme.radius.pill,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
      }}
    >
      <Ionicons name={real ? 'sparkles' : 'flask-outline'} size={12} color={fg} />
      <Text variant="micro" style={{ color: fg }}>
        {real ? `Live AI (${getAiProviderName()})` : 'Demo AI — simulated result'}
      </Text>
    </View>
  );
}

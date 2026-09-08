import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

export function AiCoachFab() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/ai-coach')}
      style={({ pressed }) => [
        {
          position: 'absolute',
          right: theme.spacing.lg,
          bottom: theme.spacing.lg,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.9 : 1,
        },
        theme.shadows.lg,
      ]}
    >
      <Ionicons name="sparkles" size={26} color={theme.colors.onPrimary} />
    </Pressable>
  );
}

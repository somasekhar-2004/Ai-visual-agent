import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';

export function OptionCard({
  title,
  subtitle,
  selected,
  onPress,
  icon,
}: {
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const theme = useTheme();

  return (
    <Card
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        borderColor: selected ? theme.colors.primary : theme.colors.border,
        borderWidth: selected ? 2 : 1,
        marginBottom: theme.spacing.sm,
      }}
    >
      {icon ? <Ionicons name={icon} size={22} color={selected ? theme.colors.primary : theme.colors.textSecondary} /> : null}
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium">{title}</Text>
        {subtitle ? (
          <Text variant="caption" color="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} /> : null}
    </Card>
  );
}

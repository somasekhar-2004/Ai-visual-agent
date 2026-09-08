import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { Button } from './Button';
import { IconCircle } from './IconCircle';
import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();

  return (
    <View style={{ alignItems: 'center', padding: theme.spacing.xl, gap: theme.spacing.sm }}>
      <IconCircle name={icon} size={64} />
      <Text variant="h3" align="center">
        {title}
      </Text>
      {description ? (
        <Text variant="body" color="secondary" align="center">
          {description}
        </Text>
      ) : null}
      {actionLabel ? (
        <Button label={actionLabel} onPress={onAction} variant="outline" style={{ marginTop: theme.spacing.sm }} />
      ) : null}
    </View>
  );
}

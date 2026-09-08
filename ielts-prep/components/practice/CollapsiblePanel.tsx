import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';

/** A titled section that can be collapsed to save space on small screens,
 * with an internal scroll area so long passages/transcripts don't push the
 * question below the fold. Defaults to expanded. */
export function CollapsiblePanel({
  title,
  subtitle,
  icon = 'book-outline',
  maxHeight = 260,
  defaultExpanded = true,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  maxHeight?: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.md,
        overflow: 'hidden',
      }}
    >
      <Pressable
        onPress={() => setExpanded((e) => !e)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.surfaceAlt,
        }}
      >
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyMedium" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" color="secondary" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textTertiary} />
      </Pressable>
      {expanded ? (
        <ScrollView style={{ maxHeight }} contentContainerStyle={{ padding: theme.spacing.md }} nestedScrollEnabled>
          {children}
        </ScrollView>
      ) : null}
    </View>
  );
}

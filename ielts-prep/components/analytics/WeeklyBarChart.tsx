import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';

export function WeeklyBarChart({ data }: { data: { date: string; count: number }[] }) {
  const theme = useTheme();
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 8 }}>
      {data.map((d) => {
        const day = new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2);
        return (
          <View key={d.date} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View
              style={{
                width: '100%',
                height: Math.max(4, (d.count / max) * 70),
                borderRadius: theme.radius.sm,
                backgroundColor: d.count > 0 ? theme.colors.primary : theme.colors.surfaceAlt,
              }}
            />
            <Text variant="micro" color="tertiary">
              {day}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

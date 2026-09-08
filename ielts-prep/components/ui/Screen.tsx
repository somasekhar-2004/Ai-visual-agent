import React from 'react';
import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/useTheme';

type ScreenProps = ViewProps & {
  scroll?: boolean;
  padded?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function Screen({ scroll, padded = true, edges = ['top'], style, children, ...rest }: ScreenProps) {
  const theme = useTheme();
  const Container = scroll ? ScrollView : View;

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      edges={edges}
    >
      <Container
        style={scroll ? undefined : [styles.flex, padded && { padding: theme.spacing.lg }, style]}
        contentContainerStyle={
          scroll ? [padded && { padding: theme.spacing.lg }, style] : undefined
        }
        {...(rest as object)}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

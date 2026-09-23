import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconCircle, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { getSupabaseConfigIssue } from '@/lib/env';

/**
 * Rendered instead of the whole app whenever isBackendMisconfigured is true
 * (see lib/env.ts) — a release build whose Supabase env vars are missing or
 * invalid. This is the deliberate alternative to two worse outcomes: a hard
 * crash from createClient() rejecting a malformed URL, or (the actual
 * production incident this fixes) silently falling back to Demo Mode and
 * showing a real user fabricated "Alex" data instead of their own account.
 * Never renders anything from SUPABASE_URL/SUPABASE_ANON_KEY's actual
 * values — only the generic, secret-free reason from getSupabaseConfigIssue().
 */
export function ConfigurationErrorScreen() {
  const theme = useTheme();
  const issue = getSupabaseConfigIssue();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.xl, gap: theme.spacing.md }}>
        <IconCircle name="construct-outline" size={72} backgroundColor={theme.colors.errorSoft} color={theme.colors.error} />
        <Text variant="h3" align="center">
          This build isn&apos;t configured yet
        </Text>
        <Text color="secondary" align="center">
          Bandpath IELTS can&apos;t reach its backend. This is a build configuration problem, not something you can fix from here — please contact support or try again once a corrected build is published.
        </Text>
        {issue ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing.xs, marginTop: theme.spacing.sm }}>
            <Ionicons name="information-circle-outline" size={16} color={theme.colors.textTertiary} style={{ marginTop: 2 }} />
            <Text variant="caption" color="tertiary">
              {issue}
            </Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

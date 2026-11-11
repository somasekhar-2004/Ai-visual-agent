import * as Application from 'expo-application';
import Constants from 'expo-constants';
import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';

/**
 * TEMPORARY — see lib/debugFlags.ts's SHOW_BUILD_DIAGNOSTICS for why this
 * exists and when to remove it. Every value here is read from a source
 * that cannot be spoofed by this JS bundle itself:
 *   - nativeBuildVersion/nativeApplicationVersion come from the INSTALLED
 *     APK's own Android manifest, read by the native expo-application
 *     module at runtime — not a JS constant this bundle could have baked
 *     in wrong.
 *   - gitCommitHash comes from app.config.js's extra field, itself set
 *     from EAS_BUILD_GIT_COMMIT_HASH — an env var EAS Build's OWN
 *     infrastructure sets during the Build phase, the same value
 *     `eas build:view` already reports as that build's "Commit".
 *   - the OTA line is a static fact about this app's configuration
 *     (no expo-updates dependency, no "updates"/"runtimeVersion" in
 *     app.json), not a runtime check — included so it never has to be
 *     taken on faith.
 */
export function BuildDiagnostics() {
  const theme = useTheme();
  const gitCommitHash = (Constants.expoConfig?.extra?.gitCommitHash as string | undefined) ?? 'unknown';

  return (
    <View
      style={{
        backgroundColor: '#1A1A2E',
        borderRadius: theme.radius.md,
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.sm,
        gap: 2,
      }}
    >
      <Text variant="caption" style={{ color: '#FFD166', fontWeight: '700' }}>
        BUILD DIAGNOSTICS (temporary)
      </Text>
      <Text variant="micro" style={{ color: '#fff' }}>
        Installed native version code: {Application.nativeBuildVersion ?? 'unavailable'} (app version {Application.nativeApplicationVersion ?? 'unavailable'})
      </Text>
      <Text variant="micro" style={{ color: '#fff' }}>
        Running JS built from commit: {gitCommitHash}
      </Text>
      <Text variant="micro" style={{ color: '#fff' }}>
        OTA updates: not possible — this app has no expo-updates dependency or updates config, so nothing can replace this bundle at runtime.
      </Text>
    </View>
  );
}

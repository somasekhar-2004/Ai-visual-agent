import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';

/**
 * Dev-build-only marker so a stale Metro bundle on a physical device is
 * immediately, visually obvious instead of looking identical to updated
 * code — see the "AUTH_UI_V2" auth-flow investigation. Bump the label
 * whenever these screens change again, so an old bundle keeps showing a
 * stale value rather than none at all. Never renders in production
 * (__DEV__ is false in a release/production build).
 */
export function DevAuthVersionBadge() {
  if (!__DEV__) return null;
  return (
    <View style={{ backgroundColor: '#FF00AA', paddingVertical: 4, alignItems: 'center' }}>
      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>AUTH_UI_V2 (dev only)</Text>
    </View>
  );
}

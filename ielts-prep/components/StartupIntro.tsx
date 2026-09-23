import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

const HOLD_MS = 450;
const FADE_IN_MS = 400;
const FADE_OUT_MS = 300;
// Total ≈ 1.15s — within the intended ~0.8–1.5s cold-start intro window.

/**
 * A brief, branded fade/scale-in of the Bandpath B+arrow mark shown once,
 * immediately after the native splash hides and the real first screen has
 * already mounted underneath it (see app/_layout.tsx) — purely a visual
 * overlay, never a gate on navigation or auth/session restoration, which
 * have already finished by the time this renders (RootLayout only reaches
 * this point once `isHydrated` is true). Uses the same background color and
 * artwork as the native splash screen so the two feel like one continuous
 * moment rather than a visible hand-off between two different-looking
 * screens.
 *
 * Plain React Native `Animated` rather than reanimated (already a project
 * dependency, but unnecessary here) — a two-step fade+scale timing sequence
 * has no need for worklets/gesture-driven animation, and the simpler API
 * keeps this intentionally small.
 */
export function StartupIntro({ onFinish }: { onFinish: () => void }) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.85));

  useEffect(() => {
    const sequence = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: FADE_IN_MS, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: FADE_IN_MS, useNativeDriver: true }),
      ]),
      Animated.delay(HOLD_MS),
      Animated.timing(opacity, { toValue: 0, duration: FADE_OUT_MS, useNativeDriver: true }),
    ]);
    sequence.start(({ finished }) => {
      if (finished) onFinish();
    });
    return () => sequence.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, { opacity }]} pointerEvents="none">
      <Animated.Image source={require('../assets/splash-icon.png')} style={[styles.logo, { transform: [{ scale }] }]} resizeMode="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B5FFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  logo: {
    width: 160,
    height: 160,
  },
});

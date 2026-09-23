import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConfigurationErrorScreen } from '@/components/ConfigurationErrorScreen';
import { StartupIntro } from '@/components/StartupIntro';
import { ThemeProvider } from '@/hooks/useTheme';
import { isBackendMisconfigured } from '@/lib/env';
import { useAppStore } from '@/store/useAppStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
  const hydrate = useAppStore((s) => s.hydrate);
  const isHydrated = useAppStore((s) => s.isHydrated);
  const syncEntitlement = useAppStore((s) => s.syncEntitlement);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  // Shown at most once, right after the native splash hides — RootLayout
  // itself only mounts once per app process (navigating between screens
  // re-renders Stack.Screen children, never this component), so a plain
  // useState(true) already guarantees this never reappears on ordinary
  // in-app navigation, with no extra "have we shown this yet" flag needed.
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // A misconfigured build must never reach hydrate() at all — every
    // store/repository/auth call it triggers assumes a real, working
    // Supabase client, which is not true here (see lib/env.ts's
    // isBackendMisconfigured).
    if (isBackendMisconfigured) {
      SplashScreen.hideAsync().catch(() => {});
      return;
    }
    hydrate().finally(() => SplashScreen.hideAsync().catch(() => {}));
  }, [hydrate]);

  useEffect(() => {
    if (isBackendMisconfigured) return;
    // Re-checks the store's entitlement whenever the app returns to the
    // foreground, so a subscription cancelled/expired in the App Store or
    // Play Store settings is reflected without the user reopening the
    // paywall (see syncSubscriptionEntitlement).
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        syncEntitlement().catch(() => {});
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [syncEntitlement]);

  if (isBackendMisconfigured) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <ConfigurationErrorScreen />
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  if (!isHydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            {/* Purely cosmetic — the Stack above has already mounted and
                resolved its real initial route underneath this by the time
                it's visible; hiding it never delays or affects routing,
                auth, or session restoration, all of which are already done
                (isHydrated gates reaching this point at all). */}
            {showIntro ? <StartupIntro onFinish={() => setShowIntro(false)} /> : null}
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

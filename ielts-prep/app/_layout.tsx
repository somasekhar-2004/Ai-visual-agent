import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '@/hooks/useTheme';
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

  useEffect(() => {
    hydrate().finally(() => SplashScreen.hideAsync().catch(() => {}));
  }, [hydrate]);

  useEffect(() => {
    // Re-checks the store's entitlement whenever the app returns to the
    // foreground, so a subscription cancelled/expired in the App Store or
    // Play Store settings is reflected without the user reopening the
    // paywall. No-ops in Demo Mode (see syncSubscriptionEntitlement).
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        syncEntitlement().catch(() => {});
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [syncEntitlement]);

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
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

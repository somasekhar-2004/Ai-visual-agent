import { Redirect } from 'expo-router';

import { useAppStore } from '@/store/useAppStore';

export default function RootIndex() {
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const userId = useAppStore((s) => s.userId);

  if (!onboardingComplete) return <Redirect href="/(onboarding)/welcome" />;
  if (!userId) return <Redirect href="/(auth)/sign-in" />;
  return <Redirect href="/(tabs)" />;
}

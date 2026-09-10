import { useRouter } from 'expo-router';
import React from 'react';

import { ProgressDashboard } from '@/components/dashboard/ProgressDashboard';
import { Screen, ScreenHeader } from '@/components/ui';
import { goalSetupRoute } from '@/lib/goalSetupNav';
import { useAppStore } from '@/store/useAppStore';

// Home (app/(tabs)/index.tsx) now shows this same dashboard directly as its
// main content, so this standalone route is no longer linked from Settings
// — kept only so an existing deep link or bookmark to /analytics still
// resolves to something real instead of a dead route. All the actual
// analytics logic lives in components/dashboard/ProgressDashboard.tsx, the
// single source of truth both places render.
export default function AnalyticsScreen() {
  const router = useRouter();
  const userId = useAppStore((s) => s.userId);

  // See lib/goalSetupNav.ts.
  function goToGoalSetup() {
    router.push(goalSetupRoute(userId));
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Progress & Analytics" showBack />
      <ProgressDashboard onSetGoal={goToGoalSetup} onUpgrade={() => router.push('/paywall')} />
    </Screen>
  );
}

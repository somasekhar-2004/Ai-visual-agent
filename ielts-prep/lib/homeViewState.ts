export type HomeViewState = 'loading' | 'error' | 'ready';

/**
 * The single source of truth for which of Home's three top-level states
 * (app/(tabs)/index.tsx) to render. Kept as a pure function, separate from
 * the component, so it's testable without mounting the whole screen (which
 * pulls in react-query, expo-router, and the shared ProgressDashboard).
 *
 * Home's dashboard (skill bands, accuracy, streak, questions done, premium
 * charts) comes from the user's practice/test history and band scores —
 * none of that depends on having an active study goal, so a missing or
 * failed goal alone must never block the whole screen. `goal` is
 * deliberately NOT a parameter here anymore: the dashboard always renders
 * once the initial fetch has settled, and the one goal-specific card
 * degrades to a setup CTA on its own when `goal` is null (see
 * components/dashboard/ProgressDashboard.tsx) — there is no longer a
 * full-screen "let's set up your goal" state to choose between.
 *
 * "error" is reserved for a genuinely unusable load — homeError set AND no
 * profile at all (e.g. every table came back permission-denied) — a
 * scoped failure (say, only the goal query) still leaves `profile` set by
 * refreshUserData's Promise.allSettled, so it renders "ready" with that one
 * card degraded instead of blanking the whole dashboard.
 */
export function getHomeViewState(state: { dataLoaded: boolean; profile: unknown; homeError: string | null }): HomeViewState {
  if (!state.dataLoaded) return 'loading';
  if (state.homeError && !state.profile) return 'error';
  return 'ready';
}

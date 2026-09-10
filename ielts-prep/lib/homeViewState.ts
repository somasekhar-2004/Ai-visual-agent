export type HomeViewState = 'loading' | 'error' | 'setup' | 'ready';

/**
 * The single source of truth for which of Home's four states
 * (app/(tabs)/index.tsx) to render. Kept as a pure function, separate from
 * the component, so the exact bug it fixes — "still fetching the goal" and
 * "confirmed this user has no goal" rendering identically because both look
 * like `!goal` — can be asserted directly without mounting the whole screen
 * (which pulls in react-query, expo-router, and several child components).
 *
 * `dataLoaded` must be checked before `goal`/`homeError`: until the initial
 * fetch has genuinely settled, `goal` is still sitting at its `null` initial
 * value regardless of whether the account actually has one, so checking
 * `goal` first would misreport "loading" as "needs onboarding" for an
 * existing user every time (a slow network, not just a flash).
 */
export function getHomeViewState(state: { dataLoaded: boolean; goal: unknown; homeError: string | null }): HomeViewState {
  if (!state.dataLoaded) return 'loading';
  if (state.goal) return 'ready';
  if (state.homeError) return 'error';
  return 'setup';
}

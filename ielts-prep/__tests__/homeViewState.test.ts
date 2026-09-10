import { getHomeViewState } from '@/lib/homeViewState';

// This is the exact decision app/(tabs)/index.tsx makes about which of its
// four states to render — tested directly, without mounting the screen
// (which pulls in react-query, expo-router, and several child components),
// so the real-Android regression it fixes ("Home shows the onboarding CTA
// for an existing user because a still-loading goal looks identical to a
// confirmed-absent one") can never silently come back.
describe('getHomeViewState', () => {
  it('reports "loading" whenever the initial fetch has not settled, regardless of goal/error', () => {
    expect(getHomeViewState({ dataLoaded: false, goal: null, homeError: null })).toBe('loading');
    expect(getHomeViewState({ dataLoaded: false, goal: { id: 'g1' }, homeError: null })).toBe('loading');
    expect(getHomeViewState({ dataLoaded: false, goal: null, homeError: 'boom' })).toBe('loading');
  });

  it('reports "ready" once settled with an active goal (self-healed historical goals included — they resolve to a truthy goal the same way)', () => {
    expect(getHomeViewState({ dataLoaded: true, goal: { id: 'g1' }, homeError: null })).toBe('ready');
  });

  it('reports "error" — never "setup" — when settled with no goal but a real query failure', () => {
    expect(getHomeViewState({ dataLoaded: true, goal: null, homeError: 'permission denied for table user_goals' })).toBe('error');
  });

  it('reports "setup" only once settled with genuinely no goal and no error', () => {
    expect(getHomeViewState({ dataLoaded: true, goal: null, homeError: null })).toBe('setup');
  });
});

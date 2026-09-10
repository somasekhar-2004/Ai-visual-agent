import { getHomeViewState } from '@/lib/homeViewState';

// This is the exact decision app/(tabs)/index.tsx makes about which of its
// three top-level states to render — tested directly, without mounting the
// whole screen (which pulls in react-query, expo-router, and the shared
// ProgressDashboard). Home's redesign around ProgressDashboard means `goal`
// is no longer part of this decision at all: a missing or failed goal only
// degrades the one goal-specific card inside the dashboard (see
// components/dashboard/ProgressDashboard.tsx), never the whole screen.
describe('getHomeViewState', () => {
  it('reports "loading" whenever the initial fetch has not settled, regardless of profile/error', () => {
    expect(getHomeViewState({ dataLoaded: false, profile: null, homeError: null })).toBe('loading');
    expect(getHomeViewState({ dataLoaded: false, profile: { id: 'p1' }, homeError: null })).toBe('loading');
    expect(getHomeViewState({ dataLoaded: false, profile: null, homeError: 'boom' })).toBe('loading');
  });

  it('reports "ready" once settled with no error at all', () => {
    expect(getHomeViewState({ dataLoaded: true, profile: { id: 'p1' }, homeError: null })).toBe('ready');
    expect(getHomeViewState({ dataLoaded: true, profile: null, homeError: null })).toBe('ready');
  });

  it('reports "ready" — not "error" — for a scoped failure (e.g. only the goal query) that still left a profile loaded', () => {
    expect(getHomeViewState({ dataLoaded: true, profile: { id: 'p1' }, homeError: 'permission denied for table user_goals' })).toBe('ready');
  });

  it('reports "error" only when settled with a real failure and genuinely nothing usable loaded (no profile either)', () => {
    expect(getHomeViewState({ dataLoaded: true, profile: null, homeError: 'permission denied for table profiles' })).toBe('error');
  });
});

// Regression coverage for the reported production incident: an EAS
// production build shipped without EXPO_PUBLIC_SUPABASE_URL/
// EXPO_PUBLIC_SUPABASE_ANON_KEY set, and the app silently fell back to
// Demo Mode — showing every real user the fabricated demo seed data
// ("Alex", seeded bands, a 3-day streak — see lib/demoStore.ts) instead of
// their own account. lib/env.ts's isDemoMode/isBackendMisconfigured is the
// fix: Demo Mode may only ever activate in a local development build
// (__DEV__ true); a release build (__DEV__ false, which every EAS build
// profile except `development` produces) with missing or invalid Supabase
// config must set isBackendMisconfigured instead, which app/_layout.tsx
// renders a full-screen configuration error for — see
// components/ConfigurationErrorScreen.tsx.
//
// isDemoMode/isBackendMisconfigured are computed once at module load time
// from process.env and the __DEV__ global, so each case here resets the
// module registry and re-requires lib/env fresh with a different
// process.env/__DEV__ combination — the only way to exercise more than one
// combination in a single test file.

const ORIGINAL_ENV = process.env;
const ORIGINAL_DEV = (global as { __DEV__?: boolean }).__DEV__;

function loadEnv(overrides: { url?: string; anonKey?: string; isDev: boolean }) {
  jest.resetModules();
  process.env = {
    ...ORIGINAL_ENV,
    EXPO_PUBLIC_SUPABASE_URL: overrides.url ?? '',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: overrides.anonKey ?? '',
  };
  (global as { __DEV__?: boolean }).__DEV__ = overrides.isDev;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/lib/env') as typeof import('@/lib/env');
}

afterEach(() => {
  process.env = ORIGINAL_ENV;
  (global as { __DEV__?: boolean }).__DEV__ = ORIGINAL_DEV;
  jest.resetModules();
});

describe('release build (production/preview EAS profile — __DEV__ false)', () => {
  it('missing Supabase config never activates Demo Mode — shows the configuration error instead', () => {
    const env = loadEnv({ isDev: false });
    expect(env.isSupabaseConfigured).toBe(false);
    expect(env.isDemoMode).toBe(false);
    expect(env.isBackendMisconfigured).toBe(true);
  });

  it('an invalid Supabase URL (e.g. a Markdown link pasted by mistake) never activates Demo Mode', () => {
    const env = loadEnv({
      url: '[https://kudgtxdwbpfqobteyeqy.supabase.co](https://kudgtxdwbpfqobteyeqy.supabase.co)',
      anonKey: 'some-anon-key',
      isDev: false,
    });
    expect(env.isSupabaseUrlValid).toBe(false);
    expect(env.isSupabaseConfigured).toBe(false);
    expect(env.isDemoMode).toBe(false);
    expect(env.isBackendMisconfigured).toBe(true);
  });

  it('a non-https URL never activates Demo Mode either', () => {
    const env = loadEnv({ url: 'http://example.com', anonKey: 'some-anon-key', isDev: false });
    expect(env.isSupabaseUrlValid).toBe(false);
    expect(env.isDemoMode).toBe(false);
    expect(env.isBackendMisconfigured).toBe(true);
  });

  it('valid config in a release build is simply configured — no Demo Mode, no misconfiguration error', () => {
    const env = loadEnv({ url: 'https://kudgtxdwbpfqobteyeqy.supabase.co', anonKey: 'some-anon-key', isDev: false });
    expect(env.isSupabaseConfigured).toBe(true);
    expect(env.isDemoMode).toBe(false);
    expect(env.isBackendMisconfigured).toBe(false);
  });

  it('getSupabaseConfigIssue() never echoes the actual (secret) env var values', () => {
    const env = loadEnv({ url: '[https://x.supabase.co](https://x.supabase.co)', anonKey: 'super-secret-anon-key-value', isDev: false });
    const issue = env.getSupabaseConfigIssue();
    expect(issue).toEqual(expect.any(String));
    expect(issue).not.toContain('super-secret-anon-key-value');
    expect(issue).not.toContain('[https://x.supabase.co](https://x.supabase.co)');
  });
});

describe('local development build (__DEV__ true)', () => {
  it('missing Supabase config still activates Demo Mode — the genuine local-dev experience', () => {
    const env = loadEnv({ isDev: true });
    expect(env.isSupabaseConfigured).toBe(false);
    expect(env.isDemoMode).toBe(true);
    expect(env.isBackendMisconfigured).toBe(false);
  });

  it('valid config in a dev build uses the real backend, not Demo Mode', () => {
    const env = loadEnv({ url: 'https://kudgtxdwbpfqobteyeqy.supabase.co', anonKey: 'some-anon-key', isDev: true });
    expect(env.isSupabaseConfigured).toBe(true);
    expect(env.isDemoMode).toBe(false);
    expect(env.isBackendMisconfigured).toBe(false);
  });
});

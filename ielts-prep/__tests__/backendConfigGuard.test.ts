// Regression coverage for the reported production incident: an EAS
// production build shipped without EXPO_PUBLIC_SUPABASE_URL/
// EXPO_PUBLIC_SUPABASE_ANON_KEY set, and the app silently fell back to a
// local Demo Mode — showing every real user fabricated seed data ("Alex",
// seeded bands, a 3-day streak) instead of their own account. There is no
// Demo Mode anywhere in runtime code any more (see lib/env.ts): missing or
// invalid Supabase config always sets isBackendMisconfigured, which
// app/_layout.tsx renders a full-screen configuration error for — see
// components/ConfigurationErrorScreen.tsx — in EVERY build type
// (production, preview, AND local development), not just release builds.
//
// isSupabaseConfigured/isBackendMisconfigured are computed once at module
// load time from process.env, so each case here resets the module registry
// and re-requires lib/env fresh with a different process.env — the only way
// to exercise more than one combination in a single test file.

const ORIGINAL_ENV = process.env;

function loadEnv(overrides: { url?: string; anonKey?: string }) {
  jest.resetModules();
  process.env = {
    ...ORIGINAL_ENV,
    EXPO_PUBLIC_SUPABASE_URL: overrides.url ?? '',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: overrides.anonKey ?? '',
  };
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/lib/env') as typeof import('@/lib/env');
}

afterEach(() => {
  process.env = ORIGINAL_ENV;
  jest.resetModules();
});

describe('missing/invalid Supabase config always renders the configuration error — no build type is exempt', () => {
  it('missing config sets isBackendMisconfigured (never a fake-data fallback)', () => {
    const env = loadEnv({});
    expect(env.isSupabaseConfigured).toBe(false);
    expect(env.isBackendMisconfigured).toBe(true);
  });

  it('an invalid Supabase URL (e.g. a Markdown link pasted by mistake) also sets isBackendMisconfigured', () => {
    const env = loadEnv({
      url: '[https://kudgtxdwbpfqobteyeqy.supabase.co](https://kudgtxdwbpfqobteyeqy.supabase.co)',
      anonKey: 'some-anon-key',
    });
    expect(env.isSupabaseUrlValid).toBe(false);
    expect(env.isSupabaseConfigured).toBe(false);
    expect(env.isBackendMisconfigured).toBe(true);
  });

  it('a non-https URL is invalid too', () => {
    const env = loadEnv({ url: 'http://example.com', anonKey: 'some-anon-key' });
    expect(env.isSupabaseUrlValid).toBe(false);
    expect(env.isBackendMisconfigured).toBe(true);
  });

  it('valid config is simply configured — no misconfiguration error', () => {
    const env = loadEnv({ url: 'https://kudgtxdwbpfqobteyeqy.supabase.co', anonKey: 'some-anon-key' });
    expect(env.isSupabaseConfigured).toBe(true);
    expect(env.isBackendMisconfigured).toBe(false);
  });

  it('getSupabaseConfigIssue() never echoes the actual (secret) env var values', () => {
    const env = loadEnv({ url: '[https://x.supabase.co](https://x.supabase.co)', anonKey: 'super-secret-anon-key-value' });
    const issue = env.getSupabaseConfigIssue();
    expect(issue).toEqual(expect.any(String));
    expect(issue).not.toContain('super-secret-anon-key-value');
    expect(issue).not.toContain('[https://x.supabase.co](https://x.supabase.co)');
  });
});

describe('there is no local-development exemption', () => {
  it('missing config sets isBackendMisconfigured even without __DEV__ overridden to false', () => {
    // lib/env.ts's isBackendMisconfigured no longer reads __DEV__ at all —
    // it is exactly !isSupabaseConfigured in every build type.
    const env = loadEnv({});
    expect(env.isBackendMisconfigured).toBe(true);
  });
});

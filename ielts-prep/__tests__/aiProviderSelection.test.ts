// services/ai/index.ts picks its provider once at module load, purely from
// isSupabaseConfigured — it must never look at any AI-provider-specific env
// var (there isn't one on the client anymore). Each case here needs a fresh
// module instance since the provider is selected at import time.
describe('AI provider selection — client never decides which AI vendor to use', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('@/lib/env');
  });

  it('uses the local mock provider in Demo Mode (Supabase not configured) — zero network calls possible', () => {
    jest.resetModules();
    jest.doMock('@/lib/env', () => ({ isSupabaseConfigured: false }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ai = require('@/services/ai');
    expect(ai.getAiProviderName()).toBe('mock');
    expect(ai.isRealAiActive()).toBe(false);
  });

  it('uses the Edge Function provider whenever Supabase is configured, regardless of any AI-specific env var', () => {
    jest.resetModules();
    jest.doMock('@/lib/env', () => ({
      isSupabaseConfigured: true,
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_ANON_KEY: 'test-anon-key',
    }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ai = require('@/services/ai');
    // 'cloud' is EdgeFunctionProvider's initial label before any call
    // resolves which real provider the server used — see
    // services/ai/edgeFunctionProvider.ts.
    expect(ai.getAiProviderName()).toBe('cloud');
    expect(ai.isRealAiActive()).toBe(true);
  });
});

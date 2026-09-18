// services/ai/index.ts always uses the Edge Function provider — there is no
// local mock fallback in runtime code any more (see lib/env.ts's
// isBackendMisconfigured: a missing/invalid Supabase config renders
// ConfigurationErrorScreen before any screen that would call these
// functions is ever reachable, in every build type). It must never look at
// any AI-provider-specific env var (there isn't one on the client anymore).
describe('AI provider selection — client never decides which AI vendor to use', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('always uses the Edge Function provider, regardless of any AI-specific env var', () => {
    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ai = require('@/services/ai');
    // 'cloud' is EdgeFunctionProvider's initial label before any call
    // resolves which real provider the server used — see
    // services/ai/edgeFunctionProvider.ts.
    expect(ai.getAiProviderName()).toBe('cloud');
    expect(ai.isRealAiActive()).toBe(true);
  });
});

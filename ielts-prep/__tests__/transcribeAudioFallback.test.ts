// Regression coverage for the "stuck on Transcribing your answer..." bug.
// Root cause was two-fold:
//  1. EdgeFunctionProvider had no timeout at all — a stalled upload left
//     the promise pending forever with nothing to catch (see
//     edgeFunctionProviderTimeout.test.ts).
//  2. transcribeAudio used the shared withFallback() helper, which quietly
//     substitutes a fabricated mock transcript on ANY real-provider
//     failure — appropriate for the other AI calls (a degraded evaluation
//     is fine), but wrong here: it would let the Speaking flow silently
//     evaluate against fake text instead of surfacing that the real
//     recording was never transcribed. This file proves that specific
//     behaviour was fixed in services/ai/index.ts's transcribeAudio.
describe('transcribeAudio — never silently substitutes a fake transcript for a real failure', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('@/lib/env');
    jest.dontMock('@/services/ai/edgeFunctionProvider');
  });

  it('propagates a real EdgeFunctionProvider failure instead of returning mock.transcribeAudio\'s canned text', async () => {
    jest.resetModules();
    jest.doMock('@/lib/env', () => ({ isSupabaseConfigured: true, SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'test-anon-key' }));
    jest.doMock('@/services/ai/edgeFunctionProvider', () => ({
      EdgeFunctionProvider: jest.fn().mockImplementation(() => ({
        name: 'cloud',
        transcribeAudio: jest.fn().mockRejectedValue(new Error('transcribe-audio took too long to respond. Check your connection and try again.')),
      })),
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ai = require('@/services/ai');
    await expect(ai.transcribeAudio('file:///fake.m4a')).rejects.toThrow(/took too long to respond/);
  });

  it('still uses the local mock in Demo Mode, where there is no real backend to fail', async () => {
    jest.resetModules();
    jest.doMock('@/lib/env', () => ({ isSupabaseConfigured: false }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ai = require('@/services/ai');
    await expect(ai.transcribeAudio('file:///fake.m4a')).resolves.toEqual(expect.any(String));
  });
});

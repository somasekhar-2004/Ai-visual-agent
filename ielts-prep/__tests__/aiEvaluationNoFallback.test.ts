// Regression coverage for the release-blocking bug: a near-silent
// real-device Speaking recording ("Yeah. Gods [no speech detected]
// [no speech detected]") produced a full Overall Band 5.5, strengths, and
// personalized exercises. Root cause: evaluateSpeaking/evaluateWriting used
// the shared withFallback() helper, which silently substitutes
// MockAiProvider's heuristic score on ANY real-provider failure — the exact
// same masking behaviour transcribeAudio was already fixed against (see
// transcribeAudioFallback.test.ts). This file proves evaluateSpeaking and
// evaluateWriting got the same fix: a real-provider failure must propagate
// as a visible error, never resolve with a fabricated { aiSource: 'mock' }
// result.
describe('evaluateSpeaking/evaluateWriting — never silently substitute a fabricated score for a real failure', () => {
  afterEach(() => {
    jest.resetModules();
    jest.dontMock('@/lib/env');
    jest.dontMock('@/services/ai/edgeFunctionProvider');
  });

  it('propagates a real EdgeFunctionProvider evaluateSpeaking failure instead of returning a mock band', async () => {
    jest.resetModules();
    jest.doMock('@/lib/env', () => ({ isSupabaseConfigured: true, SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'test-anon-key' }));
    jest.doMock('@/services/ai/edgeFunctionProvider', () => ({
      EdgeFunctionProvider: jest.fn().mockImplementation(() => ({
        name: 'cloud',
        evaluateSpeaking: jest.fn().mockRejectedValue(new Error('evaluate-speaking took too long to respond. Check your connection and try again.')),
      })),
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ai = require('@/services/ai');
    await expect(
      ai.evaluateSpeaking({ part: 'part1', topicCategory: 'Home', transcript: 'A real extended answer.', questionCount: 1, totalDurationSeconds: 30 })
    ).rejects.toThrow(/took too long to respond/);
  });

  it('propagates a real EdgeFunctionProvider evaluateWriting failure instead of returning a mock band', async () => {
    jest.resetModules();
    jest.doMock('@/lib/env', () => ({ isSupabaseConfigured: true, SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'test-anon-key' }));
    jest.doMock('@/services/ai/edgeFunctionProvider', () => ({
      EdgeFunctionProvider: jest.fn().mockImplementation(() => ({
        name: 'cloud',
        evaluateWriting: jest.fn().mockRejectedValue(new Error('evaluate-writing took too long to respond. Check your connection and try again.')),
      })),
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ai = require('@/services/ai');
    await expect(
      ai.evaluateWriting({ taskType: 'task2', promptText: 'Discuss.', essayText: 'A real extended essay response.', wordCount: 250, minWords: 250 })
    ).rejects.toThrow(/took too long to respond/);
  });

  it('still uses the local heuristic mock in Demo Mode, where there is no real backend to fail', async () => {
    jest.resetModules();
    jest.doMock('@/lib/env', () => ({ isSupabaseConfigured: false }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ai = require('@/services/ai');
    const result = await ai.evaluateSpeaking({ part: 'part1', topicCategory: 'Home', transcript: 'A real extended answer about my home.', questionCount: 1, totalDurationSeconds: 30 });
    expect(result.aiSource).toBe('mock');
  });
});

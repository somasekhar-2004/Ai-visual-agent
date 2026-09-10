// Regression coverage for the other half of the same incident covered by
// __tests__/coachContext.test.ts: even with a correct context, chatWithCoach
// used to silently substitute MockAiProvider's heuristic reply whenever the
// real Edge Function call failed for any reason (network error, an
// unconfigured server-side AI key, a bad response) — see services/ai/
// index.ts's old `withFallback`. That mock reply reads as an entirely
// normal, plausible coaching response ("Hi {name} — to move toward Band
// {target}..."), which is exactly what makes silently swapping it in more
// dangerous than an obviously-fake placeholder: a user has no way to tell
// it apart from a real answer. This is fixed the same way
// evaluateWriting/evaluateSpeaking/transcribeAudio already were: a real
// mode provider failure must now throw, not fall back.
import { chatWithCoach, isRealAiActive, suggestStudyPlanFocus } from '@/services/ai';

jest.mock('@/lib/env', () => ({
  ...jest.requireActual('@/lib/env'),
  isSupabaseConfigured: true,
}));

jest.mock('@/services/ai/edgeFunctionProvider', () => ({
  EdgeFunctionProvider: jest.fn().mockImplementation(() => ({
    name: 'cloud',
    chat: jest.fn().mockRejectedValue(new Error('ai-coach Edge Function call failed: upstream_error')),
    evaluateWriting: jest.fn(),
    evaluateSpeaking: jest.fn(),
    transcribeAudio: jest.fn(),
    suggestStudyPlanFocus: jest.fn().mockRejectedValue(new Error('study-plan-suggestion Edge Function call failed: upstream_error')),
  })),
}));

const BASE_CONTEXT = {
  fullName: 'Priya',
  ieltsType: 'academic' as const,
  targetBand: 7.5,
  currentBand: 6,
  examDate: null,
  weakestSkill: 'writing' as const,
  bandBySkill: { writing: 6 },
  streakDays: 2,
  dailyStudyMinutes: 30,
};

describe('chatWithCoach — real-mode provider failure', () => {
  it('rejects instead of silently returning a mock coach reply', async () => {
    expect(isRealAiActive()).toBe(true); // confirms this test really is exercising the "real mode" path, not demo mode

    await expect(chatWithCoach([{ role: 'user', content: 'How can I reach my target band?' }], BASE_CONTEXT)).rejects.toThrow(/upstream_error/);
  });
});

describe('suggestStudyPlanFocus — real-mode provider failure', () => {
  it('rejects instead of silently returning a mock study-plan note', async () => {
    await expect(suggestStudyPlanFocus({ context: BASE_CONTEXT })).rejects.toThrow(/upstream_error/);
  });
});

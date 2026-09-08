import { FunctionsHttpError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { EdgeFunctionProvider } from '@/services/ai/edgeFunctionProvider';
import { AiRequestError } from '@/services/ai/httpClient';

jest.mock('@/lib/supabase', () => ({
  supabase: { functions: { invoke: jest.fn() } },
}));

const mockInvoke = (supabase as unknown as { functions: { invoke: jest.Mock } }).functions.invoke;

const VALID_WRITING_RESULT = {
  overallBand: 6,
  taskAchievement: 6,
  coherenceCohesion: 6,
  lexicalResource: 6,
  grammaticalRange: 6,
  strengths: ['Clear structure'],
  weaknesses: ['Limited vocabulary'],
  suggestions: ['Use more varied linking words'],
  improvedExample: 'A better sentence.',
  nextBandAction: 'Practice complex sentences.',
};

describe('EdgeFunctionProvider — never touches a real AI provider directly', () => {
  afterEach(() => jest.clearAllMocks());

  it('calls the evaluate-writing Edge Function (never openai.com/anthropic.com) and returns the validated result', async () => {
    mockInvoke.mockResolvedValue({ data: { result: VALID_WRITING_RESULT, provider: 'openai' }, error: null });

    const provider = new EdgeFunctionProvider();
    const result = await provider.evaluateWriting({ taskType: 'task2', promptText: 'Discuss.', essayText: 'My essay.', wordCount: 2, minWords: 250 });

    expect(mockInvoke).toHaveBeenCalledTimes(1);
    const [functionName, options] = mockInvoke.mock.calls[0];
    expect(functionName).toBe('evaluate-writing');
    expect(options.body).toEqual({ taskType: 'task2', promptText: 'Discuss.', essayText: 'My essay.', wordCount: 2, minWords: 250 });
    expect(result.overallBand).toBe(6);
  });

  it('updates its name to the provider the server actually used, not a guess', async () => {
    mockInvoke.mockResolvedValue({ data: { result: VALID_WRITING_RESULT, provider: 'anthropic' }, error: null });
    const provider = new EdgeFunctionProvider();
    expect(provider.name).toBe('cloud');
    await provider.evaluateWriting({ taskType: 'task2', promptText: 'p', essayText: 'e', wordCount: 1, minWords: 1 });
    expect(provider.name).toBe('anthropic');
  });

  it('throws if the Edge Function returns output that fails schema validation, rather than trusting it', async () => {
    mockInvoke.mockResolvedValue({ data: { result: { overallBand: 'not a number' }, provider: 'openai' }, error: null });
    const provider = new EdgeFunctionProvider();
    await expect(provider.evaluateWriting({ taskType: 'task2', promptText: 'p', essayText: 'e', wordCount: 1, minWords: 1 })).rejects.toThrow();
  });

  it('classifies a rate-limited (429) response as a retryable AiRequestError with the server message', async () => {
    const fakeResponse = { status: 429, json: async () => ({ error: { code: 'rate_limited', message: 'Daily limit reached (1/1). Try again tomorrow.' } }) };
    mockInvoke.mockResolvedValue({ data: null, error: new FunctionsHttpError(fakeResponse) });

    const provider = new EdgeFunctionProvider();
    await expect(provider.evaluateSpeaking({ part: 'part1', topicCategory: 'Home', transcript: 't', questionCount: 1, totalDurationSeconds: 30 })).rejects.toMatchObject({
      message: 'Daily limit reached (1/1). Try again tomorrow.',
      status: 429,
      retryable: true,
    });
  });

  it('classifies an unauthenticated (401) response as non-retryable', async () => {
    const fakeResponse = { status: 401, json: async () => ({ error: { code: 'unauthorized', message: 'Invalid or expired session — please sign in again.' } }) };
    mockInvoke.mockResolvedValue({ data: null, error: new FunctionsHttpError(fakeResponse) });

    const provider = new EdgeFunctionProvider();
    const err = await provider.chat([{ role: 'user', content: 'hi' }], {
      fullName: null,
      ieltsType: 'academic',
      targetBand: 7,
      currentBand: 6,
      examDate: null,
      weakestSkill: null,
      bandBySkill: {},
      streakDays: 0,
      dailyStudyMinutes: 30,
    }).catch((e) => e);

    expect(err).toBeInstanceOf(AiRequestError);
    expect((err as AiRequestError).status).toBe(401);
    expect((err as AiRequestError).retryable).toBe(false);
  });

  it('calls the study-plan-suggestion Edge Function and returns the validated result', async () => {
    mockInvoke.mockResolvedValue({
      data: { result: { focusSummary: 'Focus on Reading today.', motivationalNote: 'Keep it up.' }, provider: 'openai' },
      error: null,
    });
    const provider = new EdgeFunctionProvider();
    const result = await provider.suggestStudyPlanFocus({
      context: {
        fullName: 'Alex',
        ieltsType: 'academic',
        targetBand: 7,
        currentBand: 6,
        examDate: null,
        weakestSkill: 'reading',
        bandBySkill: { reading: 5.5 },
        streakDays: 2,
        dailyStudyMinutes: 30,
      },
    });
    expect(mockInvoke).toHaveBeenCalledWith('study-plan-suggestion', expect.objectContaining({ body: expect.any(Object) }));
    expect(result.focusSummary).toBe('Focus on Reading today.');
  });

  it('throws when Supabase is not configured, rather than making any network call', async () => {
    jest.resetModules();
    jest.doMock('@/lib/supabase', () => ({ supabase: null }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { EdgeFunctionProvider: UnconfiguredProvider } = require('@/services/ai/edgeFunctionProvider');
    const provider = new UnconfiguredProvider();
    await expect(
      provider.evaluateWriting({ taskType: 'task2', promptText: 'p', essayText: 'e', wordCount: 1, minWords: 1 })
    ).rejects.toThrow('Supabase is not configured.');
    jest.dontMock('@/lib/supabase');
  });
});

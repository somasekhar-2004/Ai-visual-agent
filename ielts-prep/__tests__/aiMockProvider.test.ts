import { MockAiProvider } from '@/services/ai/mockProvider';
import { SpeakingEvaluationSchema, StudyPlanSuggestionSchema, WritingEvaluationSchema } from '@/services/ai/schemas';
import type { CoachContext } from '@/services/ai/types';

const provider = new MockAiProvider();

function baseContext(overrides: Partial<CoachContext> = {}): CoachContext {
  return {
    fullName: 'Alex',
    ieltsType: 'academic',
    targetBand: 7.5,
    currentBand: 6,
    examDate: null,
    weakestSkill: 'reading',
    bandBySkill: { reading: 5.5 },
    streakDays: 0,
    dailyStudyMinutes: 45,
    ...overrides,
  };
}

describe('MockAiProvider.evaluateWriting', () => {
  it('produces schema-valid output for a short, weak essay', async () => {
    const result = await provider.evaluateWriting({
      taskType: 'task2',
      promptText: 'Discuss both views.',
      essayText: 'I think this. It is good. The end.',
      wordCount: 8,
      minWords: 250,
    });
    expect(WritingEvaluationSchema.safeParse(result).success).toBe(true);
    expect(result.weaknesses.some((w) => w.toLowerCase().includes('word'))).toBe(true);
  });

  it('scores a longer, well-structured essay higher than a short weak one', async () => {
    const weak = await provider.evaluateWriting({
      taskType: 'task2',
      promptText: 'Discuss both views.',
      essayText: 'I think this. It is good.',
      wordCount: 6,
      minWords: 250,
    });
    const strongEssay =
      'Although some people believe that technology has weakened personal relationships, others argue that it has, in fact, strengthened them. '.repeat(
        10
      ) + ' In conclusion, overall, a balanced perspective is warranted because both effects clearly coexist.';
    const strong = await provider.evaluateWriting({
      taskType: 'task2',
      promptText: 'Discuss both views.',
      essayText: strongEssay,
      wordCount: 250,
      minWords: 250,
    });
    expect(strong.overallBand).toBeGreaterThan(weak.overallBand);
  });
});

describe('MockAiProvider.evaluateSpeaking', () => {
  it('produces schema-valid output', async () => {
    const result = await provider.evaluateSpeaking({
      part: 'part1',
      topicCategory: 'Hometown',
      transcript: 'Well, um, I think my hometown is, like, quite nice, you know.',
      questionCount: 1,
      totalDurationSeconds: 20,
    });
    expect(SpeakingEvaluationSchema.safeParse(result).success).toBe(true);
    expect(result.fillerWordCount).toBeGreaterThan(0);
  });
});

describe('MockAiProvider.chat', () => {
  it('returns a non-empty, context-aware response', async () => {
    const reply = await provider.chat([{ role: 'user', content: 'Give me today\'s plan' }], {
      fullName: 'Alex',
      ieltsType: 'academic',
      targetBand: 7.5,
      currentBand: 6,
      examDate: null,
      weakestSkill: 'writing',
      bandBySkill: { writing: 5.5 },
      streakDays: 3,
      dailyStudyMinutes: 45,
    });
    expect(reply.length).toBeGreaterThan(0);
    expect(reply.toLowerCase()).toContain('writing');
  });
});

describe('MockAiProvider.suggestStudyPlanFocus', () => {
  it('produces schema-valid output', async () => {
    const result = await provider.suggestStudyPlanFocus({ context: baseContext() });
    expect(StudyPlanSuggestionSchema.safeParse(result).success).toBe(true);
  });

  it('leads with the weak grammar topic when one is known, even over a weak skill', async () => {
    const result = await provider.suggestStudyPlanFocus({
      context: baseContext(),
      weakGrammarTopic: 'subject-verb agreement',
    });
    expect(result.focusSummary.toLowerCase()).toContain('subject-verb agreement');
  });

  it('names the specific weak question type when known', async () => {
    const result = await provider.suggestStudyPlanFocus({
      context: baseContext({ weakestSkill: 'reading' }),
      weakQuestionTypeBySkill: { reading: 'matching_headings' },
    });
    expect(result.focusSummary.toLowerCase()).toContain('matching headings');
  });

  it('falls back to naming the weakest skill when no finer-grained signal is known', async () => {
    const result = await provider.suggestStudyPlanFocus({ context: baseContext({ weakestSkill: 'speaking' }) });
    expect(result.focusSummary.toLowerCase()).toContain('speaking');
  });

  it('mentions the streak when it is meaningful (3+ days)', async () => {
    const result = await provider.suggestStudyPlanFocus({ context: baseContext({ streakDays: 5 }) });
    expect(result.motivationalNote).toContain('5-day streak');
  });
});

import { MockAiProvider } from '@/services/ai/mockProvider';
import { SpeakingEvaluationSchema, WritingEvaluationSchema } from '@/services/ai/schemas';

const provider = new MockAiProvider();

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

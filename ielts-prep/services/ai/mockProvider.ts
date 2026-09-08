import {
  clampToBand,
  countPhraseMatches,
  countSentences,
  countWords,
  FILLER_WORDS,
  findLongSentences,
  findRepeatedWords,
  LINKING_WORDS,
  SUBORDINATING_CONJUNCTIONS,
  uniqueWordRatio,
} from '@/lib/textAnalysis';

import type { SpeakingEvaluation, StudyPlanSuggestion, WritingEvaluation } from './schemas';
import type { AiProvider, ChatMessage, CoachContext, SpeakingEvalInput, StudyPlanSuggestionInput, WritingEvalInput } from './types';

const SKILL_LABEL: Record<string, string> = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' };

/**
 * Deterministic, heuristic-based "AI" that requires no API key. It analyses
 * real signals in the user's text (length, sentence variety, linking devices,
 * filler words) to produce plausible, genuinely differentiated feedback, so
 * the whole app is usable and demoable with zero configuration.
 */
export class MockAiProvider implements AiProvider {
  readonly name = 'mock';

  async evaluateWriting(input: WritingEvalInput): Promise<WritingEvaluation> {
    const { essayText, wordCount, minWords, taskType } = input;
    const sentenceCount = Math.max(1, countSentences(essayText));
    const avgSentenceLength = wordCount / sentenceCount;
    const linkingHits = countPhraseMatches(essayText, LINKING_WORDS);
    const vocabRichness = uniqueWordRatio(essayText);
    const hasConclusion = /\b(in conclusion|to conclude|overall,)\b/i.test(essayText);
    const lengthRatio = wordCount / minWords;

    const taskAchievement = clampToBand(
      5 + (lengthRatio >= 1 ? 1.5 : (lengthRatio - 0.6) * 2) + (hasConclusion ? 0.5 : 0)
    );
    const coherenceCohesion = clampToBand(5 + Math.min(linkingHits, 6) * 0.25 + (hasConclusion ? 0.25 : 0));
    const lexicalResource = clampToBand(4.5 + vocabRichness * 6);
    const grammaticalRange = clampToBand(
      4.5 + Math.min(Math.max(avgSentenceLength - 10, 0) / 6, 2) + Math.min(linkingHits, 4) * 0.15
    );

    const overallBand =
      Math.round(((taskAchievement + coherenceCohesion + lexicalResource + grammaticalRange) / 4) * 2) / 2;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    if (lengthRatio >= 1) strengths.push(`You met the minimum word count (${wordCount}/${minWords} words).`);
    else {
      weaknesses.push(`Your response is under the ${minWords}-word minimum (${wordCount} words) — this caps your Task Achievement score.`);
      suggestions.push(`Aim for at least ${minWords} words; practise expanding body paragraphs with a specific example per point.`);
    }

    if (linkingHits >= 4) strengths.push('You used a good range of linking devices to connect ideas.');
    else {
      weaknesses.push('Your paragraphs would benefit from more varied linking devices (however, therefore, in addition).');
      suggestions.push('Add one clear linking word per paragraph transition, varying your choice rather than repeating the same one.');
    }

    if (vocabRichness > 0.55) strengths.push('You used a varied vocabulary rather than repeating the same words.');
    else {
      weaknesses.push('Some key words are repeated often — using synonyms would raise your Lexical Resource score.');
      suggestions.push('Before submitting, scan for any word used 3+ times and replace at least one instance with a synonym.');
    }

    if (avgSentenceLength >= 12 && avgSentenceLength <= 25) strengths.push('Your sentence length shows a natural mix of simple and complex structures.');
    else if (avgSentenceLength < 12) {
      weaknesses.push('Many sentences are short and simple, which limits your Grammatical Range score.');
      suggestions.push('Combine some short sentences using "although", "because", or "which" to show more complex structures.');
    } else {
      weaknesses.push('Some sentences are very long, which risks losing clarity or introducing grammar errors.');
      suggestions.push('Break up your longest sentences — aim for an average of 15-20 words per sentence.');
    }

    if (!hasConclusion && taskType === 'task2') {
      weaknesses.push('No clear concluding statement was found.');
      suggestions.push('End with a short conclusion paragraph starting with "In conclusion" or "Overall" that restates your position.');
    }

    const improvedExample =
      taskType === 'task2'
        ? 'While some argue that X brings clear benefits, others contend that its drawbacks outweigh these advantages. This essay will examine both perspectives before presenting a personal view, arguing that a balanced approach is ultimately the most effective solution.'
        : taskType === 'task1_academic'
          ? 'Overall, the data indicate a clear upward trend across most categories over the period shown, with one notable exception that plateaued in the final years.'
          : 'I am writing to bring to your attention an issue that has arisen recently and to request your assistance in resolving it as soon as possible.';

    const repeated = findRepeatedWords(essayText);
    const repeatedWords = repeated.map((r) => r.word);
    const sentenceIssues = findLongSentences(essayText).map((sentence) => ({
      original: sentence,
      issue: 'This sentence is 25+ words long, which raises the risk of a run-on structure or a grammar slip getting lost in the length.',
      suggestion: 'Consider splitting it into two sentences, or cutting one clause and starting a new sentence with a linking word.',
    }));

    // The single highest-leverage fix — picked from the lowest criterion so
    // the student always has one clear next action rather than a flat list.
    const criteria: { key: string; value: number; action: string }[] = [
      { key: 'taskAchievement', value: taskAchievement, action: lengthRatio < 1 ? `Write at least ${minWords} words — right now you are ${wordCount < minWords ? 'under' : 'over'} the minimum, which caps this score regardless of quality.` : 'Make sure every part of the task prompt is directly addressed, not just the general topic.' },
      { key: 'coherenceCohesion', value: coherenceCohesion, action: 'Add one clear linking word at the start of each new paragraph, and vary which ones you use.' },
      { key: 'lexicalResource', value: lexicalResource, action: repeatedWords.length ? `Replace repeated uses of "${repeatedWords[0]}" with a synonym in at least two places.` : 'Push for more precise, topic-specific vocabulary instead of general words.' },
      { key: 'grammaticalRange', value: grammaticalRange, action: sentenceIssues.length ? 'Break up your longest sentence(s) — length is outrunning control of the grammar.' : 'Mix in a conditional or a relative clause to show a wider range of structures.' },
    ];
    const nextBandAction = criteria.sort((a, b) => a.value - b.value)[0].action;

    return {
      overallBand,
      taskAchievement,
      coherenceCohesion,
      lexicalResource,
      grammaticalRange,
      strengths: strengths.length ? strengths : ['Your response engages with the task and maintains a consistent position throughout.'],
      weaknesses: weaknesses.length ? weaknesses : ['Minor inconsistencies in tone were noted — review word choice for full formality.'],
      suggestions: suggestions.length ? suggestions : ['Read your essay aloud once before submitting to catch awkward phrasing.'],
      improvedExample,
      sentenceIssues,
      repeatedWords,
      nextBandAction,
    };
  }

  async evaluateSpeaking(input: SpeakingEvalInput): Promise<SpeakingEvaluation> {
    const { transcript, totalDurationSeconds } = input;
    const wordCount = countWords(transcript);
    const minutes = Math.max(totalDurationSeconds / 60, 0.2);
    const wpm = wordCount / minutes;
    const fillerWordCount = countPhraseMatches(transcript, FILLER_WORDS);
    const fillerRatio = wordCount > 0 ? fillerWordCount / wordCount : 0;
    const vocabRichness = uniqueWordRatio(transcript);
    const complexClauseHits = countPhraseMatches(transcript, SUBORDINATING_CONJUNCTIONS);

    const fluencyCoherence = clampToBand(4.5 + Math.min(Math.max(wpm - 80, 0) / 20, 2) - fillerRatio * 6);
    const lexicalResource = clampToBand(4.5 + vocabRichness * 6);
    const grammaticalRange = clampToBand(4.5 + Math.min(complexClauseHits, 5) * 0.35);
    // Pronunciation cannot be assessed from a text transcript alone; this is a
    // rough proxy based on fluency signals and is clearly labelled as an
    // estimate everywhere it is shown in the UI.
    const pronunciation = clampToBand((fluencyCoherence + grammaticalRange) / 2);

    const overallBand =
      Math.round(((fluencyCoherence + lexicalResource + grammaticalRange + pronunciation) / 4) * 2) / 2;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestedExercises: string[] = [];

    if (fillerRatio < 0.03) strengths.push('You spoke with very few filler words, sounding confident and fluent.');
    else {
      weaknesses.push(`You used filler words (um, like, you know) fairly often — around ${fillerWordCount} times.`);
      suggestedExercises.push('Record yourself for one minute on a random topic and count filler words; repeat daily aiming to reduce the count.');
    }

    if (wpm >= 110 && wpm <= 160) strengths.push('Your speaking pace was natural and easy to follow.');
    else if (wpm < 110) {
      weaknesses.push('Your speaking pace was slower than typical natural speech, which can suggest hesitation.');
      suggestedExercises.push('Practise "think aloud" drills: describe your surroundings for 60 seconds without stopping, even if imperfect.');
    } else {
      weaknesses.push('You spoke very quickly, which can reduce clarity — pace yourself for better articulation.');
    }

    if (complexClauseHits >= 2) strengths.push('You used complex sentence structures (although, because, if) naturally.');
    else {
      weaknesses.push('Most sentences were short and simple, limiting your Grammatical Range score.');
      suggestedExercises.push('Practise extending answers with "because" or "which means that" to add a reason or consequence.');
    }

    if (vocabRichness > 0.5) strengths.push('You used a good range of vocabulary rather than repeating the same words.');

    const repeatedWords = findRepeatedWords(transcript, 3).map((r) => r.word);

    // A very low word count for the time given usually means answers were
    // too short to demonstrate range — flag it distinctly rather than
    // folding it into a generic weakness.
    const developmentNote =
      wordCount > 0 && wpm < 70
        ? 'Your answers were quite short for the time given — examiners cannot credit fluency, vocabulary, or grammar range they never hear. Aim to extend each answer with a reason, an example, or a brief contrast.'
        : null;

    const criteria: { value: number; action: string }[] = [
      { value: fluencyCoherence, action: fillerRatio >= 0.03 ? `Cut filler words — you used about ${fillerWordCount}. Pause silently instead of saying "um"/"like" while you think.` : 'Practise linking ideas with "which means", "so", or "because" instead of pausing between sentences.' },
      { value: lexicalResource, action: repeatedWords.length ? `You repeated "${repeatedWords[0]}" several times — prepare 2-3 synonyms for topics you expect to discuss.` : 'Push for more precise, topic-specific vocabulary in your answers.' },
      { value: grammaticalRange, action: complexClauseHits < 2 ? 'Extend answers with "because", "although", or "which" to show more complex grammar, not just simple sentences.' : 'Try a conditional ("If I had...") to add structural variety.' },
      { value: pronunciation, action: 'Record yourself and listen for words you stress incorrectly or run together — pronunciation is rated on clarity, not accent.' },
    ];
    const nextBandAction = developmentNote ?? criteria.sort((a, b) => a.value - b.value)[0].action;

    return {
      overallBand,
      fluencyCoherence,
      lexicalResource,
      grammaticalRange,
      pronunciation,
      fillerWordCount,
      strengths: strengths.length ? strengths : ['You engaged fully with every question asked.'],
      weaknesses: weaknesses.length ? weaknesses : ['No major issues detected — focus on adding more specific detail to extend your answers.'],
      suggestedExercises: suggestedExercises.length
        ? suggestedExercises
        : ['Practise Part 3 style follow-up questions to build comfort with more abstract, opinion-based answers.'],
      repeatedWords,
      developmentNote,
      nextBandAction,
    };
  }

  async chat(messages: ChatMessage[], context: CoachContext): Promise<string> {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';
    const q = lastUser.toLowerCase();
    const name = context.fullName ?? 'there';
    const weak = context.weakestSkill ?? 'writing';
    const weakBand = context.bandBySkill[weak];

    if (/\bband\s*7|\breach\s+band|\bhow.*(improve|get to)\b.*band/.test(q)) {
      return `Hi ${name} — to move from your current overall estimate toward Band ${context.targetBand}, the fastest gains usually come from your weakest skill first. Right now that's ${weak}${weakBand ? ` (currently around Band ${weakBand})` : ''}. I'd suggest: 1) 20 minutes of focused ${weak} practice daily rather than spreading thin across all four skills, 2) one full timed ${weak} task every few days with feedback, and 3) reviewing your mistakes by type rather than just redoing similar questions. Want me to build today's plan around that?`;
    }
    if (/why.*(low|score|band).*(reading|listening|writing|speaking)/.test(q) || /reading score low/.test(q)) {
      return `A low Reading score usually comes from one of three places: running out of time, misreading True/False/Not Given traps, or vocabulary gaps that slow you down. Try this diagnostic: next time you practise, note whether wrong answers came from time pressure or genuine misunderstanding — that tells us which to fix first. Given your weakest skill is currently ${weak}, I'd prioritise short, timed passage drills before full-length tests.`;
    }
    if (/today'?s?\s+plan|what should i (study|do) today/.test(q)) {
      return `Based on your goal (Band ${context.targetBand}, ${context.dailyStudyMinutes} minutes/day) and your weakest skill (${weak}), here's a focused plan: spend about 40% of your time on ${weak}, and split the rest across the other three skills. Check the Home tab — I've generated today's specific plan with exact exercises there.`;
    }
    if (/true\s*\/?\s*false\s*\/?\s*not given|tfng/.test(q)) {
      return `True/False/Not Given tests whether a statement agrees with the passage (TRUE), contradicts it (FALSE), or simply isn't mentioned precisely enough to judge either way (NOT GIVEN). The most common mistake is treating "not given" as "false" — remember, Not Given just means the passage is silent on that exact claim. Want a short practice set on this?`;
    }
    if (/correct this sentence|fix this sentence|grammar check/.test(q)) {
      return `Paste the sentence you'd like checked and I'll point out specific grammar issues and suggest a corrected version with a brief explanation of the rule involved.`;
    }
    if (/speaking topic|give me a topic|part\s*2\s*topic/.test(q)) {
      const topics = ['a person who inspired you', 'a place you would like to visit', 'a piece of technology you find useful', 'a memorable celebration you attended'];
      const pick = topics[Math.floor(Math.random() * topics.length)];
      return `Here's a Part 2 cue card topic to practise: "Describe ${pick}." Speak for two minutes, covering who/what/where, when, and why it matters to you. Record yourself and check the Speaking tab to get AI feedback on your answer.`;
    }
    if (/task\s*2|essay/.test(q)) {
      return `For Task 2, the highest-impact fix is usually structure: a clear thesis in your introduction, one main idea per body paragraph with a specific example, and a conclusion that restates (not repeats) your position. Since your weakest skill is ${weak}, I'd also focus on ${weak === 'writing' ? 'expanding vocabulary range and reducing repeated words' : 'making sure your written English matches the fluency you already have in speaking'}.`;
    }

    return `That's a great question, ${name}. Based on your profile — targeting Band ${context.targetBand}${context.examDate ? ` with your test on ${context.examDate}` : ''} and currently strongest outside of ${weak} — I'd suggest focusing today's session there. Ask me things like "give me today's plan", "explain True False Not Given", or "give me a speaking topic" and I'll tailor the answer to your progress.`;
  }

  async transcribeAudio(_audioUri: string): Promise<string> {
    return '[Demo transcript — configure a real AI provider in .env to transcribe actual speech. This simulated transcript lets you preview the full Speaking flow: "I think this topic is quite interesting because it relates to my own experience. For example, when I was younger, I often thought about this, and it has shaped how I see things today."]';
  }

  async suggestStudyPlanFocus(input: StudyPlanSuggestionInput): Promise<StudyPlanSuggestion> {
    const { context, weakQuestionTypeBySkill, weakGrammarTopic } = input;
    const weakest = context.weakestSkill;
    const weakestLabel = weakest ? SKILL_LABEL[weakest] : null;
    const weakType = weakest === 'reading' || weakest === 'listening' ? weakQuestionTypeBySkill?.[weakest] : undefined;

    let focusSummary: string;
    if (weakGrammarTopic) {
      focusSummary = `Grammar accuracy on ${weakGrammarTopic} has come up as your most consistent recent mistake — today's short review should compound quickly.`;
    } else if (weakType) {
      focusSummary = `${weakestLabel} — specifically ${weakType.replace(/_/g, ' ')} questions — is where you're losing the most marks right now.`;
    } else if (weakestLabel) {
      const band = context.bandBySkill[weakest as keyof typeof context.bandBySkill];
      focusSummary = `${weakestLabel} is your lowest-scoring skill${band ? ` (around Band ${band})` : ''}, so today's plan leans into it.`;
    } else {
      focusSummary = 'No single weak area stands out yet — today keeps practice balanced across all four skills.';
    }

    const gap = context.targetBand - (context.currentBand ?? context.targetBand);
    let motivationalNote: string;
    if (context.streakDays >= 3) {
      motivationalNote = `${context.streakDays}-day streak — consistency like this is what actually moves a band score.`;
    } else if (gap > 0) {
      motivationalNote = `You're roughly ${gap.toFixed(1)} band${gap === 1 ? '' : 's'} from your target — today's session is a real step toward it.`;
    } else {
      motivationalNote = `You're at or above your target band — keep sessions up to hold that level under exam pressure.`;
    }

    return { focusSummary, motivationalNote };
  }
}

// Ported from services/ai/prompts.ts (the mobile app's copy, which is now
// unused for real-provider calls — see services/ai/index.ts). Keep the two
// in sync by hand if either changes; this is the copy that actually runs
// against a real model now.
import type { CoachContext, SpeakingEvalRequest, WritingEvalRequest } from './schemas.ts';

const WRITING_JSON_SHAPE = `{
  "overallBand": number (1-9, in 0.5 steps),
  "taskAchievement": number (1-9),
  "coherenceCohesion": number (1-9),
  "lexicalResource": number (1-9),
  "grammaticalRange": number (1-9),
  "strengths": string[] (2-4 specific, concrete strengths),
  "weaknesses": string[] (2-4 specific, concrete weaknesses),
  "suggestions": string[] (2-4 actionable next steps),
  "improvedExample": string (one improved sentence or short passage from the essay),
  "sentenceIssues": [{ "original": string (a real sentence quoted from the response), "issue": string (the specific grammar/clarity problem), "suggestion": string (how to fix it) }] (0-4 items — omit if the essay has no notable sentence-level issues),
  "repeatedWords": string[] (content words the candidate overused; empty array if none),
  "nextBandAction": string (the single highest-leverage change to make next attempt)
}`;

export function buildWritingEvalPrompt(input: WritingEvalRequest): string {
  return `You are an experienced IELTS Writing examiner. Assess the following ${input.taskType} response strictly against the official IELTS Writing band descriptors (Task Achievement/Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy).

Task prompt:
"""
${input.promptText}
"""

Candidate's response (${input.wordCount} words, minimum required: ${input.minWords}):
"""
${input.essayText}
"""

Respond with ONLY a single valid JSON object matching exactly this shape (no markdown fences, no extra text):
${WRITING_JSON_SHAPE}

Be specific and reference actual phrases or issues from the response. This is a practice estimate, not an official score, but should be realistic and calibrated to genuine IELTS standards.`;
}

const SPEAKING_JSON_SHAPE = `{
  "overallBand": number (1-9, in 0.5 steps),
  "fluencyCoherence": number (1-9),
  "lexicalResource": number (1-9),
  "grammaticalRange": number (1-9),
  "pronunciation": number (1-9, estimated from the transcript's structure since audio is not directly analysed),
  "fillerWordCount": number,
  "strengths": string[] (2-4 items),
  "weaknesses": string[] (2-4 items),
  "suggestedExercises": string[] (2-4 concrete practice exercises),
  "repeatedWords": string[] (content words the candidate overused; empty array if none),
  "developmentNote": string | null (set only if answers were too short/underdeveloped to properly judge; otherwise null),
  "nextBandAction": string (the single highest-leverage change to make next attempt)
}`;

export function buildSpeakingEvalPrompt(input: SpeakingEvalRequest): string {
  return `You are an experienced IELTS Speaking examiner. Assess this ${input.part} response on the topic "${input.topicCategory}" against the official IELTS Speaking band descriptors (Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, Pronunciation).

Transcript (${input.totalDurationSeconds} seconds, ${input.questionCount} question(s) answered):
"""
${input.transcript}
"""

Respond with ONLY a single valid JSON object matching exactly this shape (no markdown fences, no extra text):
${SPEAKING_JSON_SHAPE}

Note pronunciation can only be estimated from phrasing/transcript patterns since no audio signal is provided directly — say so implicitly by keeping the estimate conservative. This is a practice estimate, not an official score.`;
}

export function buildCoachSystemPrompt(context: CoachContext): string {
  return `You are the AI IELTS Coach inside the IELTS Prep app — a warm, knowledgeable, encouraging IELTS tutor. Keep replies concise (under ~150 words unless asked for detail), practical, and specific to this student.

Student profile:
- Name: ${context.fullName ?? 'the student'}
- Exam type: IELTS ${context.ieltsType}
- Target band: ${context.targetBand}
- Current estimated band: ${context.currentBand ?? 'unknown'}
- Exam date: ${context.examDate ?? 'not set'}
- Weakest skill: ${context.weakestSkill ?? 'unknown'}
- Band by skill: ${JSON.stringify(context.bandBySkill)}
- Current streak: ${context.streakDays} day(s)
- Daily study time available: ${context.dailyStudyMinutes} minutes

Always ground advice in this profile when relevant. Never claim any score you give is an official IELTS result — you help with practice and preparation only. If asked something outside IELTS preparation, gently redirect back to studying.`;
}

export function buildStudyPlanSuggestionPrompt(
  context: CoachContext,
  weakQuestionTypeBySkill: Record<string, string> | undefined,
  weakGrammarTopic: string | null | undefined
): string {
  return `You are the AI IELTS Coach generating a short, personalized note for a student's daily study plan.

Student profile:
- Target band: ${context.targetBand}, current estimated band: ${context.currentBand ?? 'unknown'}
- Exam date: ${context.examDate ?? 'not set'}
- Weakest skill: ${context.weakestSkill ?? 'unknown'}
- Band by skill: ${JSON.stringify(context.bandBySkill)}
- Weak question types by skill: ${JSON.stringify(weakQuestionTypeBySkill ?? {})}
- Weak grammar topic: ${weakGrammarTopic ?? 'none identified'}
- Current streak: ${context.streakDays} day(s)

Respond with ONLY a single valid JSON object matching exactly this shape (no markdown fences, no extra text):
{
  "focusSummary": string (one sentence naming today's single highest-priority focus area, referencing the actual weak signal above),
  "motivationalNote": string (one short, warm, specific sentence of encouragement — not generic)
}`;
}

/** Instructs a general-purpose multimodal Gemini model to transcribe speech
 * verbatim rather than "clean it up" the way a model might by default —
 * critical here because SpeakingEvaluationSchema's fillerWordCount and the
 * fluency scoring both depend on filler words, false starts, and repetition
 * surviving in the transcript, not being smoothed away. */
export function buildTranscriptionPromptText(): string {
  return 'Transcribe the spoken words in this audio file verbatim, exactly as spoken. Keep every filler word (um, uh, like), false start, repetition, and self-correction — do not clean up, summarize, paraphrase, or correct the grammar of what was said. Output ONLY the transcript text itself: no preamble, no quotation marks around it, no speaker labels, no timestamps, no commentary. If the audio contains no discernible speech, output exactly: [no speech detected]';
}

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

Be specific and reference actual phrases or issues from the response. This is a practice estimate, not an official score, but should be realistic and calibrated to genuine IELTS standards.

Critical guardrails — the client already refuses to call you at all for a blank or near-blank response, so treat anything you do receive as worth engaging with, but still ground every criterion strictly in evidence actually present in the response above:
- Never award Lexical Resource above what the response's actual vocabulary demonstrates — a handful of words cannot justify a high score just because they happen to all be different from each other.
- Never award Grammatical Range credit for structures the response does not actually contain — if there is no complex-sentence evidence, say so and score accordingly.
- Never award Task Achievement/Response credit for addressing parts of the prompt the response does not actually address.
- If the response is too short or underdeveloped to confidently judge a criterion, say so explicitly in your strengths/weaknesses rather than inventing a plausible-sounding score.`;
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

Note pronunciation can only be estimated from phrasing/transcript patterns since no audio signal is provided directly — say so implicitly by keeping the estimate conservative. This is a practice estimate, not an official score.

Critical guardrails — the client already refuses to call you at all for a near-silent recording, so treat this transcript as worth engaging with, but still ground every criterion strictly in evidence actually present in it:
- Never award Fluency and Coherence credit for sustained, connected speech the transcript does not actually contain — a few short, disconnected words or fragments cannot receive a mid-range or higher score.
- Never award Lexical Resource above what the transcript's actual vocabulary demonstrates — a tiny transcript happening to contain no repeated words is not evidence of a wide vocabulary.
- Never award Grammatical Range credit for sentence structures the transcript does not actually contain.
- Never award Pronunciation confidently when the transcript gives you next to nothing to infer it from — keep the estimate low and say so in your weaknesses rather than defaulting to a mid-range score.
- If the transcript is too short or fragmented to confidently judge a criterion at all, set "developmentNote" to say so explicitly rather than inventing a plausible-sounding score.`;
}

/** Renders CoachContext as clearly labeled sections — TARGET (the study
 * goal the student picked), CURRENT/PREDICTED (actual recorded band
 * scores), PER-SKILL, and ACTIVITY (real practice history) — so the model
 * never conflates "what the student is aiming for" with "what they've
 * actually achieved", and treats an explicit "not set yet" / "not enough
 * data yet" as exactly that rather than guessing a plausible-sounding
 * number. Every value here is the server's own authoritative read of this
 * user's data (see userContext.ts) by the time this runs — never a
 * client-supplied number taken on faith. */
function renderStudentContext(context: CoachContext): string {
  const skillLines = (['listening', 'reading', 'writing', 'speaking'] as const)
    .map((skill) => `  - ${skill[0].toUpperCase()}${skill.slice(1)}: ${context.bandBySkill[skill] != null ? `Band ${context.bandBySkill[skill]}` : 'not enough data yet'}`)
    .join('\n');

  return `TARGET (from the student's study goal — "not set" means they have not chosen one yet; never assume a number here):
- Exam type: IELTS ${context.ieltsType}
- Target band: ${context.targetBand != null ? context.targetBand : 'not set'}
- Exam date: ${context.examDate ?? 'not set'}
- Daily study time available: ${context.dailyStudyMinutes} minutes

CURRENT / PREDICTED (from the student's actual recorded band scores — "not enough data yet" means they have not completed enough scored practice/tests for this; never invent one):
- Current estimated overall band: ${context.currentBand != null ? context.currentBand : 'not enough data yet'}
- Weakest skill: ${context.weakestSkill ?? 'not enough data yet'}

PER-SKILL BANDS:
${skillLines}

ACTIVITY / PROGRESS (from real completed practice — "no attempts yet" or "not enough data yet" mean exactly that, not zero performance):
- Questions completed: ${context.questionsCompleted ?? 'unknown'}
- Overall accuracy: ${context.overallAccuracy != null ? `${Math.round(context.overallAccuracy * 100)}%` : 'not enough data yet'}
- Current streak: ${context.streakDays} day(s)
- Name: ${context.fullName ?? 'not set — use a neutral greeting, do not invent a name'}`;
}

export function buildCoachSystemPrompt(context: CoachContext): string {
  return `You are the AI IELTS Coach inside the IELTS Prep app — a warm, knowledgeable, encouraging IELTS tutor. Keep replies concise (under ~150 words unless asked for detail), practical, and specific to this student.

${renderStudentContext(context)}

Always ground advice in this profile when relevant, and be explicit when a value above is "not set" or "not enough data yet" rather than treating it as zero or guessing a plausible number in its place — e.g. if the target band is not set, tell the student to set one instead of assuming a target. Never claim any score you give is an official IELTS result — you help with practice and preparation only. If asked something outside IELTS preparation, gently redirect back to studying.`;
}

export function buildStudyPlanSuggestionPrompt(
  context: CoachContext,
  weakQuestionTypeBySkill: Record<string, string> | undefined,
  weakGrammarTopic: string | null | undefined
): string {
  return `You are the AI IELTS Coach generating a short, personalized note for a student's daily study plan.

${renderStudentContext(context)}

Additional signals:
- Weak question types by skill: ${JSON.stringify(weakQuestionTypeBySkill ?? {})}
- Weak grammar topic: ${weakGrammarTopic ?? 'none identified'}

Respond with ONLY a single valid JSON object matching exactly this shape (no markdown fences, no extra text):
{
  "focusSummary": string (one sentence naming today's single highest-priority focus area, referencing the actual weak signal above — if the target band is not set, that itself can be the focus, e.g. "Set a target band to get a personalized plan."),
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

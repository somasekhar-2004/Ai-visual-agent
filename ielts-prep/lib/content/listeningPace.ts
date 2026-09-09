// Real IELTS Listening tests get noticeably harder to follow as they go:
// Section 1 is slow and clear, Section 4 is dense, continuous academic
// speech with almost no dead air. This table is the single place that
// encodes that progression, so scripts/generate-audio.ts (gpt-4o-mini-tts's
// `instructions` steering + the silence gap between speaker turns) and any
// future human-corpus clip selection (choosing a recording whose natural
// pace already matches) both derive from the same source instead of
// guessing independently.
export type ListeningPaceLabel = 'slower' | 'standard' | 'brisk' | 'dense';

export type ListeningPaceProfile = {
  label: ListeningPaceLabel;
  description: string;
  /** Natural-language delivery instruction for this section, fed into
   * gpt-4o-mini-tts's `instructions` parameter (see
   * lib/content/audioInstructions.ts) — this is the primary, reliable pace
   * lever for this model. Community reports (OpenAI developer forum) say
   * gpt-4o-mini-tts can ignore the numeric `speed` parameter, so pace is
   * controlled in words here, not just in a number. */
  styleInstruction: string;
  /** OpenAI TTS `speed` parameter (0.25-4.0, default 1.0), sent as a
   * secondary/best-effort lever alongside `styleInstruction` — official
   * OpenAI docs still list it as supported for this model, so there's no
   * reason not to send it, but don't rely on it alone. */
  ttsSpeed: number;
  /** Silence inserted between speaker turns / paragraph breaks, in
   * seconds. Section 1 gets the longest pauses (easiest to follow);
   * Section 4 the shortest (a real lecture rarely pauses between
   * sentences). */
  gapSeconds: number;
};

export const PACE_BY_SECTION: Record<number, ListeningPaceProfile> = {
  1: {
    label: 'slower',
    description: 'Everyday social conversation — slow, clear, generous pauses.',
    styleInstruction: 'Speak in a clear, friendly, slightly slower everyday conversational style, as if patiently helping someone over the phone.',
    ttsSpeed: 0.92,
    gapSeconds: 0.65,
  },
  2: {
    label: 'standard',
    description: 'Everyday social monologue — normal conversational/announcement speed.',
    styleInstruction: 'Speak as a natural, informative monologue at a normal conversational pace, like someone giving a friendly announcement or tour.',
    ttsSpeed: 1.0,
    gapSeconds: 0.55,
  },
  3: {
    label: 'brisk',
    description: 'Educational/training discussion — quicker natural interaction, shorter gaps between speakers.',
    styleInstruction: 'Speak faster than casual conversation, in a natural educational discussion style with tighter, more immediate turn-taking between speakers.',
    ttsSpeed: 1.08,
    gapSeconds: 0.4,
  },
  4: {
    label: 'dense',
    description: 'Academic monologue/lecture — continuous, denser delivery, minimal pausing.',
    styleInstruction: 'Speak as a continuous academic lecture — denser, more formal, and more sustained than conversation, with minimal pausing between sentences.',
    ttsSpeed: 1.05,
    gapSeconds: 0.3,
  },
};

const DEFAULT_PACE: ListeningPaceProfile = PACE_BY_SECTION[2];

export function paceForSection(sectionNumber: number): ListeningPaceProfile {
  return PACE_BY_SECTION[sectionNumber] ?? DEFAULT_PACE;
}

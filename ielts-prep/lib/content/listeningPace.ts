// Real IELTS Listening tests get noticeably harder to follow as they go:
// Section 1 is slow and clear, Section 4 is dense, continuous academic
// speech with almost no dead air. This table is the single place that
// encodes that progression, so scripts/generate-audio.ts (Piper TTS's
// --length_scale rate control + the silence gap between speaker turns) and
// any future human-corpus clip selection (choosing a recording whose
// natural pace already matches) both derive from the same source instead
// of guessing independently.
export type ListeningPaceLabel = 'slower' | 'standard' | 'brisk' | 'dense';

export type ListeningPaceProfile = {
  label: ListeningPaceLabel;
  description: string;
  /** Passed as Piper's `--length_scale <float>`. This is an inverse-speed
   * multiplier: 1.0 is the model's default pace, >1.0 slower, <1.0 faster
   * (e.g. 1.15 = about 15% slower). Kept close to 1.0 deliberately —
   * Section 4's "denser" feel comes mainly from gapSeconds below, not from
   * talking unnaturally fast. */
  piperLengthScale: number;
  /** Silence inserted between speaker turns / paragraph breaks, in
   * seconds. Section 1 gets the longest pauses (easiest to follow);
   * Section 4 the shortest (a real lecture rarely pauses between
   * sentences). */
  gapSeconds: number;
};

export const PACE_BY_SECTION: Record<number, ListeningPaceProfile> = {
  1: { label: 'slower', description: 'Everyday social conversation — slow, clear, generous pauses.', piperLengthScale: 1.15, gapSeconds: 0.65 },
  2: { label: 'standard', description: 'Everyday social monologue — normal conversational/announcement speed.', piperLengthScale: 1.0, gapSeconds: 0.55 },
  3: { label: 'brisk', description: 'Educational/training discussion — quicker natural interaction, shorter gaps between speakers.', piperLengthScale: 0.92, gapSeconds: 0.4 },
  4: { label: 'dense', description: 'Academic monologue/lecture — continuous, denser delivery, minimal pausing.', piperLengthScale: 0.97, gapSeconds: 0.2 },
};

const DEFAULT_PACE: ListeningPaceProfile = PACE_BY_SECTION[2];

export function paceForSection(sectionNumber: number): ListeningPaceProfile {
  return PACE_BY_SECTION[sectionNumber] ?? DEFAULT_PACE;
}

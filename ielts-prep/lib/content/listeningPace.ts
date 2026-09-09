// Real IELTS Listening tests get noticeably harder to follow as they go:
// Section 1 is slow and clear, Section 4 is dense, continuous academic
// speech with almost no dead air. This table is the single place that
// encodes that progression, so scripts/generate-audio.ts (macOS `say`'s
// -r words-per-minute rate + the silence gap between speaker turns) and any
// future human-corpus clip selection (choosing a recording whose natural
// pace already matches) both derive from the same source instead of
// guessing independently.
export type ListeningPaceLabel = 'slower' | 'standard' | 'brisk' | 'dense';

export type ListeningPaceProfile = {
  label: ListeningPaceLabel;
  description: string;
  /** Passed as `say -r <wpm>`. macOS `say`'s default is roughly 175-200wpm
   * depending on the voice; these are deliberately close to that baseline
   * — Section 4's "denser" feel comes mainly from gapSeconds below, not
   * from talking unnaturally fast. */
  sayRateWpm: number;
  /** Silence inserted between speaker turns / paragraph breaks, in
   * seconds. Section 1 gets the longest pauses (easiest to follow);
   * Section 4 the shortest (a real lecture rarely pauses between
   * sentences). */
  gapSeconds: number;
};

export const PACE_BY_SECTION: Record<number, ListeningPaceProfile> = {
  1: { label: 'slower', description: 'Everyday social conversation — slow, clear, generous pauses.', sayRateWpm: 165, gapSeconds: 0.65 },
  2: { label: 'standard', description: 'Everyday social monologue — normal conversational/announcement speed.', sayRateWpm: 180, gapSeconds: 0.55 },
  3: { label: 'brisk', description: 'Educational/training discussion — quicker natural interaction, shorter gaps between speakers.', sayRateWpm: 195, gapSeconds: 0.4 },
  4: { label: 'dense', description: 'Academic monologue/lecture — continuous, denser delivery, minimal pausing.', sayRateWpm: 185, gapSeconds: 0.2 },
};

const DEFAULT_PACE: ListeningPaceProfile = PACE_BY_SECTION[2];

export function paceForSection(sectionNumber: number): ListeningPaceProfile {
  return PACE_BY_SECTION[sectionNumber] ?? DEFAULT_PACE;
}

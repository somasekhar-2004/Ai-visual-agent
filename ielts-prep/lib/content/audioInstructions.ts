import type { ListeningPaceProfile } from './listeningPace';

// Builds the natural-language `instructions` string sent to gpt-4o-mini-tts
// for one turn: the section's style (pace/register — listeningPace.ts) plus
// this speaker's persona (accent/age/tone, if the track defines one), plus
// a standing instruction that's repeated on every single call as a second,
// independent line of defense against ever speaking a label or metadata —
// turns.text already never contains one (see contentIntegrity.test.ts's
// label-leakage check), but the model is only ever told what to say via
// this string and the turn's own text, so it costs nothing to say it
// explicitly too.
export function buildTurnInstructions(pace: Pick<ListeningPaceProfile, 'styleInstruction'>, persona: string | undefined): string {
  const parts = [
    pace.styleInstruction,
    persona ? `Voice this speaker as: ${persona}.` : undefined,
    'Speak only the exact words given, naturally and continuously, as real spoken listening-test audio — never read aloud any name, label, or other metadata that is not part of the words themselves.',
  ];
  return parts.filter((p): p is string => Boolean(p)).join(' ');
}

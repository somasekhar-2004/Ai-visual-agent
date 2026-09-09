import type { ListeningTrack } from '@/types/models';

// An example voice pool, used by tests that don't need a real discovered
// voice list. scripts/generate-audio.ts passes its own pool — the actual
// English voice names macOS's `say` reports as installed on the machine it
// runs on (discovered at generation time, since exact voice names vary by
// macOS version and which ones the user has downloaded) — rather than this
// constant, so assignVoices itself has no hardcoded, provider-specific
// voice names or any dependency on a paid API.
export const VOICE_POOL = ['Voice A', 'Voice B', 'Voice C', 'Voice D', 'Voice E', 'Voice F'];

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic per-track speaker->voice assignment: sort this track's
 * unique speaker names, then walk `voicePool` starting at an offset derived
 * from the track id. Re-running the generation script always produces the
 * same voice for the same speaker in the same track, and two different
 * speakers within one track never collide as long as the track has no more
 * distinct speakers than `voicePool` has entries. */
export function assignVoices(track: Pick<ListeningTrack, 'id' | 'turns'>, voicePool: string[]): Record<string, string> {
  const speakers = Array.from(new Set((track.turns ?? []).map((t) => t.speaker))).sort();
  if (voicePool.length === 0) return {};
  const offset = hashString(track.id) % voicePool.length;
  const map: Record<string, string> = {};
  speakers.forEach((speaker, i) => {
    map[speaker] = voicePool[(offset + i) % voicePool.length];
  });
  return map;
}

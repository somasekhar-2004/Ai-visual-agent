import type { ListeningTrack } from '@/types/models';

// Six OpenAI TTS voices with clearly distinct timbre, so that speakers
// within the same dialogue never sound alike. Shared between
// scripts/generate-audio.ts (which actually calls the TTS API) and its
// tests, so the assignment logic can be verified without needing an API
// key or network access.
export const VOICE_POOL = ['onyx', 'nova', 'fable', 'echo', 'shimmer', 'alloy'];

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic per-track speaker->voice assignment: sort this track's
 * unique speaker names, then walk VOICE_POOL starting at an offset derived
 * from the track id. Re-running the generation script always produces the
 * same voice for the same speaker in the same track, and two different
 * speakers within one track never collide as long as the track has no more
 * distinct speakers than VOICE_POOL has entries. */
export function assignVoices(track: Pick<ListeningTrack, 'id' | 'turns'>): Record<string, string> {
  const speakers = Array.from(new Set((track.turns ?? []).map((t) => t.speaker))).sort();
  const offset = hashString(track.id) % VOICE_POOL.length;
  const map: Record<string, string> = {};
  speakers.forEach((speaker, i) => {
    map[speaker] = VOICE_POOL[(offset + i) % VOICE_POOL.length];
  });
  return map;
}

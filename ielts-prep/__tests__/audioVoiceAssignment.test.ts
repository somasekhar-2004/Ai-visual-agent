import { allListeningTracks } from '@/lib/content';
import { assignVoices, VOICE_POOL, hashString } from '@/lib/content/audioVoiceAssignment';

describe('assignVoices — per-track speaker/voice mapping used by scripts/generate-audio.ts', () => {
  it('gives every distinct speaker within one track a different voice', () => {
    const voices = assignVoices({ id: 'track-1', turns: [{ speaker: 'Alice', text: 'hi' }, { speaker: 'Bob', text: 'hey' }, { speaker: 'Cara', text: 'hello' }] });
    const values = Object.values(voices);
    expect(new Set(values).size).toBe(values.length);
    expect(values.every((v) => VOICE_POOL.includes(v))).toBe(true);
  });

  it('is deterministic — the same track id and speakers always produce the same mapping', () => {
    const track = { id: 'stable-id', turns: [{ speaker: 'Guide', text: 'hi' }, { speaker: 'Visitor', text: 'hey' }] };
    expect(assignVoices(track)).toEqual(assignVoices(track));
  });

  it('a track with no turns gets an empty voice map', () => {
    expect(assignVoices({ id: 'x', turns: [] })).toEqual({});
    expect(assignVoices({ id: 'x' })).toEqual({});
  });

  it('hashString is a pure, deterministic function', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
    expect(hashString('abc')).not.toBe(hashString('abd'));
  });

  it('every real listening track migrated to structured turns gets fully distinct per-speaker voices', () => {
    const migrated = allListeningTracks.filter((t) => t.turns && t.turns.length > 0);
    expect(migrated.length).toBeGreaterThan(0);
    for (const track of migrated) {
      const voices = assignVoices(track);
      const values = Object.values(voices);
      expect(new Set(values).size).toBe(values.length);
    }
  });
});

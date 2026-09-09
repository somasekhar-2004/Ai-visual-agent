import { allListeningTracks } from '@/lib/content';
import { assignVoices, VOICE_POOL, hashString } from '@/lib/content/audioVoiceAssignment';

describe('assignVoices — per-track speaker/voice mapping used by scripts/generate-audio.ts', () => {
  it('gives every distinct speaker within one track a different voice', () => {
    const voices = assignVoices({ id: 'track-1', turns: [{ speaker: 'Alice', text: 'hi' }, { speaker: 'Bob', text: 'hey' }, { speaker: 'Cara', text: 'hello' }] }, VOICE_POOL);
    const values = Object.values(voices);
    expect(new Set(values).size).toBe(values.length);
    expect(values.every((v) => VOICE_POOL.includes(v))).toBe(true);
  });

  it('is deterministic — the same track id and speakers always produce the same mapping', () => {
    const track = { id: 'stable-id', turns: [{ speaker: 'Guide', text: 'hi' }, { speaker: 'Visitor', text: 'hey' }] };
    expect(assignVoices(track, VOICE_POOL)).toEqual(assignVoices(track, VOICE_POOL));
  });

  it('a track with no turns gets an empty voice map', () => {
    expect(assignVoices({ id: 'x', turns: [] }, VOICE_POOL)).toEqual({});
    expect(assignVoices({ id: 'x' }, VOICE_POOL)).toEqual({});
  });

  it('an empty voice pool gets an empty voice map (never throws)', () => {
    expect(assignVoices({ id: 'x', turns: [{ speaker: 'A', text: 'hi' }] }, [])).toEqual({});
  });

  it('works with any runtime-discovered pool, not just VOICE_POOL (e.g. macOS `say` voice names)', () => {
    const macVoices = ['Ava (Premium)', 'Tom', 'Daniel (Enhanced)'];
    const voices = assignVoices({ id: 'track-mac', turns: [{ speaker: 'Guide', text: 'hi' }, { speaker: 'Visitor', text: 'hey' }] }, macVoices);
    expect(Object.values(voices).every((v) => macVoices.includes(v))).toBe(true);
  });

  it('hashString is a pure, deterministic function', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
    expect(hashString('abc')).not.toBe(hashString('abd'));
  });

  it('every real listening track migrated to structured turns gets fully distinct per-speaker voices', () => {
    const migrated = allListeningTracks.filter((t) => t.turns && t.turns.length > 0);
    expect(migrated.length).toBeGreaterThan(0);
    for (const track of migrated) {
      const voices = assignVoices(track, VOICE_POOL);
      const values = Object.values(voices);
      expect(new Set(values).size).toBe(values.length);
    }
  });
});

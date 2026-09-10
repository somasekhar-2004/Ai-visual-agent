import { allListeningTracks } from '@/lib/content';
import { assignSpeakerCategories, assignVoices, genderFromPersona, genderOf, resolveGendersWithContrast, VOICE_POOL, hashString } from '@/lib/content/audioVoiceAssignment';

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

// Regression coverage for the real-device "Self-Storage's two speakers
// sound almost identical" finding: a different numeric Piper speaker ID is
// not the same thing as a perceptually distinct voice. These tests cover
// the curated-category layer that replaced plain ID-uniqueness for the real
// Piper/VCTK pipeline (assignVoices above is unchanged and still used by
// tests/tooling that just need "any distinct string per speaker").
describe('genderFromPersona — reads gender off a speaker persona sentence', () => {
  it('detects an explicit "female"/"male" word', () => {
    expect(genderFromPersona('a young female university student')).toBe('female');
    expect(genderFromPersona('a polite adult male customer')).toBe('male');
  });

  it('falls back to a pronoun when no explicit word is present', () => {
    expect(genderFromPersona('a warm receptionist in her 30s')).toBe('female');
    expect(genderFromPersona('a lecturer, calm and measured, in his 40s')).toBe('male');
  });

  it('returns null when the persona says nothing about gender, rather than guessing', () => {
    expect(genderFromPersona('a neutral British accent, clear tone')).toBeNull();
    expect(genderFromPersona(undefined)).toBeNull();
  });
});

describe('genderOf — the single source of truth used by both the tests and the real Piper run', () => {
  it('is deterministic for a speaker with no gender-legible persona (same track+speaker always resolves the same way)', () => {
    const track = { id: 'track-x', speakerPersonas: {} };
    expect(genderOf(track, 'Speaker')).toBe(genderOf(track, 'Speaker'));
  });

  it('prefers the persona over the hash fallback when one is present', () => {
    const track = { id: 'track-y', speakerPersonas: { Host: 'a female host' } };
    expect(genderOf(track, 'Host')).toBe('female');
  });
});

describe('assignSpeakerCategories — curated, gender-spread voice categories for the real Piper pipeline', () => {
  it('gives every same-gender speaker in a track a distinct category', () => {
    const track = { id: 'group-1', turns: [{ speaker: 'A', text: 'x' }, { speaker: 'B', text: 'x' }, { speaker: 'C', text: 'x' }] };
    const genders: Record<string, 'male' | 'female'> = { A: 'female', B: 'female', C: 'male' };
    const categories = assignSpeakerCategories(track, (s) => genders[s]);
    expect(categories.A).not.toBe(categories.B);
    expect(new Set(Object.values(categories)).size).toBe(3);
  });

  it('is deterministic — the same track and genders always produce the same category map', () => {
    const track = { id: 'group-2', turns: [{ speaker: 'X', text: 'x' }, { speaker: 'Y', text: 'x' }] };
    const genderOfFn = () => 'female' as const;
    expect(assignSpeakerCategories(track, genderOfFn)).toEqual(assignSpeakerCategories(track, genderOfFn));
  });

  it('a track with no turns gets an empty category map', () => {
    expect(assignSpeakerCategories({ id: 'empty', turns: [] }, () => 'female')).toEqual({});
  });

  it('handles the real-world max of 3 same-gender speakers in one track without collision', () => {
    const track = { id: 'four-speaker', turns: [{ speaker: 'Tutor', text: 'x' }, { speaker: 'Elena', text: 'x' }, { speaker: 'Tomas', text: 'x' }, { speaker: 'Aisha', text: 'x' }] };
    const genders: Record<string, 'male' | 'female'> = { Tutor: 'female', Elena: 'female', Tomas: 'male', Aisha: 'female' };
    const categories = assignSpeakerCategories(track, (s) => genders[s]);
    expect(new Set(Object.values(categories)).size).toBe(4);
  });
});

describe('resolveGendersWithContrast — 2-person dialogues prefer contrasting genders when neither side is known', () => {
  it('alternates two fully-generic roles rather than risking both landing on the same gender', () => {
    const track = { id: 'dialogue-1', turns: [{ speaker: 'Receptionist', text: 'x' }, { speaker: 'Caller', text: 'x' }] };
    const genders = resolveGendersWithContrast(track, () => null);
    expect(genders.Receptionist).not.toBe(genders.Caller);
  });

  it('respects a known gender and only alternates the genuinely ambiguous speaker', () => {
    const track = { id: 'dialogue-2', turns: [{ speaker: 'Grace', text: 'x' }, { speaker: 'Marcus', text: 'x' }] };
    const genders = resolveGendersWithContrast(track, (s) => (s === 'Grace' ? 'female' : s === 'Marcus' ? 'male' : null));
    expect(genders.Grace).toBe('female');
    expect(genders.Marcus).toBe('male');
  });

  it('is deterministic across calls for the same track', () => {
    const track = { id: 'dialogue-3', turns: [{ speaker: 'Agent', text: 'x' }, { speaker: 'Customer', text: 'x' }] };
    expect(resolveGendersWithContrast(track, () => null)).toEqual(resolveGendersWithContrast(track, () => null));
  });
});

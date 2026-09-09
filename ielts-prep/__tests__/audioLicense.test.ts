import { COMMERCIAL_REDISTRIBUTION_ALLOWED, LICENSES_REQUIRING_ATTRIBUTION, validateAudioSource } from '@/lib/content/audioLicense';

// These exercise the licence-validation rule with synthetic fixtures. Real
// content does use the local_tts path now (the 4 proof-of-concept tracks,
// Piper's en_GB-vctk-medium voice model) with a real CC-BY-4.0 licence +
// attribution declared — see contentIntegrity.test.ts's "audio source &
// licence metadata" tests for that. No real content uses human_corpus yet
// (Phase 1's research found no open corpus that matches IELTS-style
// dialogue/monologue content closely enough to use safely yet — see the
// Listening overhaul report), but the rule is still tested and ready.
describe('validateAudioSource', () => {
  it('accepts a local_tts source with no licence fields at all (e.g. a voice model with no separate data-licence obligation)', () => {
    expect(validateAudioSource({ kind: 'local_tts', provider: 'piper-tts (en_US-ljspeech)' })).toEqual([]);
  });

  it('validates a local_tts source\'s licence the same way as human_corpus whenever one is declared (e.g. a voice model trained on licensed speech data)', () => {
    const withoutAttribution = validateAudioSource({
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
    });
    expect(withoutAttribution).toEqual(expect.arrayContaining([expect.stringContaining('requires attribution')]));

    const withAttribution = validateAudioSource({
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution: 'VCTK Corpus, University of Edinburgh (CSTR), CC BY 4.0',
    });
    expect(withAttribution).toEqual([]);
  });

  it('a local_tts source is never required to declare sourceUrl the way human_corpus is (no licence obligation implies nothing to point back to)', () => {
    expect(validateAudioSource({ kind: 'local_tts', provider: 'piper-tts (en_US-ljspeech)' })).not.toEqual(expect.arrayContaining([expect.stringContaining('sourceUrl')]));
  });

  it('accepts a CC0-1.0 human_corpus source with no attribution', () => {
    expect(
      validateAudioSource({ kind: 'human_corpus', provider: 'Mozilla Common Voice', license: 'CC0-1.0', sourceUrl: 'https://commonvoice.mozilla.org/en/datasets' }),
    ).toEqual([]);
  });

  it('accepts a Public-Domain human_corpus source with no attribution', () => {
    expect(
      validateAudioSource({ kind: 'human_corpus', provider: 'LibriVox', license: 'Public-Domain', sourceUrl: 'https://librivox.org/some-recording' }),
    ).toEqual([]);
  });

  it('accepts a CC-BY-4.0 source only when attribution is set', () => {
    const withoutAttribution = validateAudioSource({ kind: 'human_corpus', provider: 'OpenSLR VCTK', license: 'CC-BY-4.0', sourceUrl: 'https://openslr.org/vctk' });
    expect(withoutAttribution).toEqual(expect.arrayContaining([expect.stringContaining('requires attribution')]));

    const withAttribution = validateAudioSource({
      kind: 'human_corpus',
      provider: 'OpenSLR VCTK',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://openslr.org/vctk',
      attribution: 'VCTK Corpus, University of Edinburgh, CC BY 4.0',
    });
    expect(withAttribution).toEqual([]);
  });

  it('rejects a human_corpus source with no licence at all', () => {
    expect(validateAudioSource({ kind: 'human_corpus', provider: 'Unknown' })).toEqual(expect.arrayContaining([expect.stringContaining('missing a license')]));
  });

  it('rejects a human_corpus source with no sourceUrl', () => {
    expect(validateAudioSource({ kind: 'human_corpus', provider: 'LibriVox', license: 'Public-Domain' })).toEqual(
      expect.arrayContaining([expect.stringContaining('sourceUrl')]),
    );
  });

  it('every listed licence explicitly permits commercial redistribution (no No-Derivatives/non-commercial licence is ever accepted)', () => {
    for (const allowed of Object.values(COMMERCIAL_REDISTRIBUTION_ALLOWED)) {
      expect(allowed).toBe(true);
    }
  });

  it('CC-BY-4.0 is the only licence in the accepted set that requires attribution', () => {
    expect(Array.from(LICENSES_REQUIRING_ATTRIBUTION)).toEqual(['CC-BY-4.0']);
  });
});

import fs from 'node:fs';
import path from 'node:path';

import { allListeningTracks, allSpeakingTopics, content } from '@/lib/content';
import { validateAudioSource } from '@/lib/content/audioLicense';
import { audioRegistry } from '@/lib/content/audioRegistry';
import { assignSpeakerCategories, genderOf } from '@/lib/content/audioVoiceAssignment';
import { PACE_BY_SECTION } from '@/lib/content/listeningPace';

function duplicateIds(items: { id: string }[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) dupes.add(item.id);
    seen.add(item.id);
  }
  return Array.from(dupes);
}

describe('content library — no duplicate IDs', () => {
  it('reading passages have unique IDs', () => {
    expect(duplicateIds(content.readingPassages)).toEqual([]);
  });
  it('reading + listening questions have unique IDs', () => {
    expect(duplicateIds(content.allQuestions)).toEqual([]);
  });
  it('listening tracks have unique IDs', () => {
    expect(duplicateIds(content.listeningTracks)).toEqual([]);
  });
  it('writing prompts have unique IDs', () => {
    expect(duplicateIds(content.writingPrompts)).toEqual([]);
  });
  it('speaking topics have unique IDs', () => {
    expect(duplicateIds(allSpeakingTopics)).toEqual([]);
  });
  it('vocabulary words have unique IDs', () => {
    expect(duplicateIds(content.vocabularyWords)).toEqual([]);
  });
  it('grammar lessons have unique IDs', () => {
    expect(duplicateIds(content.grammarLessons)).toEqual([]);
  });
  it('grammar questions have unique IDs', () => {
    expect(duplicateIds(content.grammarQuestions)).toEqual([]);
  });
  it('mock tests have unique IDs', () => {
    expect(duplicateIds(content.mockTests)).toEqual([]);
  });
  it('mock sections have unique IDs', () => {
    expect(duplicateIds(content.mockSections)).toEqual([]);
  });
  it('achievements have unique IDs', () => {
    expect(duplicateIds(content.achievements)).toEqual([]);
  });
  it('lessons have unique IDs', () => {
    expect(duplicateIds(content.lessons)).toEqual([]);
  });
});

describe('content library — no duplicate content', () => {
  it('has no two vocabulary words with the same lowercased word text', () => {
    const seen = new Map<string, string[]>();
    for (const w of content.vocabularyWords) {
      const key = w.word.trim().toLowerCase();
      seen.set(key, [...(seen.get(key) ?? []), w.id]);
    }
    const dupes = Array.from(seen.entries()).filter(([, ids]) => ids.length > 1);
    expect(dupes).toEqual([]);
  });

  it('has no two reading passages with identical titles', () => {
    const seen = new Map<string, string[]>();
    for (const p of content.readingPassages) {
      seen.set(p.title, [...(seen.get(p.title) ?? []), p.id]);
    }
    const dupes = Array.from(seen.entries()).filter(([, ids]) => ids.length > 1);
    expect(dupes).toEqual([]);
  });

  it('has no two listening tracks with identical titles', () => {
    const seen = new Map<string, string[]>();
    for (const t of content.listeningTracks) {
      seen.set(t.title, [...(seen.get(t.title) ?? []), t.id]);
    }
    const dupes = Array.from(seen.entries()).filter(([, ids]) => ids.length > 1);
    expect(dupes).toEqual([]);
  });
});

describe('reading — passage/question mapping', () => {
  it('every reading question references a passage that exists', () => {
    const passageIds = new Set(content.readingPassages.map((p) => p.id));
    const readingQs = content.allQuestions.filter((q) => q.skill === 'reading');
    const orphans = readingQs.filter((q) => !q.passageId || !passageIds.has(q.passageId));
    expect(orphans.map((q) => q.id)).toEqual([]);
  });

  it('every reading passage is referenced by at least one question', () => {
    const referenced = new Set(content.allQuestions.filter((q) => q.skill === 'reading').map((q) => q.passageId));
    const unused = content.readingPassages.filter((p) => !referenced.has(p.id));
    expect(unused.map((p) => p.id)).toEqual([]);
  });

  it('academic and general reading passages are clearly separated by ieltsType', () => {
    for (const p of content.readingPassages) {
      expect(['academic', 'general']).toContain(p.ieltsType);
    }
  });

  it('reading question types are reasonably balanced (no single type is >50% of all reading questions)', () => {
    const readingQs = content.allQuestions.filter((q) => q.skill === 'reading');
    const counts = new Map<string, number>();
    for (const q of readingQs) counts.set(q.questionType, (counts.get(q.questionType) ?? 0) + 1);
    const max = Math.max(...counts.values());
    expect(max / readingQs.length).toBeLessThan(0.5);
  });
});

describe('listening — track/question mapping', () => {
  it('every listening question references a track that exists', () => {
    const trackIds = new Set(content.listeningTracks.map((t) => t.id));
    const listeningQs = content.allQuestions.filter((q) => q.skill === 'listening');
    const orphans = listeningQs.filter((q) => !q.listeningTrackId || !trackIds.has(q.listeningTrackId));
    expect(orphans.map((q) => q.id)).toEqual([]);
  });

  it('every listening track is referenced by at least one question', () => {
    const referenced = new Set(content.allQuestions.filter((q) => q.skill === 'listening').map((q) => q.listeningTrackId));
    const unused = content.listeningTracks.filter((t) => !referenced.has(t.id));
    expect(unused.map((t) => t.id)).toEqual([]);
  });

  it('every listening track has a non-empty transcript', () => {
    const empty = content.listeningTracks.filter((t) => !t.transcript || t.transcript.trim().length < 20);
    expect(empty.map((t) => t.id)).toEqual([]);
  });
});

describe('listening — structured turns (multi-speaker audio pipeline)', () => {
  // Tracks migrated to `turns` are the ones scripts/generate-audio.ts will
  // synthesize as real, multi-speaker, label-free audio. A track without
  // `turns` is left alone on purpose (see that script's header comment) —
  // it keeps using the legacy single-voice/on-device-TTS path until it's
  // migrated in a later batch.
  const withTurns = content.listeningTracks.filter((t) => t.turns && t.turns.length > 0);

  it('has at least one track migrated to the structured multi-speaker pipeline', () => {
    expect(withTurns.length).toBeGreaterThan(0);
  });

  it('every turn has a non-empty speaker and non-empty text', () => {
    const problems: string[] = [];
    for (const t of withTurns) {
      t.turns!.forEach((turn, i) => {
        if (!turn.speaker.trim()) problems.push(`${t.id}[${i}]: empty speaker`);
        if (!turn.text.trim()) problems.push(`${t.id}[${i}]: empty text`);
      });
    }
    expect(problems).toEqual([]);
  });

  it('no turn text speaks a "Speaker:" label aloud — turns.text must be spoken words only', () => {
    // Catches the exact defect that made every existing track (including
    // all 74 Astra-sourced ones) speak "RECEPTIONIST:", "TUTOR:", etc. as
    // part of the audio: turns.speaker is structural metadata, never
    // spoken, so turns.text must never start with a label-like prefix.
    const labelPattern = /^\s*[A-Z][A-Za-z .'-]{0,24}:\s/;
    const problems: string[] = [];
    for (const t of withTurns) {
      t.turns!.forEach((turn, i) => {
        if (labelPattern.test(turn.text)) problems.push(`${t.id}[${i}] ("${turn.speaker}"): text looks like it starts with a spoken label — "${turn.text.slice(0, 30)}..."`);
      });
    }
    expect(problems).toEqual([]);
  });

  it("every turn's text is a verbatim excerpt of the track's transcript (no drift between the two representations)", () => {
    const problems: string[] = [];
    for (const t of withTurns) {
      for (const turn of t.turns!) {
        if (!t.transcript.includes(turn.text)) problems.push(`${t.id}: turn text not found verbatim in transcript — "${turn.text.slice(0, 40)}..."`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('a Section 1 or Section 3 track (conversation/discussion) with turns has more than one distinct speaker', () => {
    const problems: string[] = [];
    for (const t of withTurns) {
      if (t.sectionNumber === 1 || t.sectionNumber === 3) {
        const speakers = new Set(t.turns!.map((turn) => turn.speaker));
        if (speakers.size < 2) problems.push(`${t.id} (section ${t.sectionNumber}): only ${speakers.size} distinct speaker(s) — real IELTS Section 1/3 audio is multi-speaker`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('a Section 2 or Section 4 track (monologue/lecture) with turns has exactly one speaker', () => {
    const problems: string[] = [];
    for (const t of withTurns) {
      if (t.sectionNumber === 2 || t.sectionNumber === 4) {
        const speakers = new Set(t.turns!.map((turn) => turn.speaker));
        if (speakers.size !== 1) problems.push(`${t.id} (section ${t.sectionNumber}): ${speakers.size} distinct speakers — real IELTS Section 2/4 audio is a single speaker`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('every question referencing a turns-based track has a non-empty explanation (a floor bar for "questions authored from the final transcript")', () => {
    const trackIds = new Set(withTurns.map((t) => t.id));
    const problems: string[] = [];
    for (const q of content.allQuestions) {
      if (q.skill === 'listening' && q.listeningTrackId && trackIds.has(q.listeningTrackId) && !q.explanation?.trim()) {
        problems.push(q.id);
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('listening — audio source & licence metadata', () => {
  const withTurns = content.listeningTracks.filter((t) => t.turns && t.turns.length > 0);

  it('every track migrated to structured turns declares an audioSource', () => {
    const missing = withTurns.filter((t) => !t.audioSource);
    expect(missing.map((t) => t.id)).toEqual([]);
  });

  it('every declared audioSource passes licence validation (commercial redistribution allowed, source/licence/attribution present as required)', () => {
    const problems: string[] = [];
    for (const t of withTurns) {
      if (!t.audioSource) continue;
      for (const problem of validateAudioSource(t.audioSource)) problems.push(`${t.id}: ${problem}`);
    }
    expect(problems).toEqual([]);
  });

  it('PACE_BY_SECTION covers every IELTS section number used by real content (1-4)', () => {
    const sectionNumbers = new Set(content.listeningTracks.map((t) => t.sectionNumber));
    for (const n of sectionNumbers) {
      if (n >= 1 && n <= 4) expect(PACE_BY_SECTION[n]).toBeDefined();
    }
  });

  it('pace gets stricter (denser/shorter gaps) from Section 1 to Section 4, matching real IELTS difficulty progression', () => {
    expect(PACE_BY_SECTION[1].gapSeconds).toBeGreaterThan(PACE_BY_SECTION[4].gapSeconds);
  });

  it('every speaker in a local_tts track has a documented persona (accent/age/tone) — a content-quality floor even though the current zero-cost pipeline cannot act on it directly', () => {
    const problems: string[] = [];
    for (const t of withTurns) {
      if (t.audioSource?.kind !== 'local_tts') continue;
      const speakers = new Set(t.turns!.map((turn) => turn.speaker));
      for (const speaker of speakers) {
        if (!t.speakerPersonas?.[speaker]?.trim()) problems.push(`${t.id}: speaker "${speaker}" has no persona in speakerPersonas`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('speakerPersonas never has a stale entry for a speaker that no longer appears in turns', () => {
    const problems: string[] = [];
    for (const t of withTurns) {
      if (!t.speakerPersonas) continue;
      const speakers = new Set(t.turns!.map((turn) => turn.speaker));
      for (const persona of Object.keys(t.speakerPersonas)) {
        if (!speakers.has(persona)) problems.push(`${t.id}: speakerPersonas has a stale entry "${persona}" not in turns`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('the app itself surfaces the CC BY 4.0 attribution required for the VCTK-trained voice (not just source comments)', () => {
    // A CC BY licence's attribution obligation isn't satisfied by a code
    // comment nobody using the app will ever see — this guards against the
    // Help screen's Acknowledgements section (app/help.tsx) being removed
    // or edited to drop the required credit.
    const usesVctkVoice = content.listeningTracks.some((t) => t.audioSource?.provider?.includes('vctk'));
    expect(usesVctkVoice).toBe(true);
    const helpScreenSource = fs.readFileSync(path.join(__dirname, '..', 'app', 'help.tsx'), 'utf8');
    expect(helpScreenSource).toMatch(/VCTK/);
    expect(helpScreenSource).toMatch(/CC BY 4\.0/);
    expect(helpScreenSource).toMatch(/University of Edinburgh/);
  });
});

describe('listening — production audio coverage (no silent regressions to device-TTS fallback)', () => {
  // Tracks that are correctly migrated to `turns` but don't have real
  // generated audio *yet* — scripts/generate-audio.ts (Piper TTS) needs a
  // locally pip-installed `piper` + a downloaded voice model, neither of
  // which this CI/sandbox environment has. This list must only ever
  // shrink: remove an id the moment you've run `npm run audio:generate`
  // locally and committed its .mp3. The 4 proof-of-concept tracks (commit
  // a517120) are already generated, hence not listed. The 44 ids below are
  // the rest of the 48-track production Listening library (see the
  // Listening rollout report) — migrated to `turns`/`audioSource` in this
  // batch, awaiting generation on the developer's Mac. If this list is ever
  // wrong in either direction (a track here already has audio, or a track
  // NOT here is missing audio), a test below fails on purpose.
  const PENDING_AUDIO_GENERATION = new Set<string>([
    // "Booking a Self-Storage Unit" — real-device QA found its two voices
    // sounded almost identical; its old .mp3 was deleted after fixing the
    // speaker assignment (see audioVoiceAssignment.ts/the Listening rollout
    // report) so the Mac generation run produces genuinely distinct voices
    // instead of silently keeping the old, bad-sounding file.
    '30000000-0000-0000-0000-000000000001',
    '31000000-0000-0000-0000-000000000003',
    '31000000-0000-0000-0000-000000000004',
    '31000000-0000-0000-0000-000000000005',
    '31000000-0000-0000-0000-000000000006',
    '32000000-0000-0000-0000-000000000001',
    '32000000-0000-0000-0000-000000000002',
    '32000000-0000-0000-0000-000000000003',
    '32000000-0000-0000-0000-000000000004',
    '33000000-0000-0000-0000-000000000001',
    '33000000-0000-0000-0000-000000000002',
    '33000000-0000-0000-0000-000000000003',
    '33000000-0000-0000-0000-000000000004',
    '34000000-0000-0000-0000-000000000001',
    '34000000-0000-0000-0000-000000000002',
    '34000000-0000-0000-0000-000000000003',
    '34000000-0000-0000-0000-000000000004',
    '34000000-0000-0000-0000-000000000005',
    '34000000-0000-0000-0000-000000000006',
    '34000000-0000-0000-0000-000000000007',
    '34000000-0000-0000-0000-000000000008',
    '34000000-0000-0000-0000-000000000009',
    '34000000-0000-0000-0000-000000000010',
    '34000000-0000-0000-0000-000000000011',
    '34000000-0000-0000-0000-000000000012',
    '35000000-0000-0000-0000-000000000001',
    '35000000-0000-0000-0000-000000000002',
    '35000000-0000-0000-0000-000000000003',
    '35000000-0000-0000-0000-000000000004',
    '35000000-0000-0000-0000-000000000005',
    '35000000-0000-0000-0000-000000000006',
    '35000000-0000-0000-0000-000000000007',
    '35000000-0000-0000-0000-000000000008',
    '35000000-0000-0000-0000-000000000009',
    '35000000-0000-0000-0000-000000000010',
    '35000000-0000-0000-0000-000000000011',
    '35000000-0000-0000-0000-000000000012',
    '36000000-0000-0000-0000-000000000001',
    '36000000-0000-0000-0000-000000000002',
    '36000000-0000-0000-0000-000000000003',
    '36000000-0000-0000-0000-000000000004',
    '36000000-0000-0000-0000-000000000005',
    '36000000-0000-0000-0000-000000000006',
    '36000000-0000-0000-0000-000000000007',
    '36000000-0000-0000-0000-000000000008',
  ]);

  const withTurns = content.listeningTracks.filter((t) => t.turns && t.turns.length > 0);

  it('every turns-based track not on the pending-generation list has real generated/sourced audio (never silently falls back to device TTS)', () => {
    const missing = withTurns.filter((t) => !PENDING_AUDIO_GENERATION.has(t.id) && !audioRegistry[t.id]);
    expect(missing.map((t) => t.id)).toEqual([]);
  });

  it('the pending-generation list only contains tracks that genuinely still lack audio (fails as a reminder once you generate one and forget to remove its id here)', () => {
    const alreadyGenerated = Array.from(PENDING_AUDIO_GENERATION).filter((id) => audioRegistry[id]);
    expect(alreadyGenerated).toEqual([]);
  });

  it('the pending-generation list only references real turns-based tracks (catches stale ids after a rename/removal)', () => {
    const turnsIds = new Set(withTurns.map((t) => t.id));
    const stale = Array.from(PENDING_AUDIO_GENERATION).filter((id) => !turnsIds.has(id));
    expect(stale).toEqual([]);
  });
});

describe('listening — 48-track production library (12 complete IELTS-style Listening tests)', () => {
  // The production set is exactly the tracks migrated to structured `turns`
  // — currently the 48 originally Claude-authored tracks (ids '30xxxxxx'
  // through '36xxxxxx'); the 74 Astra-sourced tracks are deliberately not
  // part of this set yet (see the Listening rollout report on why their
  // pre-existing bundled audio is NOT reused as-is).
  const productionTracks = content.listeningTracks.filter((t) => t.turns && t.turns.length > 0);

  it('has exactly 48 production-quality listening sections', () => {
    expect(productionTracks.length).toBe(48);
  });

  it('is exactly 12 Section 1 + 12 Section 2 + 12 Section 3 + 12 Section 4 (12 complete mock listening tests)', () => {
    const counts = [1, 2, 3, 4].map((n) => productionTracks.filter((t) => t.sectionNumber === n).length);
    expect(counts).toEqual([12, 12, 12, 12]);
  });

  it('every production track has a real audioSource (never left implicitly on-device-TTS)', () => {
    const missing = productionTracks.filter((t) => !t.audioSource).map((t) => t.id);
    expect(missing).toEqual([]);
  });

  it('a multi-speaker production track gets >=2 distinct curated voice categories, not just >=2 distinct IDs (the actual Self-Storage root cause)', () => {
    const problems: string[] = [];
    for (const track of productionTracks) {
      const speakers = Array.from(new Set(track.turns!.map((t) => t.speaker)));
      if (speakers.length < 2) continue;
      const categories = assignSpeakerCategories(track, (speaker) => genderOf(track, speaker));
      const distinctCategories = new Set(Object.values(categories)).size;
      if (distinctCategories !== speakers.length) problems.push(`${track.id} "${track.title}": ${speakers.length} speakers but only ${distinctCategories} distinct categories`);
    }
    expect(problems).toEqual([]);
  });

  it('"Booking a Self-Storage Unit" specifically assigns the Receptionist and Caller contrasting genders (the real-device QA fix)', () => {
    const track = productionTracks.find((t) => t.id === '30000000-0000-0000-0000-000000000001')!;
    expect(track).toBeDefined();
    const genders = Object.fromEntries(Array.from(new Set(track.turns!.map((t) => t.speaker))).map((s) => [s, genderOf(track, s)]));
    expect(genders.Receptionist).not.toBe(genders.Caller);
  });

  it('speaker category assignment is deterministic — the same track always resolves the same way', () => {
    for (const track of productionTracks) {
      const a = assignSpeakerCategories(track, (speaker) => genderOf(track, speaker));
      const b = assignSpeakerCategories(track, (speaker) => genderOf(track, speaker));
      expect(a).toEqual(b);
    }
  });

  it('no turn\'s spoken text leaks a "Speaker:" label into what actually gets synthesized/read aloud', () => {
    const problems: string[] = [];
    for (const track of productionTracks) {
      for (const turn of track.turns!) {
        if (/^[A-Z][A-Z .]*:\s/.test(turn.text)) problems.push(`${track.id}: turn text still has a leaked label: "${turn.text.slice(0, 40)}"`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('no more than 3 same-gender speakers in one track (the curated pool has exactly 3 categories per gender)', () => {
    const problems: string[] = [];
    for (const track of productionTracks) {
      const speakers = Array.from(new Set(track.turns!.map((t) => t.speaker)));
      const counts = { male: 0, female: 0 };
      for (const s of speakers) counts[genderOf(track, s)]++;
      if (counts.male > 3 || counts.female > 3) problems.push(`${track.id}: ${counts.male} male + ${counts.female} female speakers exceeds the 3-per-gender curated pool`);
    }
    expect(problems).toEqual([]);
  });
});

describe('listening — exactly one playback pipeline app-wide (no hidden device-TTS path)', () => {
  const APP_ROOT = path.join(__dirname, '..');
  const SCAN_DIRS = ['app', 'components'];
  // speaking-session.tsx uses expo-speech for a different feature entirely
  // (the AI Speaking Examiner reading its own prompt aloud) — not Listening
  // test audio, so it's an intentional, audited exception.
  const ALLOWED_SPEECH_FILES = new Set([path.join('components', 'testing', 'TranscriptAudioPlayer.tsx'), path.join('app', 'speaking-session.tsx')]);
  const ALLOWED_AUDIO_PLAYER_FILES = new Set([
    path.join('components', 'testing', 'TranscriptAudioPlayer.tsx'),
    // Reads the registry only to report a count — it never plays audio.
    path.join('app', 'dev-health-check.tsx'),
  ]);

  function listSourceFiles(): string[] {
    const files: string[] = [];
    for (const dir of SCAN_DIRS) {
      const abs = path.join(APP_ROOT, dir);
      const walk = (d: string) => {
        for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
          const full = path.join(d, entry.name);
          if (entry.isDirectory()) walk(full);
          else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) files.push(full);
        }
      };
      walk(abs);
    }
    return files;
  }

  it('Speech.speak/expo-speech is only used in the shared TranscriptAudioPlayer fallback and the (unrelated) Speaking examiner screen', () => {
    const offenders: string[] = [];
    for (const file of listSourceFiles()) {
      const rel = path.relative(APP_ROOT, file);
      if (ALLOWED_SPEECH_FILES.has(rel)) continue;
      const text = fs.readFileSync(file, 'utf8');
      if (/expo-speech/.test(text) || /Speech\.speak\(/.test(text)) offenders.push(rel);
    }
    expect(offenders).toEqual([]);
  });

  it('no screen builds its own audio player for a ListeningTrack outside the shared TranscriptAudioPlayer component', () => {
    const offenders: string[] = [];
    for (const file of listSourceFiles()) {
      const rel = path.relative(APP_ROOT, file);
      if (ALLOWED_AUDIO_PLAYER_FILES.has(rel)) continue;
      const text = fs.readFileSync(file, 'utf8');
      if (/from ['"]@\/lib\/content\/audioRegistry['"]/.test(text)) offenders.push(rel);
    }
    expect(offenders).toEqual([]);
  });

  it('every screen that renders listening content does so through TranscriptAudioPlayer (the only two real entry points: the exam-style test screen and free practice)', () => {
    const expected = [path.join('app', 'listening-test.tsx'), path.join('app', 'practice-session.tsx')].sort();
    const actual: string[] = [];
    for (const file of listSourceFiles()) {
      const rel = path.relative(APP_ROOT, file);
      const text = fs.readFileSync(file, 'utf8');
      if (/<TranscriptAudioPlayer\b/.test(text)) actual.push(rel);
    }
    expect(actual.sort()).toEqual(expected);
  });
});

describe('mock tests — IDs are well-formed (catches a bad generated UUID before it ever reaches the database)', () => {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  it('every mock test id is a well-formed UUID', () => {
    const bad = content.mockTests.filter((t) => !UUID_RE.test(t.id));
    expect(bad.map((t) => t.id)).toEqual([]);
  });

  // mock_sections.id is never actually written to the database — the seed
  // generator's insert for this table omits `id` entirely and lets
  // Postgres's own `gen_random_uuid()` default assign it (see
  // scripts/generate-seed-sql.ts) — so a section's TS-side `id` (some of
  // which are readable Astra-merge slugs like "ast-mock-ar-10-reading",
  // not UUIDs) is purely a client-side identifier and can't itself cause a
  // foreign-key violation. `mockTestId`, by contrast, IS inserted as the
  // real `mock_sections.mock_test_id` foreign key value and must be a real
  // UUID matching an actual mock_tests row.
  it('every mock section\'s mockTestId (the actual foreign-key value written to the database) is a well-formed UUID', () => {
    const bad = content.mockSections.filter((s) => !UUID_RE.test(s.mockTestId)).map((s) => `${s.id}: malformed mockTestId "${s.mockTestId}"`);
    expect(bad).toEqual([]);
  });
});

describe('mock tests — structure and uniqueness', () => {
  it('has at least 16 Academic and 16 General Training full mock tests', () => {
    const academic = content.mockTests.filter((t) => t.ieltsType === 'academic');
    const general = content.mockTests.filter((t) => t.ieltsType === 'general');
    expect(academic.length).toBeGreaterThanOrEqual(16);
    expect(general.length).toBeGreaterThanOrEqual(16);
  });

  it('every mock section references a mock test that exists', () => {
    const testIds = new Set(content.mockTests.map((t) => t.id));
    const orphans = content.mockSections.filter((s) => !testIds.has(s.mockTestId));
    expect(orphans.map((s) => s.id)).toEqual([]);
  });

  it('every mock test has all 4 skill sections', () => {
    const bySkillCount = new Map<string, Set<string>>();
    for (const s of content.mockSections) {
      const set = bySkillCount.get(s.mockTestId) ?? new Set<string>();
      set.add(s.skill);
      bySkillCount.set(s.mockTestId, set);
    }
    for (const test of content.mockTests) {
      const skills = bySkillCount.get(test.id) ?? new Set();
      expect(Array.from(skills).sort()).toEqual(['listening', 'reading', 'speaking', 'writing']);
    }
  });

  it('every content reference inside a mock section resolves to real content', () => {
    const passageIds = new Set(content.readingPassages.map((p) => p.id));
    const trackIds = new Set(content.listeningTracks.map((t) => t.id));
    const questionIds = new Set(content.allQuestions.map((q) => q.id));
    const promptIds = new Set(content.writingPrompts.map((p) => p.id));
    const speakingTopicIds = new Set(allSpeakingTopics.map((t) => t.id));

    const problems: string[] = [];
    for (const section of content.mockSections) {
      const ref = section.contentRef;
      for (const id of ref.passageIds ?? []) if (!passageIds.has(id)) problems.push(`${section.id}: bad passageId ${id}`);
      for (const id of ref.trackIds ?? []) if (!trackIds.has(id)) problems.push(`${section.id}: bad trackId ${id}`);
      for (const id of ref.questionIds ?? []) if (!questionIds.has(id)) problems.push(`${section.id}: bad questionId ${id}`);
      for (const id of ref.writingPromptIds ?? []) if (!promptIds.has(id)) problems.push(`${section.id}: bad writingPromptId ${id}`);
      for (const id of ref.speakingTopicIds ?? []) if (!speakingTopicIds.has(id)) problems.push(`${section.id}: bad speakingTopicId ${id}`);
    }
    expect(problems).toEqual([]);
  });

  it('no two mock tests reuse the same reading passage (Reading must always be unique per mock)', () => {
    const owner = new Map<string, string>();
    const collisions: string[] = [];
    for (const section of content.mockSections) {
      for (const id of section.contentRef.passageIds ?? []) {
        const existingOwner = owner.get(id);
        if (existingOwner && existingOwner !== section.mockTestId) collisions.push(`${id} used by both ${existingOwner} and ${section.mockTestId}`);
        owner.set(id, section.mockTestId);
      }
    }
    expect(collisions).toEqual([]);
  });

  it('a listening track or writing prompt is never reused by more than 2 mock tests (real IELTS shares Listening + Task 2 essays between one Academic/General pair only, never across unrelated mocks)', () => {
    const owners = new Map<string, Set<string>>();
    for (const section of content.mockSections) {
      for (const id of [...(section.contentRef.trackIds ?? []), ...(section.contentRef.writingPromptIds ?? [])]) {
        const set = owners.get(id) ?? new Set<string>();
        set.add(section.mockTestId);
        owners.set(id, set);
      }
    }
    const overused = Array.from(owners.entries()).filter(([, mockIds]) => mockIds.size > 2);
    expect(overused.map(([id, mockIds]) => `${id} used by ${mockIds.size} mocks`)).toEqual([]);
  });

  it('has at least one free mock test for each IELTS type', () => {
    const freeAcademic = content.mockTests.some((t) => t.ieltsType === 'academic' && t.isFree);
    const freeGeneral = content.mockTests.some((t) => t.ieltsType === 'general' && t.isFree);
    expect(freeAcademic).toBe(true);
    expect(freeGeneral).toBe(true);
  });
});

describe('speaking — coherent Part1/Part2/Part3 groups', () => {
  it('every group has a Part 1, Part 2, and Part 3 topic', () => {
    const byGroup = new Map<string, Set<string>>();
    for (const t of allSpeakingTopics) {
      const set = byGroup.get(t.groupId) ?? new Set<string>();
      set.add(t.part);
      byGroup.set(t.groupId, set);
    }
    const incomplete = Array.from(byGroup.entries()).filter(([, parts]) => !['part1', 'part2', 'part3'].every((p) => parts.has(p)));
    expect(incomplete.map(([groupId]) => groupId)).toEqual([]);
  });

  it('every Part 2 topic has cue card text and every Part 1/3 topic has questions', () => {
    const problems: string[] = [];
    for (const t of allSpeakingTopics) {
      if (t.part === 'part2' && (!t.cueCardText || t.cueCardText.trim().length < 10)) problems.push(`${t.id}: missing cue card`);
      if (t.part !== 'part2' && (!t.questions || t.questions.length === 0)) problems.push(`${t.id}: missing questions`);
    }
    expect(problems).toEqual([]);
  });
});

describe('vocabulary + grammar — content depth', () => {
  it('has at least 750 vocabulary words across at least 20 topics', () => {
    expect(content.vocabularyWords.length).toBeGreaterThanOrEqual(750);
    expect(content.vocabularyTopics.length).toBeGreaterThanOrEqual(20);
  });

  it('every vocabulary word has a definition, example sentence, and at least one synonym or collocation', () => {
    const problems = content.vocabularyWords.filter(
      (w) => !w.definition?.trim() || !w.exampleSentence?.trim() || (w.synonyms.length === 0 && w.collocations.length === 0),
    );
    expect(problems.map((w) => w.id)).toEqual([]);
  });

  it('has at least 40 grammar lessons and 250 grammar questions', () => {
    expect(content.grammarLessons.length).toBeGreaterThanOrEqual(40);
    expect(content.grammarQuestions.length).toBeGreaterThanOrEqual(250);
  });

  it('every grammar question has a correct answer and an explanation', () => {
    const problems = content.grammarQuestions.filter((q) => !q.correctAnswer?.trim() || !q.explanation?.trim());
    expect(problems.map((q) => q.id)).toEqual([]);
  });

  it('every multiple-choice grammar question has its correct answer among its options', () => {
    const problems = content.grammarQuestions.filter(
      (q) => q.questionType === 'multiple_choice' && q.options && !q.options.includes(q.correctAnswer),
    );
    expect(problems.map((q) => q.id)).toEqual([]);
  });
});

describe('writing prompts — library depth', () => {
  it('meets the minimum count per task/IELTS-type combination', () => {
    const count = (taskType: string, ieltsType: string) =>
      content.writingPrompts.filter((p) => p.taskType === taskType && p.ieltsType === ieltsType).length;
    expect(count('task1_academic', 'academic')).toBeGreaterThanOrEqual(25);
    expect(count('task1_general', 'general')).toBeGreaterThanOrEqual(30);
    expect(content.writingPrompts.filter((p) => p.taskType === 'task2' && p.ieltsType === 'academic').length).toBeGreaterThanOrEqual(50);
    expect(content.writingPrompts.filter((p) => p.taskType === 'task2' && p.ieltsType === 'general').length).toBeGreaterThanOrEqual(50);
  });

  it('every Academic Task 1 prompt with chart data has a renderable chart type', () => {
    const academic1 = content.writingPrompts.filter((p) => p.taskType === 'task1_academic');
    const missingChart = academic1.filter((p) => !p.chartData);
    expect(missingChart.map((p) => p.id)).toEqual([]);
  });
});

describe('audio — every registry entry resolves to a real bundled file', () => {
  const audioDir = path.join(__dirname, '..', 'assets', 'audio');

  it('every audioRegistry entry has a corresponding .mp3 file on disk', () => {
    const missing = Object.keys(audioRegistry).filter((trackId) => !fs.existsSync(path.join(audioDir, `${trackId}.mp3`)));
    expect(missing).toEqual([]);
  });

  it('every audioRegistry key is a real listening track id (no stale/orphaned entries)', () => {
    const trackIds = new Set(allListeningTracks.map((t) => t.id));
    const orphanKeys = Object.keys(audioRegistry).filter((id) => !trackIds.has(id));
    expect(orphanKeys).toEqual([]);
  });

  it('has at least 70 listening tracks backed by real generated audio (not just TTS fallback)', () => {
    expect(Object.keys(audioRegistry).length).toBeGreaterThanOrEqual(70);
  });

  it('every .mp3 file physically present under assets/audio is registered under some track id (no orphan files)', () => {
    const files = fs.readdirSync(audioDir).filter((f) => f.endsWith('.mp3'));
    const registered = new Set(Object.keys(audioRegistry));
    const orphanFiles = files.filter((f) => !registered.has(f.replace(/\.mp3$/, '')));
    expect(orphanFiles).toEqual([]);
  });
});

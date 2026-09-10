// Generates real, multi-speaker listening-test audio entirely offline and
// for free, using Piper TTS (a local neural text-to-speech engine) and one
// specific voice model whose licence was verified for commercial
// redistribution — see the header comment on PIPER_VOICE below and the
// Listening overhaul report for the full audit.
//
//   npm run audio:generate
//
// Zero cost, zero API key, zero network call at generation time, zero
// recurring bill: this script never talks to any TTS provider (OpenAI,
// ElevenLabs, Azure, Google, or otherwise), and — unlike an earlier version
// of this pipeline — it does NOT use macOS's built-in `say` voices either.
// Apple's macOS Software License Agreement permits System Voices for
// "personal, non-commercial use" only and explicitly bars "recording,
// publishing or redistribution... in a profit, non-profit, public sharing
// or commercial context," so they can never be used for this app's shipped
// content regardless of cost.
//
// Piper is used instead — but read this carefully, because "Piper" no
// longer means one single licence. As of this pipeline, `pip install
// piper-tts` installs from OHF-Voice/piper1-gpl, licensed GPL-3.0-or-later
// (confirmed directly against PyPI's own licence field for the current
// release — the original rhasspy/piper engine was MIT, but that repo was
// archived in October 2025 and is no longer what this package installs).
// This script uses that GPL-3.0 engine ONLY as an arm's-length, offline,
// dev-time CLI tool — invoked once per turn via a plain subprocess call,
// exactly like calling `ffmpeg` or a compiler, never imported, linked, or
// bundled into the Bandpath app itself. Per the FSF's own GPL FAQ (the
// long-settled "can I use GCC to compile a nonfree program" answer: yes,
// because a tool's licence does not extend to its output, unless the tool
// literally copies its own copyrighted source into that output — which
// Piper does not do; the generated waveform encodes the input text and the
// voice *model's* learned parameters, not Piper's engine source code),
// using the engine this way creates no GPL obligation on either this
// repository's source code or the generated .mp3 files. What actually
// governs the generated audio's licence is the voice *model* file, which
// is licensed independently of the engine — see the audit below and the
// Listening overhaul report for the full reasoning and a documented
// zero-ambiguity fallback (eSpeak NG) if you want to avoid even this
// well-established interpretation.
//
// Prerequisites (all free, one-time, documented in README.md):
//   pip install piper-tts
//   python3 -m piper.download_voices --data-dir .piper-voices en_GB-vctk-medium
//
// Only tracks that have been migrated to structured `turns` (see
// types/models.ts's ListeningTrack.turns) and whose audioSource.kind is
// 'local_tts' are synthesized here — a track without `turns`, or one
// marked 'human_corpus' (a reused real recording placed manually), is
// skipped outright. Every listening track already works without
// pre-generated audio: the app falls back to real, audible on-device
// text-to-speech (components/testing/TranscriptAudioPlayer.tsx) for any
// track with no registered audio file.
//
// How a multi-speaker track is built:
//   1. Each turn is synthesized as its own Piper call, using only that
//      turn's spoken words — never a "Speaker:" label (turns.speaker is
//      structural metadata, not something that gets read aloud).
//   2. en_GB-vctk-medium is a multi-speaker model (~109 speaker ids, one
//      .onnx file) trained on the VCTK Corpus, which deliberately spans many
//      different English/Scottish/Irish/international accents and both
//      genders — but two arbitrary ids are NOT guaranteed to sound
//      distinguishable (real-device QA on "Booking a Self-Storage Unit"
//      found two ids that sounded almost identical). So this script doesn't
//      just avoid reusing an id: it works from a small curated set of named
//      VCTK speakers, deliberately spread across documented genders and
//      accent groups, modelled as 6 categories (femaleA/B/C, maleA/B/C —
//      see lib/content/audioVoiceAssignment.ts). Each track's speakers are
//      assigned to categories deterministically (by gender, inferred from
//      that speaker's persona text, with contrasting genders preferred for
//      a 2-person dialogue); each category is then resolved to a real
//      numeric Piper speaker id from THIS installed model's own
//      speaker_id_map (see resolveSpeakerCategories below), so re-runs are
//      stable and the curation stays correct even if the exact ordinal id
//      for a given VCTK speaker differs between voice-pack versions.
//   3. Pace (Piper's --length_scale) and the silence gap between turns both
//      come from lib/content/listeningPace.ts, keyed by sectionNumber —
//      Section 1 is slower with longer pauses, Section 4 is denser and more
//      continuous, matching real IELTS difficulty progression. Piper has no
//      equivalent of a natural-language style/emotion parameter, so pace is
//      the one lever this pipeline controls (see the Listening overhaul
//      report for the honest quality trade-off this implies).
//   4. The per-turn WAV clips are decoded and concatenated with that
//      silence gap in a single ffmpeg filter-graph pass (not the concat
//      demuxer, so mismatched sample rates/formats are never an issue) and
//      mixed down to one mp3. ffmpeg is a hard requirement (`brew install
//      ffmpeg`).
//
// PIPER_VOICE (env-configurable, default en_GB-vctk-medium) — licence audit,
// three layers, checked separately (never assume one layer's licence tells
// you anything about another):
//   - Piper engine software (what `pip install piper-tts` installs today):
//     GPL-3.0-or-later, OHF-Voice/piper1-gpl. Used only as an offline
//     dev-time CLI tool — see the header comment above for why that
//     creates no obligation on this repo's source or the generated audio.
//   - This voice model file: MIT, per its own MODEL_CARD on
//     https://huggingface.co/rhasspy/piper-voices — commercial use and
//     redistribution of generated audio both explicitly permitted. This is
//     independent of the engine's licence above; it did not change when
//     the engine relicensed.
//   - Underlying training data: the VCTK Corpus (University of Edinburgh,
//     CSTR), licensed CC BY 4.0 — also permits commercial use, but requires
//     attribution, which is why this app's content carries an explicit
//     `attribution` string wherever this voice is used (see
//     lib/content/listening.ts/listening2.ts's audioSource fields and
//     lib/content/audioLicense.ts, which validates it's actually present).
// Swap PIPER_VOICE for a different model only after repeating this same
// three-layer check (engine AND voice-model AND underlying-data licence) —
// never assume a voice is commercial-safe just because Piper itself is, and
// never assume a MIT-labeled model means the engine is MIT too (it isn't).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { content } from '../lib/content';
import { assignSpeakerCategories, CURATED_VCTK_SPEAKERS, genderOf, SPEAKER_CATEGORIES, type SpeakerCategory, type SpeakerGender } from '../lib/content/audioVoiceAssignment';
import { paceForSection } from '../lib/content/listeningPace';
import type { ListeningTrack } from '../types/models';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'assets', 'audio');
const REGISTRY_PATH = path.join(ROOT, 'lib', 'content', 'audioRegistry.ts');
const TMP_DIR = path.join(os.tmpdir(), 'ielts-prep-audio-gen');
const SAMPLE_RATE = 22050; // piper-voices/en_GB/vctk's native rate

const PIPER_VOICE = process.env.PIPER_VOICE || 'en_GB-vctk-medium';
const PIPER_VOICE_DIR = process.env.PIPER_VOICE_DIR || path.join(ROOT, '.piper-voices');

function hasFfmpeg(): boolean {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function hasPiper(): boolean {
  try {
    execFileSync('piper', ['--help'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/** Resolves each of the 6 curated speaker categories (femaleA/B/C,
 * maleA/B/C — see audioVoiceAssignment.ts) to an actual numeric Piper
 * speaker id, for THIS specific installed voice model. Three sources are
 * tried in order, so an imprecise curated guess never breaks generation:
 *   1. An explicit override: `PIPER_SPEAKER_<CATEGORY_SNAKE_UPPER>` (e.g.
 *      `PIPER_SPEAKER_FEMALE_A=p228`), for after you've actually listened
 *      and want to swap one category's voice without touching code.
 *   2. The curated VCTK speaker *name* for that category, looked up in this
 *      model's own `speaker_id_map` (name -> numeric id) — correct for
 *      whatever exact voice-pack build is actually installed, regardless of
 *      whether the curated name/accent documentation is 100% precise.
 *   3. A safe fallback: an evenly-spread numeric id, so every category still
 *      resolves to *something* even if this model's config has no named
 *      map at all (older/smaller Piper voice packs sometimes don't) or the
 *      curated name isn't present in it. Prints a warning either way, since
 *      the deliberate cross-accent contrast this pipeline exists for is
 *      weaker in the fallback case. */
function resolveSpeakerCategories(configPath: string): Record<SpeakerCategory, string> {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const speakerIdMap: Record<string, number> | undefined = config.speaker_id_map;
  const numSpeakers: number = config.num_speakers ?? (speakerIdMap ? Object.keys(speakerIdMap).length : 1);

  const envVarName = (category: SpeakerCategory) => `PIPER_SPEAKER_${category.replace(/([a-z])([A-Z])/, '$1_$2').toUpperCase()}`;

  const resolved = {} as Record<SpeakerCategory, string>;
  SPEAKER_CATEGORIES.forEach((category, i) => {
    const override = process.env[envVarName(category)];
    if (override) {
      resolved[category] = speakerIdMap?.[override] !== undefined ? String(speakerIdMap[override]) : override;
      console.log(`  ${category}: using override ${envVarName(category)}=${override} -> speaker id ${resolved[category]}`);
      return;
    }
    const curatedName = CURATED_VCTK_SPEAKERS[category];
    if (speakerIdMap && speakerIdMap[curatedName] !== undefined) {
      resolved[category] = String(speakerIdMap[curatedName]);
      console.log(`  ${category}: curated VCTK speaker ${curatedName} -> speaker id ${resolved[category]}`);
      return;
    }
    // Fallback: evenly spread across the model's real speaker count, one
    // slot per category, so distinct categories are at least maximally far
    // apart in id-space even without named/accent curation.
    const fallbackId = numSpeakers <= 1 ? 0 : Math.floor((i * numSpeakers) / SPEAKER_CATEGORIES.length);
    resolved[category] = String(fallbackId);
    console.log(
      `  ${category}: curated speaker "${curatedName}" not found in this model's speaker_id_map${speakerIdMap ? '' : ' (model has no named speaker map)'} — falling back to evenly-spread speaker id ${fallbackId}. Listen carefully; override with ${envVarName(category)}=<name-or-id> if needed.`,
    );
  });
  return resolved;
}

function synthesizePiper(text: string, modelPath: string, speakerId: string, lengthScale: number, outPath: string): void {
  // -s is always passed, even for a single-speaker model (id '0') — Piper
  // accepts it as a no-op there, and it keeps this call site uniform.
  const args = ['-m', modelPath, '-s', speakerId, '--length_scale', String(lengthScale), '-f', outPath];
  execFileSync('piper', args, { input: text, stdio: ['pipe', 'ignore', 'ignore'] });
}

/** Decodes every segment (and a shared silence clip between each) in one
 * ffmpeg filter-graph pass and mixes down to a single mp3. Each input is
 * independently reformatted to a common sample rate/channel layout before
 * concatenation, so it doesn't matter that Piper's WAV output and the
 * generated silence clip aren't byte-identical in format. */
function concatWithFfmpeg(segmentPaths: string[], outPath: string, gapSeconds: number): void {
  const silencePath = path.join(TMP_DIR, `silence-${gapSeconds}.wav`);
  if (!fs.existsSync(silencePath)) {
    execFileSync('ffmpeg', ['-y', '-f', 'lavfi', '-i', `anullsrc=r=${SAMPLE_RATE}:cl=mono`, '-t', String(gapSeconds), silencePath], { stdio: 'ignore' });
  }
  const files: string[] = [];
  segmentPaths.forEach((p, i) => {
    files.push(p);
    if (i < segmentPaths.length - 1) files.push(silencePath);
  });
  const inputArgs = files.flatMap((f) => ['-i', f]);
  const formatChains = files.map((_, i) => `[${i}:a]aformat=sample_rates=${SAMPLE_RATE}:channel_layouts=mono[a${i}]`);
  const concatInputs = files.map((_, i) => `[a${i}]`).join('');
  const filter = `${formatChains.join(';')};${concatInputs}concat=n=${files.length}:v=0:a=1[out]`;
  execFileSync('ffmpeg', ['-y', ...inputArgs, '-filter_complex', filter, '-map', '[out]', '-c:a', 'libmp3lame', '-b:a', '64k', outPath], { stdio: 'ignore' });
}

function speakerIdsForTrack(track: ListeningTrack, categoryToSpeakerId: Record<SpeakerCategory, string>): Record<string, string> {
  const categories = assignSpeakerCategories(track, (speaker) => genderOf(track, speaker));
  const speakers: Record<string, string> = {};
  for (const [speaker, category] of Object.entries(categories)) speakers[speaker] = categoryToSpeakerId[category];
  return speakers;
}

function generateTrack(track: ListeningTrack, modelPath: string, categoryToSpeakerId: Record<SpeakerCategory, string>): void {
  const turns = track.turns!;
  const speakers = speakerIdsForTrack(track, categoryToSpeakerId);
  const pace = paceForSection(track.sectionNumber);
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const segmentPaths: string[] = [];
  try {
    turns.forEach((turn, i) => {
      const speakerId = speakers[turn.speaker];
      const segPath = path.join(TMP_DIR, `${track.id}__${i}.wav`);
      synthesizePiper(turn.text, modelPath, speakerId, pace.piperLengthScale, segPath);
      segmentPaths.push(segPath);
    });
    const outPath = path.join(ASSETS_DIR, `${track.id}.mp3`);
    concatWithFfmpeg(segmentPaths, outPath, pace.gapSeconds);
  } finally {
    for (const p of segmentPaths) fs.rmSync(p, { force: true });
  }
}

/** Rebuilds the registry from what's actually on disk (rather than what
 * this run happened to generate), so tracks generated in a previous run —
 * including the 74 Astra-sourced tracks copied in during the content merge
 * — are never dropped just because this run didn't touch them. */
function writeRegistry(): number {
  const files = fs.existsSync(ASSETS_DIR) ? fs.readdirSync(ASSETS_DIR).filter((f) => f.endsWith('.mp3')) : [];
  const trackIds = new Set(content.listeningTracks.map((t) => t.id));
  const ids = files
    .map((f) => f.replace(/\.mp3$/, ''))
    .filter((id) => trackIds.has(id))
    .sort();
  const lines = ids.map((id) => `  '${id}': require('../../assets/audio/${id}.mp3'),`);
  const body = `// AUTO-GENERATED by scripts/generate-audio.ts — do not hand-edit; re-run the
// script instead. Maps a listening_tracks id to a bundled local audio asset.
// Rebuilt from the .mp3 files actually present under assets/audio/ on every
// run, so it never drops an entry just because that track wasn't
// regenerated this time. Metro requires local asset paths to be static
// string literals, so this file is rewritten in full on every run.
export const audioRegistry: Record<string, number> = {
${lines.join('\n')}
};
`;
  fs.writeFileSync(REGISTRY_PATH, body);
  return ids.length;
}

function main() {
  if (!hasFfmpeg()) {
    console.log('ffmpeg is required (used to add pauses between turns and mix down to mp3).');
    console.log('Install it with `brew install ffmpeg` and re-run.');
    return;
  }
  if (!hasPiper()) {
    console.log('The `piper` command was not found. Install it with:');
    console.log('  pip install piper-tts');
    console.log('(or `pipx install piper-tts` for an isolated install), then re-run.');
    return;
  }

  const modelPath = path.join(PIPER_VOICE_DIR, `${PIPER_VOICE}.onnx`);
  const configPath = path.join(PIPER_VOICE_DIR, `${PIPER_VOICE}.onnx.json`);
  if (!fs.existsSync(modelPath) || !fs.existsSync(configPath)) {
    console.log(`Voice model not found at ${path.relative(ROOT, modelPath)}.`);
    console.log(`Download it with:\n  python3 -m piper.download_voices --data-dir ${path.relative(ROOT, PIPER_VOICE_DIR)} ${PIPER_VOICE}`);
    return;
  }

  console.log(`Using voice "${PIPER_VOICE}" — resolving curated speaker categories:`);
  const categoryToSpeakerId = resolveSpeakerCategories(configPath);

  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  const withTurns = content.listeningTracks.filter((t) => t.turns && t.turns.length > 0);
  const humanCorpus = withTurns.filter((t) => t.audioSource?.kind === 'human_corpus');
  const localTts = withTurns.filter((t) => t.audioSource?.kind !== 'human_corpus');
  const legacyCount = content.listeningTracks.length - withTurns.length;
  let generated = 0;
  let failed = 0;

  if (humanCorpus.length > 0) {
    console.log(`${humanCorpus.length} track(s) are marked audioSource.kind: 'human_corpus' — skipped here, their .mp3 must be placed manually.`);
  }

  for (const track of localTts) {
    const outPath = path.join(ASSETS_DIR, `${track.id}.mp3`);
    if (fs.existsSync(outPath)) {
      console.log(`Already generated: ${track.title}`);
      continue;
    }
    const speakerNames = Array.from(new Set(track.turns!.map((t) => t.speaker)));
    const perGenderCount = speakerNames.reduce<Record<SpeakerGender, number>>((acc, s) => ({ ...acc, [genderOf(track, s)]: acc[genderOf(track, s)] + 1 }), { male: 0, female: 0 });
    if (perGenderCount.male > 3 || perGenderCount.female > 3) {
      failed++;
      console.error(`  Failed "${track.title}": needs ${perGenderCount.male} male + ${perGenderCount.female} female distinct voices, but only 3 curated categories exist per gender.`);
      continue;
    }
    const speakers = speakerIdsForTrack(track, categoryToSpeakerId);
    const categories = assignSpeakerCategories(track, (speaker) => genderOf(track, speaker));
    console.log(`Generating "${track.title}" (${track.turns!.length} turns) — ${speakerNames.map((s) => `${s}: ${categories[s]} (speaker id ${speakers[s]})`).join(', ')}`);
    try {
      generateTrack(track, modelPath, categoryToSpeakerId);
      generated++;
      console.log(`  Saved ${path.relative(ROOT, outPath)}`);
    } catch (err) {
      failed++;
      console.error(`  Failed: ${(err as Error).message}`);
    }
  }

  const totalRegistered = writeRegistry();
  console.log(`\n${generated} track(s) newly generated this run${failed ? ` (${failed} failed)` : ''}. $0 spent — this script never calls a paid API.`);
  console.log(`${totalRegistered}/${content.listeningTracks.length} listening tracks now have real generated audio.`);
  console.log(`${legacyCount} track(s) have no structured \`turns\` yet and were skipped (still on-device TTS fallback) — migrate them to \`turns\` before they can be regenerated here.`);
  console.log(`Wrote ${path.relative(ROOT, REGISTRY_PATH)}.`);
}

main();

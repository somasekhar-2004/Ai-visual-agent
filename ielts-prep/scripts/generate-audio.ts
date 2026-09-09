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
// content regardless of cost. Piper is used instead: an MIT-licensed local
// TTS engine, with a voice model whose own licence was checked separately
// (see below) and explicitly permits commercial use.
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
//      .onnx file) trained on the VCTK Corpus, which deliberately spans
//      many different British/Irish English accents and both genders — so
//      distinct speaker ids sound genuinely different. This script reads
//      the model's own config (.onnx.json) to find how many speakers it
//      has, then picks an evenly-spread subset and assigns one to each
//      unique speaker in a track deterministically
//      (lib/content/audioVoiceAssignment.ts), so re-runs are stable.
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
// PIPER_VOICE (env-configurable, default en_GB-vctk-medium) — licence audit:
//   - Piper engine software: MIT (rhasspy/piper / piper-tts on PyPI).
//   - This voice model file: MIT, per its own MODEL_CARD on
//     https://huggingface.co/rhasspy/piper-voices — commercial use and
//     redistribution of generated audio both explicitly permitted.
//   - Underlying training data: the VCTK Corpus (University of Edinburgh,
//     CSTR), licensed CC BY 4.0 — also permits commercial use, but requires
//     attribution, which is why this app's content carries an explicit
//     `attribution` string wherever this voice is used (see
//     lib/content/listening.ts/listening2.ts's audioSource fields and
//     lib/content/audioLicense.ts, which validates it's actually present).
// Swap PIPER_VOICE for a different model only after repeating this same
// two-layer check (engine AND voice-model AND underlying-data licence) —
// never assume a voice is commercial-safe just because Piper itself is.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { content } from '../lib/content';
import { assignVoices } from '../lib/content/audioVoiceAssignment';
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
const MAX_SPEAKERS_TO_USE = 12; // an evenly-spread subset of the model's full speaker range

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

/** Reads the voice model's own config to find how many speakers it has,
 * rather than hardcoding a number that could silently go stale if the
 * model file is swapped. Returns a small, evenly-spread subset of speaker
 * ids as strings (e.g. ['0','9','18',...]) — we can't listen to samples
 * from this script, so rather than guess which ones "sound best," this
 * spreads picks across the full range, and VCTK's own deliberate accent/
 * gender diversity does the rest. */
function loadSpeakerPool(configPath: string): string[] {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const numSpeakers: number = config.num_speakers ?? (config.speaker_id_map ? Object.keys(config.speaker_id_map).length : 1);
  if (numSpeakers <= 1) return ['0'];
  const count = Math.min(numSpeakers, MAX_SPEAKERS_TO_USE);
  const step = numSpeakers / count;
  return Array.from({ length: count }, (_, i) => String(Math.floor(i * step)));
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

function generateTrack(track: ListeningTrack, modelPath: string, speakerPool: string[]): void {
  const turns = track.turns!;
  const speakers = assignVoices(track, speakerPool);
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

  const speakerPool = loadSpeakerPool(configPath);
  console.log(`Using voice "${PIPER_VOICE}" with ${speakerPool.length} speaker id(s): ${speakerPool.join(', ')}`);

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
    if (speakerNames.length > speakerPool.length) {
      failed++;
      console.error(`  Failed "${track.title}": needs ${speakerNames.length} distinct voices but only ${speakerPool.length} are configured (MAX_SPEAKERS_TO_USE).`);
      continue;
    }
    const speakers = assignVoices(track, speakerPool);
    console.log(`Generating "${track.title}" (${track.turns!.length} turns) — ${speakerNames.map((s) => `${s}: speaker ${speakers[s]}`).join(', ')}`);
    try {
      generateTrack(track, modelPath, speakerPool);
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

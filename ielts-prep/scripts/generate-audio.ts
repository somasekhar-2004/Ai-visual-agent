// Generates real, multi-speaker listening-test audio entirely offline and
// for free, using macOS's built-in `say` command.
//
//   npm run audio:generate
//
// Zero cost, zero API key, zero network call, zero recurring bill: this
// script never talks to any TTS provider (OpenAI, ElevenLabs, Azure,
// Google, or otherwise). It only shells out to two things already free on
// a Mac: `say` (speech synthesis, built into macOS) and `ffmpeg` (audio
// mixing — a one-time `brew install ffmpeg`, itself free and open source).
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
//   1. Each turn is synthesized as its own `say` call, using only that
//      turn's spoken words — never a "Speaker:" label (turns.speaker is
//      structural metadata, not something that gets read aloud).
//   2. This machine's actually-installed English voices are discovered at
//      run time via `say -v ?` (exact voice names vary by macOS version and
//      which ones you've downloaded, so nothing here is hardcoded). Each
//      unique speaker in a track gets a distinct one, assigned
//      deterministically (lib/content/audioVoiceAssignment.ts) so re-runs
//      are stable. Voices tagged "(Premium)"/"(Enhanced)" by macOS are
//      preferred — they're the more natural-sounding neural voices Apple
//      ships, vs. the older compact ones.
//   3. Speech rate (`say -r <wpm>`) and the silence gap between turns both
//      come from lib/content/listeningPace.ts, keyed by sectionNumber —
//      Section 1 is slower with longer pauses, Section 4 is denser and more
//      continuous, matching real IELTS difficulty progression. `say` has no
//      equivalent of a natural-language style/emotion parameter, so pace is
//      the one lever this pipeline controls (see the Listening overhaul
//      report for the honest quality trade-off this implies).
//   4. The per-turn clips are decoded and concatenated with that silence gap
//      in a single ffmpeg pass (an audio filter graph, not the concat
//      demuxer, so mismatched sample rates/formats between segments are
//      never an issue) and mixed down to one mp3. ffmpeg is a hard
//      requirement for this script (install with `brew install ffmpeg`) —
//      `say`'s AIFF output can't be naively byte-concatenated the way MP3
//      frames sometimes can, so there is no ffmpeg-less fallback path here.
//
// This only runs on macOS (`say` is a macOS-only command). See README.md's
// "Listening audio generation" section for what to use instead on other
// platforms (e.g. Piper TTS, also free and open source, not wired up here).
//
// Re-running this script never re-synthesizes a track that already has an
// assets/audio/<id>.mp3 file — delete that file first if you want to
// regenerate it (e.g. after editing its `turns`).
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
const SAMPLE_RATE = 24000;

function hasFfmpeg(): boolean {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/** Parses `say -v ?` output — one voice per line, formatted roughly as
 * "Name (Quality)   locale    # sample text". Returns only English
 * voices (our content is English), ranked so macOS's higher-quality
 * "(Premium)"/"(Enhanced)" voices are picked first. */
function discoverEnglishVoices(): string[] {
  const out = execFileSync('say', ['-v', '?'], { encoding: 'utf8' });
  const voices: { name: string; locale: string }[] = [];
  for (const line of out.split('\n')) {
    const m = line.match(/^(.+?)\s{2,}([a-zA-Z]{2}[_-][a-zA-Z]{2})\s+#/);
    if (m) voices.push({ name: m[1].trim(), locale: m[2] });
  }
  const english = voices.filter((v) => /^en[_-]/i.test(v.locale));
  const rank = (name: string) => (/\(premium\)/i.test(name) ? 0 : /\(enhanced\)/i.test(name) ? 1 : 2);
  return [...english].sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name)).map((v) => v.name);
}

function synthesizeSay(text: string, voice: string, rateWpm: number, outPath: string): void {
  execFileSync('say', ['-v', voice, '-r', String(rateWpm), '-o', outPath, text], { stdio: 'ignore' });
}

/** Decodes every segment (and a shared silence clip between each) in one
 * ffmpeg filter-graph pass and mixes down to a single mp3. Each input is
 * independently reformatted to a common sample rate/channel layout before
 * concatenation, so it doesn't matter that `say`'s AIFF output and the
 * generated silence clip aren't byte-identical in format. */
function concatWithFfmpeg(segmentPaths: string[], outPath: string, gapSeconds: number): void {
  const silencePath = path.join(TMP_DIR, `silence-${gapSeconds}.aiff`);
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

function generateTrack(track: ListeningTrack, voicePool: string[]): void {
  const turns = track.turns!;
  const voices = assignVoices(track, voicePool);
  const pace = paceForSection(track.sectionNumber);
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const segmentPaths: string[] = [];
  try {
    turns.forEach((turn, i) => {
      const voice = voices[turn.speaker];
      const segPath = path.join(TMP_DIR, `${track.id}__${i}.aiff`);
      synthesizeSay(turn.text, voice, pace.sayRateWpm, segPath);
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
  if (process.platform !== 'darwin') {
    console.log("This script only supports macOS — it uses the built-in `say` command for zero-cost local speech synthesis.");
    console.log('See README.md "Listening audio generation" for cross-platform alternatives (e.g. Piper TTS, not wired up here).');
    return;
  }
  if (!hasFfmpeg()) {
    console.log('ffmpeg is required (used to add pauses between turns and mix down to mp3).');
    console.log('Install it with `brew install ffmpeg` and re-run.');
    return;
  }

  const voicePool = discoverEnglishVoices();
  if (voicePool.length === 0) {
    console.log('No English voices found via `say -v ?`.');
    console.log('Add one in System Settings > Accessibility > Spoken Content > System Voice, then re-run.');
    return;
  }
  console.log(`Found ${voicePool.length} English voice(s) installed: ${voicePool.join(', ')}`);

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
    const speakers = Array.from(new Set(track.turns!.map((t) => t.speaker)));
    if (speakers.length > voicePool.length) {
      failed++;
      console.error(`  Failed "${track.title}": needs ${speakers.length} distinct voices but only ${voicePool.length} English voice(s) are installed.`);
      continue;
    }
    const voices = assignVoices(track, voicePool);
    console.log(`Generating "${track.title}" (${track.turns!.length} turns) — ${speakers.map((s) => `${s}: ${voices[s]}`).join(', ')}`);
    try {
      generateTrack(track, voicePool);
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

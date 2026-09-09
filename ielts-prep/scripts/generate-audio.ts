// Generates real, multi-speaker listening-test audio from OpenAI's TTS API.
//
//   npm run audio:generate
//
// Requires OPENAI_API_KEY in .env (a plain dev-machine secret — this is a
// one-off local script, not part of the app bundle or the server-side Edge
// Functions, so it does not use the EXPO_PUBLIC_ prefix or the Supabase
// secrets store; see supabase/functions/.env.example for the *runtime* key
// the Edge Functions use). Without it, this prints instructions and exits
// without changing anything.
//
// Only tracks that have been migrated to structured `turns` (see
// types/models.ts's ListeningTrack.turns) are synthesized — a track without
// `turns` is skipped outright, on purpose, so this never blindly regenerates
// every listening section at once. Every listening track already works
// without pre-generated audio: the app falls back to real, audible
// on-device text-to-speech (components/testing/TranscriptAudioPlayer.tsx)
// for any track with no registered audio file. Running this script upgrades
// migrated tracks to pre-rendered, natural, multi-voice audio.
//
// How a multi-speaker track is built:
//   1. Each turn is synthesized as its own TTS request, using only that
//      turn's spoken words — never a "Speaker:" label (turns.speaker is
//      structural metadata, not something that gets read aloud).
//   2. Each unique speaker in a track gets a distinct OpenAI voice, assigned
//      deterministically from VOICE_POOL so re-runs are stable.
//   3. The per-turn clips are concatenated with a short silence gap between
//      them (via ffmpeg, if installed) for natural pacing between speaker
//      turns and paragraph breaks. Install it once with `brew install
//      ffmpeg` on macOS. Without ffmpeg, clips are still concatenated (raw
//      MPEG frame concatenation) but with no gap — the script prints a
//      warning so this is never silently degraded.
//
// Re-running this script never re-synthesizes a track that already has an
// assets/audio/<id>.mp3 file — delete that file first if you want to
// regenerate it (e.g. after editing its `turns`).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

import { content } from '../lib/content';
import { assignVoices } from '../lib/content/audioVoiceAssignment';
import type { ListeningTrack } from '../types/models';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ASSETS_DIR = path.join(ROOT, 'assets', 'audio');
const REGISTRY_PATH = path.join(ROOT, 'lib', 'content', 'audioRegistry.ts');
const TMP_DIR = path.join(os.tmpdir(), 'ielts-prep-audio-gen');

dotenv.config({ path: path.join(ROOT, '.env') });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'tts-1';
const GAP_SECONDS = 0.55;
const TTS_SAMPLE_RATE = 24000;

function hasFfmpeg(): boolean {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function synthesizeOpenAI(text: string, voice: string): Promise<Buffer> {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: OPENAI_TTS_MODEL, voice, input: text, response_format: 'mp3' }),
  });
  if (!res.ok) throw new Error(`OpenAI TTS request failed: ${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

function shellQuote(p: string): string {
  return `'${p.replace(/'/g, "'\\''")}'`;
}

/** Concatenates per-turn clips with a silence gap between each, via
 * ffmpeg's concat demuxer. Re-encodes (rather than stream-copying) so the
 * shared, separately-generated silence clip never has to match the TTS
 * output's exact frame parameters. */
function concatWithFfmpeg(segmentPaths: string[], outPath: string): void {
  const silencePath = path.join(TMP_DIR, 'silence.mp3');
  if (!fs.existsSync(silencePath)) {
    execFileSync(
      'ffmpeg',
      ['-y', '-f', 'lavfi', '-i', `anullsrc=r=${TTS_SAMPLE_RATE}:cl=mono`, '-t', String(GAP_SECONDS), '-c:a', 'libmp3lame', '-q:a', '6', silencePath],
      { stdio: 'ignore' },
    );
  }
  const listPath = path.join(TMP_DIR, `concat-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);
  const lines: string[] = [];
  segmentPaths.forEach((p, i) => {
    lines.push(`file ${shellQuote(p)}`);
    if (i < segmentPaths.length - 1) lines.push(`file ${shellQuote(silencePath)}`);
  });
  fs.writeFileSync(listPath, lines.join('\n'));
  execFileSync('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-ar', String(TTS_SAMPLE_RATE), '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '64k', outPath], {
    stdio: 'ignore',
  });
  fs.rmSync(listPath, { force: true });
}

/** ID3v2 header is 10 bytes; the size field (bytes 6-9) is a 4-byte
 * "synchsafe" integer (7 usable bits per byte). */
function stripId3(buf: Buffer): Buffer {
  if (buf.length > 10 && buf.subarray(0, 3).toString('latin1') === 'ID3') {
    const size = ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) | ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);
    return buf.subarray(10 + size);
  }
  return buf;
}

/** No-ffmpeg fallback: raw concatenation of MPEG frames with no silence
 * gap between turns. MP3 decoders play back-to-back frames fine, but pacing
 * is worse than the ffmpeg path (no pause at all between speaker turns) —
 * callers must warn the user this happened. */
function concatRaw(segmentPaths: string[], outPath: string): void {
  const buffers = segmentPaths.map((p, i) => (i === 0 ? fs.readFileSync(p) : stripId3(fs.readFileSync(p))));
  fs.writeFileSync(outPath, Buffer.concat(buffers));
}

async function generateTrack(track: ListeningTrack, ffmpegAvailable: boolean): Promise<void> {
  const turns = track.turns!;
  const voices = assignVoices(track);
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const segmentPaths: string[] = [];
  try {
    for (let i = 0; i < turns.length; i++) {
      const turn = turns[i];
      const voice = voices[turn.speaker];
      const segPath = path.join(TMP_DIR, `${track.id}__${i}.mp3`);
      const audio = await synthesizeOpenAI(turn.text, voice);
      fs.writeFileSync(segPath, audio);
      segmentPaths.push(segPath);
    }
    const outPath = path.join(ASSETS_DIR, `${track.id}.mp3`);
    if (ffmpegAvailable) concatWithFfmpeg(segmentPaths, outPath);
    else concatRaw(segmentPaths, outPath);
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

async function main() {
  if (!OPENAI_API_KEY) {
    console.log('No OPENAI_API_KEY set — nothing to generate.');
    console.log('Add it to .env with a real OpenAI API key and re-run: npm run audio:generate');
    console.log('Every listening track already plays via on-device text-to-speech without this.');
    return;
  }

  const ffmpegAvailable = hasFfmpeg();
  if (!ffmpegAvailable) {
    console.warn('ffmpeg not found on PATH — install it with `brew install ffmpeg` for natural pauses');
    console.warn('between speaker turns. Continuing without inter-turn silence for this run.');
  }

  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  const migrated = content.listeningTracks.filter((t) => t.turns && t.turns.length > 0);
  const legacyCount = content.listeningTracks.length - migrated.length;
  let generated = 0;
  let failed = 0;

  for (const track of migrated) {
    const outPath = path.join(ASSETS_DIR, `${track.id}.mp3`);
    if (fs.existsSync(outPath)) {
      console.log(`Already generated: ${track.title}`);
      continue;
    }
    const speakerCount = new Set(track.turns!.map((t) => t.speaker)).size;
    console.log(`Generating "${track.title}" (${track.turns!.length} turns, ${speakerCount} speaker${speakerCount === 1 ? '' : 's'})...`);
    try {
      await generateTrack(track, ffmpegAvailable);
      generated++;
      console.log(`  Saved ${path.relative(ROOT, path.join(ASSETS_DIR, `${track.id}.mp3`))}`);
    } catch (err) {
      failed++;
      console.error(`  Failed: ${(err as Error).message}`);
    }
  }

  const totalRegistered = writeRegistry();
  console.log(`\n${generated} track(s) newly generated this run${failed ? ` (${failed} failed)` : ''}.`);
  console.log(`${totalRegistered}/${content.listeningTracks.length} listening tracks now have real generated audio.`);
  console.log(`${legacyCount} track(s) have no structured \`turns\` yet and were skipped (still on-device TTS fallback) — migrate them to \`turns\` before they can be regenerated here.`);
  console.log(`Wrote ${path.relative(ROOT, REGISTRY_PATH)}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// One-time, deterministic, idempotent conversion of the 74 legacy Astra
// listening transcripts into the structured turn/speaker format the real
// Piper generation pipeline (scripts/generate-audio.ts) requires — see
// Priority 1 of the Task 6 instructions. This does NOT generate any audio
// and does NOT set `audioSource` on these tracks: no verified Piper output
// exists for them yet (this sandbox has no network access to
// huggingface.co, where the en_GB-vctk-medium voice model is hosted — see
// README.md's Listening audio pipeline section). The 74 tracks keep
// pointing at their existing legacy/undocumented .mp3 files in
// audioRegistry.ts, completely untouched, until someone with local network
// access runs `npm run audio:generate` after this script and flips
// `audioSource` for the tracks it actually produced real audio for.
//
// Re-running this script against its own output is a no-op: it only acts
// on tracks that don't already have `turns`.
//
// Usage: npx tsx scripts/convert-astra-listening-turns.ts
import fs from 'node:fs';
import path from 'node:path';

import { hashString } from '../lib/content/audioVoiceAssignment';
import { listeningTracksAstra } from '../lib/content/listeningAstra';
import type { ListeningSpeakerTurn, ListeningTrack } from '../types/models';

const FILE_PATH = path.join(__dirname, '..', 'lib', 'content', 'listeningAstra.ts');

/** Splits a flat "Name: text Name: text ..." transcript into turns. Section
 * 1 (Receptionist/Caller) and Section 3 (Tutor/Student[/Leah/Omar]) already
 * use this exact convention — confirmed by parsing all 37 tracks and
 * checking the extracted turns rejoin (modulo whitespace) to the original
 * transcript with nothing dropped or duplicated. */
function splitDialogue(transcript: string): ListeningSpeakerTurn[] {
  const re = /([A-Z][a-zA-Z]{1,20}):\s/g;
  const boundaries: { name: string; matchStart: number; textStart: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(transcript))) boundaries.push({ name: m[1], matchStart: m.index, textStart: m.index + m[0].length });
  const turns: ListeningSpeakerTurn[] = [];
  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i].textStart;
    const end = i + 1 < boundaries.length ? boundaries[i + 1].matchStart : transcript.length;
    const text = transcript.slice(start, end).trim();
    if (text) turns.push({ speaker: boundaries[i].name, text });
  }
  return turns;
}

/** Splits a single-speaker monologue transcript into several turns of 2-3
 * sentences each, matching the granularity already used by the approved
 * production monologue "Orientation Tour of Fernwood Leisure Centre"
 * (lib/content/listening2.ts) — several shorter turns rather than one giant
 * block, so the generation pipeline's per-turn pacing gaps still apply. */
function splitMonologue(transcript: string, speaker: string): ListeningSpeakerTurn[] {
  // Finds each sentence's character span in the ORIGINAL string and slices
  // turns directly from it (rather than matching sentences into an array
  // and re-joining them with a fixed separator) so a turn spanning a
  // paragraph break in the source transcript (some Astra transcripts use
  // "\n" between paragraphs) keeps that exact original whitespace — a
  // turn's text must remain a verbatim substring of the transcript, and
  // re-joining with a plain " " would silently replace "materials.\nOur"
  // with "materials. Our", breaking that guarantee.
  const re = /[^.!?]+[.!?]+(?:["')\]]*)/g;
  const spans: { start: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(transcript))) spans.push({ start: m.index, end: m.index + m[0].length });
  if (spans.length === 0) return [{ speaker, text: transcript.trim() }];

  const turns: ListeningSpeakerTurn[] = [];
  const perTurn = 3;
  for (let i = 0; i < spans.length; i += perTurn) {
    const group = spans.slice(i, i + perTurn);
    const text = transcript.slice(group[0].start, group[group.length - 1].end).trim();
    if (text) turns.push({ speaker, text });
  }
  return turns;
}

/** Explicit "female"/"male" persona text for a two-generic-role dialogue,
 * deterministically alternating which role gets which gender per track (via
 * the track id hash) so the 19 Section 1 / 18 Section 3 tracks aren't all
 * voiced identically. An explicit gender word is required here — genderOf()
 * only reads persona text or falls back to a per-speaker hash, and two
 * independent hashes for generic role names ("Receptionist"/"Caller",
 * "Student"/"Tutor") are not guaranteed to contrast. */
function twoRolePersonas(trackId: string, roleA: string, roleB: string, styleA: string, styleB: string): Record<string, string> {
  const aFemale = hashString(trackId) % 2 === 0;
  return {
    [roleA]: `${aFemale ? 'female' : 'male'} ${styleA}`,
    [roleB]: `${aFemale ? 'male' : 'female'} ${styleB}`,
  };
}

function monologuePersona(trackId: string, role: string, style: string): Record<string, string> {
  const female = hashString(trackId) % 2 === 0;
  return { [role]: `${female ? 'female' : 'male'} ${style}` };
}

function convertTrack(track: ListeningTrack): ListeningTrack {
  if (track.turns && track.turns.length > 0) return track; // already converted — idempotent

  if (track.sectionNumber === 1) {
    // Section 1: conversational, clearer/slightly slower — a booking/service call.
    const turns = splitDialogue(track.transcript);
    const speakerPersonas = twoRolePersonas(
      track.id,
      'Receptionist',
      'Caller',
      'receptionist speaking clearly and a little slower than natural pace, warm and professional',
      'caller speaking at a natural conversational pace, friendly and slightly informal'
    );
    return { ...track, turns, speakerPersonas };
  }

  if (track.sectionNumber === 3) {
    // Section 3: multi-speaker academic discussion — clearly distinct voices.
    const turns = splitDialogue(track.transcript);
    const speakers = Array.from(new Set(turns.map((t) => t.speaker)));
    let speakerPersonas: Record<string, string>;
    if (speakers.length === 3) {
      // The one Tutor/Leah/Omar three-speaker track: Leah and Omar get an
      // explicit, contrasting gender each (their names already imply one,
      // but genderOf() only trusts persona text, never a name), and the
      // Tutor is deliberately given the opposite of Leah's so all three
      // categories used are distinct even though two speakers share a
      // gender with Leah's Section 3 peers elsewhere in the library.
      const tutorFemale = hashString(track.id) % 2 === 0;
      speakerPersonas = {
        Tutor: `${tutorFemale ? 'female' : 'male'} academic tutor, measured and authoritative pace`,
        Leah: 'female university student, engaged and articulate',
        Omar: 'male university student, thoughtful and clear',
      };
    } else {
      speakerPersonas = twoRolePersonas(
        track.id,
        'Tutor',
        'Student',
        'academic tutor speaking with a measured, authoritative pace',
        'university student speaking naturally, engaged and articulate'
      );
    }
    return { ...track, turns, speakerPersonas };
  }

  if (track.sectionNumber === 2) {
    // Section 2: natural monologue — a single presenter/guide.
    const turns = splitMonologue(track.transcript, 'Presenter');
    const speakerPersonas = monologuePersona(track.id, 'Presenter', 'presenter speaking in a warm, natural, informative tone at a moderate pace');
    return { ...track, turns, speakerPersonas };
  }

  // Section 4: denser academic monologue.
  const turns = splitMonologue(track.transcript, 'Lecturer');
  const speakerPersonas = monologuePersona(track.id, 'Lecturer', 'lecturer speaking in a dense, academic register at a measured, deliberate pace');
  return { ...track, turns, speakerPersonas };
}

function main() {
  const converted = listeningTracksAstra.map(convertTrack);

  const changed = converted.filter((t, i) => t !== listeningTracksAstra[i]);
  console.log(`Converting ${changed.length} of ${converted.length} Astra listening tracks to structured turns...`);

  const header = `import type { ListeningTrack, Question } from '@/types/models';

// Sourced from the Astra/Bandpath project's Listening practice sets, paired
// with real generated MP3 audio copied into assets/audio/ and registered in
// audioRegistry.ts. Deduped against Claude's existing tracks by title.
//
// \`turns\`/\`speakerPersonas\` were added by
// scripts/convert-astra-listening-turns.ts so these tracks are ready for the
// real Piper generation pipeline (scripts/generate-audio.ts) — but
// \`audioSource\` is deliberately NOT set here: no verified Piper audio has
// actually been generated for these tracks yet (this environment has no
// network access to huggingface.co, where the en_GB-vctk-medium voice model
// is hosted). Until real audio is generated and audioSource is set, these
// tracks are NOT counted as production audio (see
// __tests__/contentIntegrity.test.ts's productionTracks, which keys off
// audioSource, not turns) and audioRegistry.ts still points every one of
// them at its original, license-undocumented legacy .mp3 file.

`;

  const questionsSource = fs.readFileSync(FILE_PATH, 'utf8');
  const questionsMatch = questionsSource.match(/export const listeningQuestionsAstra: Question\[] = ([\s\S]*);\s*$/);
  if (!questionsMatch) throw new Error('Could not locate listeningQuestionsAstra in the source file to preserve it.');
  const questionsLiteral = questionsMatch[1];

  const out = `${header}export const listeningTracksAstra: ListeningTrack[] = ${JSON.stringify(converted, null, 2)};

export const listeningQuestionsAstra: Question[] = ${questionsLiteral};
`;

  fs.writeFileSync(FILE_PATH, out);
  console.log(`Wrote ${FILE_PATH} (${(out.length / 1024).toFixed(0)} KB).`);
}

main();

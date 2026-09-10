import type { ListeningTrack } from '@/types/models';

// An example voice pool, used by tests that don't need a real discovered
// voice list, and by any future non-VCTK pipeline. scripts/generate-audio.ts
// no longer uses this for its real Piper run (see assignSpeakerCategories
// below) — VOICE_POOL/assignVoices stay as a generic, provider-agnostic
// utility (any array of distinct voice identifiers), not tied to VCTK.
export const VOICE_POOL = ['Voice A', 'Voice B', 'Voice C', 'Voice D', 'Voice E', 'Voice F'];

export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic per-track speaker->voice assignment: sort this track's
 * unique speaker names, then walk `voicePool` starting at an offset derived
 * from the track id. Re-running the generation script always produces the
 * same voice for the same speaker in the same track, and two different
 * speakers within one track never collide as long as the track has no more
 * distinct speakers than `voicePool` has entries.
 *
 * This is a generic, provider-agnostic utility — it only guarantees "not the
 * same ID," which is exactly what turned out to be insufficient for real
 * multi-speaker VCTK audio (two different Piper speaker ids can still sound
 * almost identical). For the actual Piper/VCTK pipeline, use
 * `assignSpeakerCategories` below instead, which curates *which* ids are
 * even candidates before picking between them. */
export function assignVoices(track: Pick<ListeningTrack, 'id' | 'turns'>, voicePool: string[]): Record<string, string> {
  const speakers = Array.from(new Set((track.turns ?? []).map((t) => t.speaker))).sort();
  if (voicePool.length === 0) return {};
  const offset = hashString(track.id) % voicePool.length;
  const map: Record<string, string> = {};
  speakers.forEach((speaker, i) => {
    map[speaker] = voicePool[(offset + i) % voicePool.length];
  });
  return map;
}

// ---------------------------------------------------------------------------
// Curated VCTK speaker-category strategy
// ---------------------------------------------------------------------------
//
// Real-device QA on the 4 proof-of-concept tracks found that plain "assign a
// different numerical speaker ID" (assignVoices above) was not good enough:
// "Booking a Self-Storage Unit"'s two speakers got IDs that happened to sound
// almost identical, even though "Planning a Group Research Project" (using
// the same mechanism) came out excellent. Two different IDs are not the same
// thing as two *perceptually contrasting* voices.
//
// This section replaces "pick any unused ID" with "pick from a small,
// deliberately curated set of VCTK speakers spread across different
// documented genders and accent groups," modelled as named categories
// (femaleA/B/C, maleA/B/C) rather than raw numeric ids. A track's speakers
// are assigned to *categories* here (pure content-layer logic, testable
// without Piper or the voice model installed); scripts/generate-audio.ts
// resolves each category to an actual numeric speaker id by looking up the
// category's preferred VCTK speaker *name* in the real, installed model's
// own speaker_id_map — so the category system stays correct even if the
// exact ordinal id for e.g. "p234" differs between voice-pack versions.
export type SpeakerCategory = 'femaleA' | 'maleA' | 'femaleB' | 'maleB' | 'femaleC' | 'maleC';

export const SPEAKER_CATEGORIES: SpeakerCategory[] = ['femaleA', 'maleA', 'femaleB', 'maleB', 'femaleC', 'maleC'];

/** Best-effort curated pick of one VCTK Corpus speaker name per category,
 * deliberately spread across different documented accent groups so that even
 * two categories of the *same* gender (e.g. femaleA vs femaleB) remain
 * clearly distinguishable — matching the bar the approved "Group Research
 * Project" track set, not just "a different ID."
 *
 * Source: VCTK's publicly documented speaker demographics (University of
 * Edinburgh, CSTR — the same corpus already credited in audioLicense.ts's
 * CC BY 4.0 attribution). This table was authored from widely-published VCTK
 * documentation; it was NOT re-verified against the corpus's own
 * speaker-info.txt from this environment, because outbound access to both
 * huggingface.co and datashare.ed.ac.uk is blocked by this sandbox's egress
 * proxy. Treat the accent labels below as best-effort, not a guarantee.
 *
 * That's why nothing here is trusted blindly at generation time:
 * scripts/generate-audio.ts looks up each name against the *actual* installed
 * model's own speaker_id_map and only uses names that really resolve there,
 * falling back to a safe evenly-spread pick (with a printed warning) for any
 * that don't — so an imprecise guess here degrades safely instead of
 * silently mis-assigning or crashing. If a pairing still sounds off once you
 * can actually listen on your Mac, override it without touching code via
 * `PIPER_SPEAKER_<CATEGORY_AS_SNAKE_UPPER>`, e.g. `PIPER_SPEAKER_FEMALE_A=p228`. */
export const CURATED_VCTK_SPEAKERS: Record<SpeakerCategory, string> = {
  femaleA: 'p225', // English (Southern England)
  maleA: 'p226', // English (Surrey)
  femaleB: 'p234', // Scottish
  maleB: 'p245', // Irish
  femaleC: 'p294', // American
  maleC: 'p326', // Australian
};

export type SpeakerGender = 'male' | 'female';

/** Infers gender from a speaker's persona text, checked in this order:
 * an explicit "female"/"male" word, then a "her"/"she" or "his"/"him"/"he"
 * pronoun. Returns null when the persona doesn't say (or there is none) —
 * callers should fall back to a deterministic hash in that case (see
 * `genderOf` below), never a silent default that could look like a real
 * signal. Shared by scripts/generate-audio.ts (the real Piper run) and this
 * file's tests, so both agree on exactly the same rule. */
export function genderFromPersona(persona: string | undefined): SpeakerGender | null {
  if (!persona) return null;
  const p = persona.toLowerCase();
  if (/\bfemale\b/.test(p)) return 'female';
  if (/\bmale\b/.test(p)) return 'male';
  if (/\b(her|she)\b/.test(p)) return 'female';
  if (/\b(his|him|he)\b/.test(p)) return 'male';
  return null;
}

/** The single, canonical way to resolve a track speaker's gender: prefer an
 * explicit signal from their persona text, and only fall back to a stable
 * per-track-per-speaker hash when the persona says nothing about gender —
 * so the same speaker always resolves to the same gender on every run. */
export function genderOf(track: Pick<ListeningTrack, 'id' | 'speakerPersonas'>, speaker: string): SpeakerGender {
  const fromPersona = genderFromPersona(track.speakerPersonas?.[speaker]);
  if (fromPersona) return fromPersona;
  return hashString(`${track.id}:${speaker}`) % 2 === 0 ? 'female' : 'male';
}

/** Deterministic, gender-aware category assignment for one track's speakers.
 * `genderOf` resolves each speaker name to a gender (see
 * scripts/generate-audio.ts's/content authoring's use of known first names
 * and role personas) — for a name this function can't confidently classify,
 * callers should still return a stable 'male' | 'female' guess (e.g. hashed
 * off the track id) so this stays deterministic; genuine ambiguity is a
 * content-authoring concern, not this function's.
 *
 * Guarantees, for up to 3 speakers of the same gender in one track (the
 * library's real max is 4 total speakers, e.g. a tutor + 3 students):
 *  - no two same-gender speakers in a track ever share a category
 *  - the same track id + speaker name always resolves to the same category
 *    (stable across re-runs, so regenerating never reshuffles voices)
 *  - which category each gender starts from is spread across tracks (via the
 *    track id hash), so the library doesn't lean on the exact same 1-2
 *    categories for every conversation. */
export function assignSpeakerCategories(track: Pick<ListeningTrack, 'id' | 'turns'>, genderOf: (speaker: string) => SpeakerGender): Record<string, SpeakerCategory> {
  const speakers = Array.from(new Set((track.turns ?? []).map((t) => t.speaker))).sort();
  if (speakers.length === 0) return {};

  const maleCats: SpeakerCategory[] = ['maleA', 'maleB', 'maleC'];
  const femaleCats: SpeakerCategory[] = ['femaleA', 'femaleB', 'femaleC'];
  const offset = hashString(track.id);
  const used = { male: new Set<SpeakerCategory>(), female: new Set<SpeakerCategory>() };
  const map: Record<string, SpeakerCategory> = {};

  speakers.forEach((speaker, i) => {
    const gender = genderOf(speaker);
    const pool = gender === 'male' ? maleCats : femaleCats;
    const usedSet = used[gender];
    let chosen: SpeakerCategory | undefined;
    for (let k = 0; k < pool.length; k++) {
      const candidate = pool[(offset + i + k) % pool.length];
      if (!usedSet.has(candidate)) {
        chosen = candidate;
        break;
      }
    }
    chosen = chosen ?? pool[(offset + i) % pool.length];
    usedSet.add(chosen);
    map[speaker] = chosen;
  });

  return map;
}

/** Resolves gender for a track's speakers such that, when two or more
 * speakers have no gender signal of their own (e.g. generic roles like
 * "Receptionist"/"Caller" rather than named characters), they deliberately
 * alternate rather than risk both landing on the same gender by chance —
 * directly targeting the "2-person dialogue should contrast where natural"
 * requirement. `knownGender` should return a confident gender for speakers
 * whose name/role implies one (e.g. a named character), or null for a truly
 * generic role; genuinely-ambiguous speakers are then alternated in sorted
 * order, starting from a per-track deterministic parity so the library isn't
 * biased toward e.g. always making the first speaker female. */
export function resolveGendersWithContrast(track: Pick<ListeningTrack, 'id' | 'turns'>, knownGender: (speaker: string) => SpeakerGender | null): Record<string, SpeakerGender> {
  const speakers = Array.from(new Set((track.turns ?? []).map((t) => t.speaker))).sort();
  const result: Record<string, SpeakerGender> = {};
  const primary: SpeakerGender = hashString(track.id) % 2 === 0 ? 'female' : 'male';
  const secondary: SpeakerGender = primary === 'female' ? 'male' : 'female';
  let ambiguousIndex = 0;
  for (const speaker of speakers) {
    const known = knownGender(speaker);
    if (known) {
      result[speaker] = known;
    } else {
      result[speaker] = ambiguousIndex % 2 === 0 ? primary : secondary;
      ambiguousIndex++;
    }
  }
  return result;
}

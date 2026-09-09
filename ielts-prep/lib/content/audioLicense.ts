import type { ListeningAudioSource } from '@/types/models';

// Licence bookkeeping for any track whose real audio carries a licence
// obligation — either a directly reused human recording (`human_corpus`),
// or `local_tts` output from a voice *model* trained on licensed speech
// data (e.g. Piper's en_GB-vctk-medium, trained on the University of
// Edinburgh's VCTK Corpus, CC BY 4.0 — attribution to the corpus is
// tracked here even though the Piper model file itself is separately
// MIT-licensed, since the underlying recordings' own licence still
// applies). Every licence this app is allowed to ship audio under must
// (a) explicitly permit commercial redistribution and (b) not require
// anything the app can't actually provide. No-Derivatives and
// non-commercial-only licences are never listed here on purpose — see the
// Listening overhaul report for licences that were researched and
// rejected (TED talks: CC BY-NC-ND; Coqui XTTS-v2: CPML, non-commercial;
// macOS System Voices: Apple's own SLA explicitly bars commercial/
// redistribution use — not a licence this app can list here at all).
export type LicenseId = NonNullable<ListeningAudioSource['license']>;

export const COMMERCIAL_REDISTRIBUTION_ALLOWED: Record<LicenseId, boolean> = {
  'CC0-1.0': true,
  'Public-Domain': true,
  'CC-BY-4.0': true,
  MIT: true,
};

export const LICENSES_REQUIRING_ATTRIBUTION: Set<LicenseId> = new Set(['CC-BY-4.0']);

/** Returns a list of problems (empty = valid). Used both by content
 * validators (real tracks) and by audioLicense.test.ts (synthetic
 * fixtures). `human_corpus` sources must always declare a license and
 * sourceUrl; a `local_tts` source only needs one declared when the voice
 * model it uses was itself trained on licensed speech data (as with
 * en_GB-vctk-medium) — but whenever a license *is* declared, on either
 * kind, it's validated the same way. */
export function validateAudioSource(source: ListeningAudioSource): string[] {
  const problems: string[] = [];

  if (source.kind === 'human_corpus') {
    if (!source.license) problems.push('human_corpus source is missing a license');
    if (!source.sourceUrl?.trim()) problems.push('human_corpus source is missing sourceUrl (the exact recording/dataset entry it came from)');
  }

  if (source.license) {
    if (!COMMERCIAL_REDISTRIBUTION_ALLOWED[source.license]) {
      problems.push(`license "${source.license}" does not permit commercial redistribution`);
    }
    if (LICENSES_REQUIRING_ATTRIBUTION.has(source.license) && !source.attribution?.trim()) {
      problems.push(`license "${source.license}" requires attribution but none is set`);
    }
  }

  return problems;
}

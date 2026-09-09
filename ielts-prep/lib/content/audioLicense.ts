import type { ListeningAudioSource } from '@/types/models';

// Licence bookkeeping for real human-speech audio reused from an outside
// corpus. Every licence this app is allowed to ship reused human audio
// under must (a) explicitly permit commercial redistribution and (b) not
// require anything the app can't actually provide. No-Derivatives and
// non-commercial-only licences are never listed here on purpose — see the
// Listening overhaul report for licences that were researched and
// rejected (TED talks: CC BY-NC-ND; most other found-audio sources).
export type LicenseId = NonNullable<ListeningAudioSource['license']>;

export const COMMERCIAL_REDISTRIBUTION_ALLOWED: Record<LicenseId, boolean> = {
  'CC0-1.0': true,
  'Public-Domain': true,
  'CC-BY-4.0': true,
};

export const LICENSES_REQUIRING_ATTRIBUTION: Set<LicenseId> = new Set(['CC-BY-4.0']);

/** Returns a list of problems (empty = valid). Used both by content
 * validators (real tracks) and by audioLicense.test.ts (synthetic
 * fixtures), so the rule is proven correct independently of whether any
 * real content uses the human_corpus path yet. */
export function validateAudioSource(source: ListeningAudioSource): string[] {
  const problems: string[] = [];
  if (source.kind !== 'human_corpus') return problems;

  if (!source.license) {
    problems.push('human_corpus source is missing a license');
  } else if (!COMMERCIAL_REDISTRIBUTION_ALLOWED[source.license]) {
    problems.push(`license "${source.license}" does not permit commercial redistribution`);
  }
  if (!source.sourceUrl?.trim()) {
    problems.push('human_corpus source is missing sourceUrl (the exact recording/dataset entry it came from)');
  }
  if (source.license && LICENSES_REQUIRING_ATTRIBUTION.has(source.license) && !source.attribution?.trim()) {
    problems.push(`license "${source.license}" requires attribution but none is set`);
  }
  return problems;
}

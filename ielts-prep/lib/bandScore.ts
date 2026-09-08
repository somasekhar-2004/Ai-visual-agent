import type { BandConversionRow, BandScale } from '@/types/models';

/**
 * Rounds a raw average to the nearest IELTS half-band, rounding a .25
 * remainder up to the next half band and a .75 remainder up to the next
 * whole band (the official IELTS overall-band rounding convention).
 * Equivalent to rounding to the nearest 0.5 with ties rounding up.
 */
export function roundIeltsBand(value: number): number {
  return Math.round(value * 2) / 2;
}

/** Default raw-score -> band tables, mirroring supabase/seed/0001_band_conversion.sql. Used as an offline/demo-mode fallback when the DB table isn't available. */
export const defaultBandConversion: BandConversionRow[] = [
  // Listening
  { scale: 'listening', rawMin: 39, rawMax: 40, band: 9.0 },
  { scale: 'listening', rawMin: 37, rawMax: 38, band: 8.5 },
  { scale: 'listening', rawMin: 35, rawMax: 36, band: 8.0 },
  { scale: 'listening', rawMin: 32, rawMax: 34, band: 7.5 },
  { scale: 'listening', rawMin: 30, rawMax: 31, band: 7.0 },
  { scale: 'listening', rawMin: 26, rawMax: 29, band: 6.5 },
  { scale: 'listening', rawMin: 23, rawMax: 25, band: 6.0 },
  { scale: 'listening', rawMin: 18, rawMax: 22, band: 5.5 },
  { scale: 'listening', rawMin: 16, rawMax: 17, band: 5.0 },
  { scale: 'listening', rawMin: 13, rawMax: 15, band: 4.5 },
  { scale: 'listening', rawMin: 11, rawMax: 12, band: 4.0 },
  { scale: 'listening', rawMin: 8, rawMax: 10, band: 3.5 },
  { scale: 'listening', rawMin: 6, rawMax: 7, band: 3.0 },
  { scale: 'listening', rawMin: 4, rawMax: 5, band: 2.5 },
  { scale: 'listening', rawMin: 0, rawMax: 3, band: 2.0 },
  // Reading Academic
  { scale: 'reading_academic', rawMin: 39, rawMax: 40, band: 9.0 },
  { scale: 'reading_academic', rawMin: 37, rawMax: 38, band: 8.5 },
  { scale: 'reading_academic', rawMin: 35, rawMax: 36, band: 8.0 },
  { scale: 'reading_academic', rawMin: 33, rawMax: 34, band: 7.5 },
  { scale: 'reading_academic', rawMin: 30, rawMax: 32, band: 7.0 },
  { scale: 'reading_academic', rawMin: 27, rawMax: 29, band: 6.5 },
  { scale: 'reading_academic', rawMin: 23, rawMax: 26, band: 6.0 },
  { scale: 'reading_academic', rawMin: 19, rawMax: 22, band: 5.5 },
  { scale: 'reading_academic', rawMin: 15, rawMax: 18, band: 5.0 },
  { scale: 'reading_academic', rawMin: 13, rawMax: 14, band: 4.5 },
  { scale: 'reading_academic', rawMin: 10, rawMax: 12, band: 4.0 },
  { scale: 'reading_academic', rawMin: 8, rawMax: 9, band: 3.5 },
  { scale: 'reading_academic', rawMin: 6, rawMax: 7, band: 3.0 },
  { scale: 'reading_academic', rawMin: 4, rawMax: 5, band: 2.5 },
  { scale: 'reading_academic', rawMin: 0, rawMax: 3, band: 2.0 },
  // Reading General Training
  { scale: 'reading_general', rawMin: 40, rawMax: 40, band: 9.0 },
  { scale: 'reading_general', rawMin: 39, rawMax: 39, band: 8.5 },
  { scale: 'reading_general', rawMin: 37, rawMax: 38, band: 8.0 },
  { scale: 'reading_general', rawMin: 36, rawMax: 36, band: 7.5 },
  { scale: 'reading_general', rawMin: 34, rawMax: 35, band: 7.0 },
  { scale: 'reading_general', rawMin: 32, rawMax: 33, band: 6.5 },
  { scale: 'reading_general', rawMin: 30, rawMax: 31, band: 6.0 },
  { scale: 'reading_general', rawMin: 27, rawMax: 29, band: 5.5 },
  { scale: 'reading_general', rawMin: 23, rawMax: 26, band: 5.0 },
  { scale: 'reading_general', rawMin: 19, rawMax: 22, band: 4.5 },
  { scale: 'reading_general', rawMin: 15, rawMax: 18, band: 4.0 },
  { scale: 'reading_general', rawMin: 12, rawMax: 14, band: 3.5 },
  { scale: 'reading_general', rawMin: 9, rawMax: 11, band: 3.0 },
  { scale: 'reading_general', rawMin: 6, rawMax: 8, band: 2.5 },
  { scale: 'reading_general', rawMin: 0, rawMax: 5, band: 2.0 },
];

/** Converts a raw score (correct answers out of 40) to an estimated band using the given table (or the built-in default). */
export function rawScoreToBand(
  scale: BandScale,
  rawScore: number,
  table: BandConversionRow[] = defaultBandConversion
): number {
  const row = table.find((r) => r.scale === scale && rawScore >= r.rawMin && rawScore <= r.rawMax);
  if (row) return row.band;
  // Fall back to the closest boundary rather than throwing on out-of-range input.
  const rows = table.filter((r) => r.scale === scale).sort((a, b) => a.rawMin - b.rawMin);
  if (rows.length === 0) return 0;
  return rawScore < rows[0].rawMin ? rows[0].band : rows[rows.length - 1].band;
}

export type SkillBands = {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
};

/** Computes the overall band as the rounded average of the four skill bands. */
export function computeOverallBand(skills: SkillBands): number {
  const average = (skills.listening + skills.reading + skills.writing + skills.speaking) / 4;
  return roundIeltsBand(average);
}

export function bandLabel(band: number): string {
  if (band >= 8.5) return 'Expert';
  if (band >= 7.5) return 'Very Good';
  if (band >= 6.5) return 'Good';
  if (band >= 5.5) return 'Competent';
  if (band >= 4.5) return 'Modest';
  return 'Limited';
}

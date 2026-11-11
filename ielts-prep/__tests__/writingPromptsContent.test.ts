// Structural integrity checks for every Writing Task 1 chart/diagram dataset
// in lib/content/writingPrompts.ts. These catch malformed *source data*
// (missing/empty fields, mismatched table dimensions) — separate from
// __tests__/writingChart.test.tsx, which checks the *rendering* of that data.
import { content } from '@/lib/content';
import type { WritingChartData } from '@/types/models';

const prompts = content.writingPrompts.filter((p) => p.chartData);

function describeDataset(chartData: WritingChartData, title: string) {
  return `${title} (${chartData.type})`;
}

describe('Writing Task 1 chart source data — structural integrity', () => {
  it('has at least one prompt per chart type (bar, line, pie, table, process, map)', () => {
    const types = new Set(prompts.map((p) => p.chartData!.type));
    expect(types).toEqual(new Set(['bar', 'line', 'pie', 'table', 'process', 'map']));
  });

  for (const p of prompts) {
    const chartData = p.chartData!;
    const label = describeDataset(chartData, p.title);

    it(`${label} — has no empty/blank text fields`, () => {
      switch (chartData.type) {
        case 'bar':
        case 'line':
          expect(chartData.series.length).toBeGreaterThan(0);
          for (const s of chartData.series) {
            expect(s.label.trim().length).toBeGreaterThan(0);
            expect(s.points.length).toBeGreaterThan(0);
            for (const pt of s.points) {
              expect(pt.x.trim().length).toBeGreaterThan(0);
              expect(Number.isFinite(pt.y)).toBe(true);
            }
          }
          break;
        case 'pie':
          expect(chartData.segments.length).toBeGreaterThan(0);
          for (const seg of chartData.segments) {
            expect(seg.label.trim().length).toBeGreaterThan(0);
            expect(Number.isFinite(seg.value)).toBe(true);
            expect(seg.value).toBeGreaterThan(0);
          }
          break;
        case 'table':
          expect(chartData.headers.length).toBeGreaterThan(0);
          expect(chartData.rows.length).toBeGreaterThan(0);
          for (const h of chartData.headers) expect(h.trim().length).toBeGreaterThan(0);
          for (const row of chartData.rows) {
            // Every row must have exactly as many cells as there are headers —
            // a mismatch here would silently misalign columns on render.
            expect(row.length).toBe(chartData.headers.length);
            for (const cell of row) expect(cell.trim().length).toBeGreaterThan(0);
          }
          break;
        case 'process':
          expect(chartData.steps.length).toBeGreaterThan(1);
          for (const step of chartData.steps) expect(step.trim().length).toBeGreaterThan(0);
          break;
        case 'map':
          expect(chartData.description.trim().length).toBeGreaterThan(0);
          expect(chartData.features.length).toBeGreaterThan(0);
          for (const f of chartData.features) expect(f.trim().length).toBeGreaterThan(0);
          break;
      }
    });
  }

  it('every pie chart\'s segment values sum to a sane total (not all zero, not negative)', () => {
    const pies = prompts.map((p) => p.chartData!).filter((c): c is Extract<WritingChartData, { type: 'pie' }> => c.type === 'pie');
    for (const pie of pies) {
      const total = pie.segments.reduce((sum, s) => sum + s.value, 0);
      expect(total).toBeGreaterThan(0);
    }
  });
});

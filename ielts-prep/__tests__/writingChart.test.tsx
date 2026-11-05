// Regression coverage for a real bug: Writing Task 1 bar/line charts used
// a fixed 320px-only SVG width with no numeric Y-axis — the rightmost bar
// in some charts (e.g. "Household Recycling Rates", a real prompt in
// lib/content) got clipped on narrower screens, and there was no way to
// read actual values off the chart at all. components/writing/
// WritingChart.tsx now measures its real container width via onLayout and
// scales the SVG to it via viewBox (instead of a fixed pixel width), and
// renders numeric Y-axis ticks (lib/analytics-style "nice number" rounding,
// tested directly below since react-native-svg's <Text>/<TSpan> content
// isn't reliably queryable through this testing-library version).
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { niceAxisTicks, WritingChart } from '@/components/writing/WritingChart';
import { ThemeProvider } from '@/hooks/useTheme';
import { content } from '@/lib/content';
import type { WritingChartData } from '@/types/models';

// components/ui's barrel pulls in DailyLimitCard, which imports expo-router
// (for its own navigation) — expo-router's real module graph includes an
// ESM-only package Jest's CJS transform can't load. WritingChart itself
// never calls useRouter.
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

const THREE_COUNTRY_BAR_CHART: WritingChartData = {
  type: 'bar',
  unit: '%',
  series: [
    { label: 'Household waste recycled', points: [{ x: 'Country A', y: 42 }, { x: 'Country B', y: 67 }, { x: 'Country C', y: 93 }] },
  ],
};

async function renderChart(data: WritingChartData) {
  return render(
    <ThemeProvider>
      <WritingChart data={data} />
    </ThemeProvider>
  );
}

describe('niceAxisTicks — "nice number" Y-axis rounding', () => {
  it('rounds 0-93 up to a clean 0/50/100 scale rather than the raw data max', () => {
    const { max, ticks, decimals } = niceAxisTicks(93);
    expect(max).toBe(100);
    expect(ticks).toEqual([0, 50, 100]);
    expect(decimals).toBe(0);
  });

  it('always includes 0 as the first tick and reaches at least the raw max', () => {
    const { max, ticks } = niceAxisTicks(7.4);
    expect(ticks[0]).toBe(0);
    expect(max).toBeGreaterThanOrEqual(7.4);
  });

  it('uses one decimal place when the scale itself is sub-1 (e.g. band scores)', () => {
    const { decimals, max } = niceAxisTicks(0.8);
    expect(decimals).toBe(1);
    expect(max).toBeGreaterThanOrEqual(0.8);
  });

  it('never divides by zero or returns a non-finite scale for an all-zero dataset', () => {
    const { max, ticks } = niceAxisTicks(0);
    expect(Number.isFinite(max)).toBe(true);
    expect(ticks.every(Number.isFinite)).toBe(true);
  });
});

describe('WritingChart — bar/line charts scale to the real container width', () => {
  it('renders at the fixed 320px design width before the container has been measured', async () => {
    const { getByTestId } = await renderChart(THREE_COUNTRY_BAR_CHART);
    const svg = getByTestId('writing-chart-svg');
    expect(svg.props.width).toBe(320);
    // react-native-svg resolves `viewBox="0 0 320 220"` into these four
    // separate props on the host element rather than keeping it as a
    // literal string (confirmed via a throwaway debug render).
    expect(svg.props.minX).toBe(0);
    expect(svg.props.minY).toBe(0);
    expect(svg.props.vbWidth).toBe(320);
    expect(svg.props.vbHeight).toBe(220);
  });

  it('rescales the SVG to the real measured container width instead of staying fixed at 320, preserving aspect ratio', async () => {
    const { getByTestId } = await renderChart(THREE_COUNTRY_BAR_CHART);
    const viewWithLayout = getByTestId('writing-chart-container');
    await fireEvent(viewWithLayout, 'layout', { nativeEvent: { layout: { width: 260, height: 0, x: 0, y: 0 } } });

    const svg = getByTestId('writing-chart-svg');
    expect(svg.props.width).toBe(260);
    // Height follows proportionally — never a stretched/squashed chart.
    expect(svg.props.height).toBeCloseTo(260 * (220 / 320), 1);
    // The internal coordinate system (and therefore every bar/line's
    // position) is untouched — only the rendered size changes.
    expect(svg.props.minX).toBe(0);
    expect(svg.props.minY).toBe(0);
    expect(svg.props.vbWidth).toBe(320);
    expect(svg.props.vbHeight).toBe(220);
  });

  it('renders without crashing for every real bar/line chart shipped with a Writing prompt (e.g. the "Household Recycling Rates" chart this bug was reported on)', async () => {
    const realCharts = content.writingPrompts
      .map((p) => p.chartData)
      .filter((c): c is WritingChartData => Boolean(c) && (c!.type === 'bar' || c!.type === 'line'));
    expect(realCharts.length).toBeGreaterThan(0);
    for (const chartData of realCharts) {
      const { unmount } = await renderChart(chartData);
      unmount();
    }
  });
});

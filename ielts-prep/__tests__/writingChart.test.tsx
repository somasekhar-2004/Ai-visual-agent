// Regression coverage for Writing Task 1 charts on mobile screens of
// different widths. The original bug (see the older version of this test)
// was a fixed 320px-only SVG width with no numeric Y-axis, clipping the
// rightmost bar on narrower screens. The fix after that (scaling the SVG
// down to whatever width the device gave it via viewBox) traded clipping
// for a worse problem: a dense chart (many series x many categories) got
// scaled down below readability on real phones, since nothing stopped it
// shrinking arbitrarily small.
//
// This version fixes that: every bar/line chart and table computes its own
// minimum readable width from its data (a guaranteed per-bar width, a
// guaranteed per-label slot, a guaranteed per-column width). It is scaled
// UP to fill extra space on a wide screen, but never shrunk below that
// minimum — when the screen is narrower than the content needs, the chart
// renders at its full natural size and the user swipes to see the rest,
// with a hint shown only when that's actually the case.
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

const SMALL_BAR_CHART: WritingChartData = {
  type: 'bar',
  unit: '%',
  series: [{ label: 'Household waste recycled', points: [{ x: 'A', y: 42 }, { x: 'B', y: 67 }] }],
};

// 4 series x 6 categories — deliberately denser than any real shipped
// dataset, to guarantee this exercises the "doesn't fit any reasonable
// phone" branch regardless of the exact tuning constants.
const DENSE_BAR_CHART: WritingChartData = {
  type: 'bar',
  unit: '%',
  series: [
    { label: 'Series A', points: [1, 2, 3, 4, 5, 6].map((n) => ({ x: `20${10 + n}`, y: n * 5 })) },
    { label: 'Series B', points: [1, 2, 3, 4, 5, 6].map((n) => ({ x: `20${10 + n}`, y: n * 4 })) },
    { label: 'Series C', points: [1, 2, 3, 4, 5, 6].map((n) => ({ x: `20${10 + n}`, y: n * 3 })) },
    { label: 'Series D', points: [1, 2, 3, 4, 5, 6].map((n) => ({ x: `20${10 + n}`, y: n * 2 })) },
  ],
};

// A real shipped prompt's chart — 4 series across only 2 categories, the
// densest-per-group real dataset (see lib/content/writingPrompts.ts).
const REAL_UNIVERSITY_ENROLMENT_CHART = content.writingPrompts.find((p) => p.title.startsWith('University Enrolment by Faculty'))!
  .chartData as WritingChartData;

const SMALL_TABLE: WritingChartData = {
  type: 'table',
  headers: ['City', 'Car'],
  rows: [['A', '55%'], ['B', '30%']],
};

// A real shipped prompt's table with long headers and a long row value —
// see "Visitor Numbers at Four City Museums" in lib/content/writingPrompts.ts.
const REAL_MUSEUM_VISITORS_TABLE = content.writingPrompts.find((p) => p.title.startsWith('Visitor Numbers at Four City Museums'))!
  .chartData as WritingChartData;

async function renderChart(data: WritingChartData) {
  return render(
    <ThemeProvider>
      <WritingChart data={data} />
    </ThemeProvider>
  );
}

async function layout(element: unknown, width: number) {
  await fireEvent(element as never, 'layout', { nativeEvent: { layout: { width, height: 0, x: 0, y: 0 } } });
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

describe('WritingChart bar/line — fills available width when the chart comfortably fits', () => {
  it('renders at its own natural width before the container has been measured', async () => {
    const { getByTestId, queryByTestId } = await renderChart(SMALL_BAR_CHART);
    const svg = getByTestId('writing-chart-svg');
    expect(svg.props.width).toBeGreaterThan(0);
    expect(queryByTestId('writing-chart-scroll')).toBeNull();
    expect(queryByTestId('writing-chart-scroll-hint')).toBeNull();
  });

  it('scales up to fill a viewport comfortably wider than the chart needs, with no scroll/hint', async () => {
    const { getByTestId, queryByTestId } = await renderChart(SMALL_BAR_CHART);
    const container = getByTestId('writing-chart-container');
    await layout(container, 500);

    const svg = getByTestId('writing-chart-svg');
    expect(svg.props.width).toBe(500);
    expect(queryByTestId('writing-chart-scroll')).toBeNull();
    expect(queryByTestId('writing-chart-scroll-hint')).toBeNull();
  });

  it('shrinks down to fill a narrower viewport ONLY while that viewport still fits the chart\'s content', async () => {
    const { getByTestId, queryByTestId } = await renderChart(SMALL_BAR_CHART);
    const container = getByTestId('writing-chart-container');
    // Before any layout measurement, the chart renders at its own natural
    // content width (see the component's pre-measurement fallback).
    const naturalWidth = getByTestId('writing-chart-svg').props.width;

    await layout(container, naturalWidth + 5);
    const svg = getByTestId('writing-chart-svg');
    expect(svg.props.width).toBe(naturalWidth + 5);
    expect(queryByTestId('writing-chart-scroll')).toBeNull();
  });
});

describe('WritingChart bar/line — never shrinks below readable; scrolls instead', () => {
  it('does not shrink a dense chart below its natural width on a narrow viewport — scrolls instead', async () => {
    const { getByTestId, queryByTestId } = await renderChart(DENSE_BAR_CHART);
    const container = getByTestId('writing-chart-container');
    await layout(container, 280);

    expect(queryByTestId('writing-chart-scroll')).not.toBeNull();
    expect(queryByTestId('writing-chart-scroll-hint')).not.toBeNull();
    const svg = getByTestId('writing-chart-svg');
    // The SVG's own width must exceed the viewport — this is what proves
    // the content is NOT shrunk to fit; scrolling is what reveals the rest.
    expect(svg.props.width).toBeGreaterThan(280);
  });

  it('renders the identical, full, unclipped width regardless of how much narrower the viewport gets', async () => {
    const { getByTestId } = await renderChart(DENSE_BAR_CHART);
    const container = getByTestId('writing-chart-container');

    await layout(container, 280);
    const widthAt280 = getByTestId('writing-chart-svg').props.width;

    await layout(container, 150);
    const widthAt150 = getByTestId('writing-chart-svg').props.width;

    // A narrower viewport must NOT shrink the chart further — both report
    // the same full content width, and scrolling (not shrinking) is what
    // changes to accommodate the narrower space.
    expect(widthAt150).toBe(widthAt280);
  });

  it('shows the swipe hint only on the chart that actually needs it, never on one that fits', async () => {
    const small = await renderChart(SMALL_BAR_CHART);
    await layout(small.getByTestId('writing-chart-container'), 400);
    expect(small.queryByTestId('writing-chart-scroll-hint')).toBeNull();

    const dense = await renderChart(DENSE_BAR_CHART);
    await layout(dense.getByTestId('writing-chart-container'), 400);
    expect(dense.queryByTestId('writing-chart-scroll-hint')).not.toBeNull();
  });

  it('keeps vertical vs. horizontal scrolling separate: the chart scroll view is horizontal-only', async () => {
    const { getByTestId } = await renderChart(DENSE_BAR_CHART);
    await layout(getByTestId('writing-chart-container'), 280);
    const scroll = getByTestId('writing-chart-scroll');
    expect(scroll.props.horizontal).toBe(true);
  });

  it('a real shipped 4-series chart (University Enrolment by Faculty) needs scrolling once the viewport is narrower than its content', async () => {
    expect(REAL_UNIVERSITY_ENROLMENT_CHART.type).toBe('bar');
    const { getByTestId, queryByTestId } = await renderChart(REAL_UNIVERSITY_ENROLMENT_CHART);
    const container = getByTestId('writing-chart-container');

    // Before any layout measurement, the chart renders at its own natural
    // content width (see the component's pre-measurement fallback).
    const naturalWidth = getByTestId('writing-chart-svg').props.width;

    // A viewport wide enough still just fills, no scrolling needed.
    await layout(container, naturalWidth + 50);
    expect(queryByTestId('writing-chart-scroll')).toBeNull();

    // ...then confirm a viewport narrower than that triggers scrolling,
    // with the full, unshrunk chart still rendered underneath it.
    await layout(container, naturalWidth - 20);
    expect(queryByTestId('writing-chart-scroll')).not.toBeNull();
    const svg = getByTestId('writing-chart-svg');
    expect(svg.props.width).toBe(naturalWidth);
  });
});

describe('WritingChart bar/line — renders without crashing for every real shipped dataset', () => {
  const realCharts = content.writingPrompts
    .map((p) => p.chartData)
    .filter((c): c is WritingChartData => Boolean(c) && (c!.type === 'bar' || c!.type === 'line'));

  it('has at least one real bar and one real line chart to test against', () => {
    expect(realCharts.some((c) => c.type === 'bar')).toBe(true);
    expect(realCharts.some((c) => c.type === 'line')).toBe(true);
  });

  it.each(realCharts.map((c, i) => [i, c] as const))('dataset #%i renders at a narrow (280px) and a wide (900px) viewport', async (_i, chartData) => {
    const narrow = await renderChart(chartData);
    await layout(narrow.getByTestId('writing-chart-container'), 280);
    expect(narrow.getByTestId('writing-chart-svg').props.width).toBeGreaterThanOrEqual(280);
    await narrow.unmount();

    const wide = await renderChart(chartData);
    await layout(wide.getByTestId('writing-chart-container'), 900);
    // On a viewport this wide every real dataset fits, so it should fill
    // exactly — never scroll, never get clipped.
    expect(wide.queryByTestId('writing-chart-scroll')).toBeNull();
    expect(wide.getByTestId('writing-chart-svg').props.width).toBe(900);
    await wide.unmount();
  });
});

describe('WritingChart table — same fits-or-scrolls behaviour as bar/line', () => {
  it('fills the viewport with equal-width columns when the table comfortably fits, no scroll/hint', async () => {
    const { getByTestId, queryByTestId } = await renderChart(SMALL_TABLE);
    await layout(getByTestId('writing-table-container'), 400);
    expect(queryByTestId('writing-table-scroll')).toBeNull();
    expect(queryByTestId('writing-table-scroll-hint')).toBeNull();
  });

  it('a real table with long headers and long cell values scrolls on a narrow viewport instead of wrapping into unreadable cells', async () => {
    expect(REAL_MUSEUM_VISITORS_TABLE.type).toBe('table');
    const { getByTestId, queryByTestId } = await renderChart(REAL_MUSEUM_VISITORS_TABLE);
    await layout(getByTestId('writing-table-container'), 280);
    expect(queryByTestId('writing-table-scroll')).not.toBeNull();
    expect(queryByTestId('writing-table-scroll-hint')).not.toBeNull();
  });

  it('that same real table fills the viewport with no scroll when there is enough room', async () => {
    const { getByTestId, queryByTestId } = await renderChart(REAL_MUSEUM_VISITORS_TABLE);
    await layout(getByTestId('writing-table-container'), 900);
    expect(queryByTestId('writing-table-scroll')).toBeNull();
  });

  it('renders without crashing for every real shipped table dataset at a narrow viewport', async () => {
    const realTables = content.writingPrompts
      .map((p) => p.chartData)
      .filter((c): c is WritingChartData => Boolean(c) && c!.type === 'table');
    expect(realTables.length).toBeGreaterThan(0);
    for (const chartData of realTables) {
      const { getByTestId, unmount } = await renderChart(chartData);
      await layout(getByTestId('writing-table-container'), 280);
      await unmount();
    }
  });
});

describe('WritingChart — pie/process/map never need horizontal scrolling', () => {
  it('renders every real pie/process/map dataset without crashing, even at a very narrow width, with no scroll affordance', async () => {
    const realOthers = content.writingPrompts
      .map((p) => p.chartData)
      .filter((c): c is WritingChartData => Boolean(c) && ['pie', 'process', 'map'].includes(c!.type));
    expect(realOthers.length).toBeGreaterThan(0);
    for (const chartData of realOthers) {
      const { queryByTestId, unmount } = await renderChart(chartData);
      expect(queryByTestId('writing-chart-scroll')).toBeNull();
      expect(queryByTestId('writing-table-scroll')).toBeNull();
      await unmount();
    }
  });
});

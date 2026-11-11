import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { type LayoutChangeEvent, ScrollView, View } from 'react-native';
import Svg, { G, Line, Path, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import type { WritingChartData } from '@/types/models';

const SERIES_COLORS = ['#2F5DE3', '#1B9C9C', '#7C5CE0', '#E2694F', '#C98A1B'];

const SWIPE_HINT = 'Swipe to view full chart →';

/** Picks a "nice" axis maximum and a small set of evenly spaced tick
 * values (0..max), the way a human-drawn chart would round its scale
 * rather than using the raw data max verbatim — e.g. 0/25/50/75/100
 * rather than 0/23.4/46.8/... for a max around 93. Falls back to integer
 * ticks on a small scale, fractional ticks (one decimal) on a sub-1 scale. */
/** Standard "nice number" axis rounding (Heckbert's algorithm): rounds a
 * value to 1, 2, 5, or 10 times a power of ten — rounding up when picking
 * a step (so tickCount steps are guaranteed to reach the real max), down
 * when picking the overall range. */
function niceNumber(value: number, roundUp: boolean): number {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);
  const niceFraction = roundUp
    ? fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10
    : fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return niceFraction * Math.pow(10, exponent);
}

export function niceAxisTicks(rawMax: number, tickCount = 4): { max: number; ticks: number[]; decimals: number } {
  const safeRawMax = Math.max(rawMax, 1e-6);
  const range = niceNumber(safeRawMax, false);
  const step = niceNumber(range / tickCount, true);
  const max = Math.ceil(safeRawMax / step) * step;
  const decimals = step < 1 ? 1 : 0;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step / 1000; v += step) ticks.push(Math.round(v / step) * step);
  return { max, ticks, decimals };
}

/** Renders the chart/diagram data attached to a Writing Task 1 prompt —
 * entirely locally, with no external image asset required. */
export function WritingChart({ data }: { data: WritingChartData }) {
  switch (data.type) {
    case 'bar':
    case 'line':
      return <BarOrLineChart data={data} />;
    case 'pie':
      return <PieChart data={data} />;
    case 'table':
      return <TableChart data={data} />;
    case 'process':
      return <ProcessDiagram data={data} />;
    case 'map':
      return <MapDiagram data={data} />;
  }
}

// Fixed logical canvas height; every Y coordinate below is computed against
// it. Width is NOT fixed — see computeBarLineLayout.
const CHART_HEIGHT = 220;
const CHART_PADDING = { left: 44, right: 12, top: 16, bottom: 28 };
// A bar narrower than this, or an x-axis label packed tighter than this,
// stops being readable on a real phone — this was the actual bug: the old
// layout always rescaled a fixed 320px canvas down to whatever width the
// device gave it, so a dense chart (many series x many categories) shrank
// bars/labels below this floor on anything but a wide screen.
const MIN_BAR_WIDTH = 18;
const BAR_GAP = 3;
const GROUP_PADDING = 12;
const MIN_LABEL_SLOT = 32;
const LABEL_CHAR_WIDTH = 7;
const LABEL_CHAR_PADDING = 10;

/** Computes this chart's own minimum readable width from its data — a
 * single-series 3-point chart needs far less room than a 4-series 6-point
 * one. This is the chart's "natural" size: never shrunk below it (that's
 * what caused the bug), only ever scaled UP to fill extra space when the
 * screen has room to spare. */
function computeBarLineLayout(data: Extract<WritingChartData, { type: 'bar' | 'line' }>) {
  const allPoints = data.series.flatMap((s) => s.points);
  const xLabels = Array.from(new Set(allPoints.map((p) => p.x)));
  const seriesCount = Math.max(1, data.series.length);
  const longestLabelLen = xLabels.reduce((m, l) => Math.max(m, l.length), 0);
  const minLabelSlot = Math.max(MIN_LABEL_SLOT, longestLabelLen * LABEL_CHAR_WIDTH + LABEL_CHAR_PADDING);
  const slotWidth =
    data.type === 'bar'
      ? Math.max(seriesCount * MIN_BAR_WIDTH + (seriesCount - 1) * BAR_GAP + GROUP_PADDING, minLabelSlot)
      : minLabelSlot;
  const plotWidth = Math.max(1, xLabels.length) * slotWidth;
  const contentWidth = Math.round(CHART_PADDING.left + CHART_PADDING.right + plotWidth);
  return { xLabels, seriesCount, slotWidth, contentWidth };
}

function BarOrLineChart({ data }: { data: Extract<WritingChartData, { type: 'bar' | 'line' }> }) {
  const theme = useTheme();
  const { xLabels, seriesCount, slotWidth, contentWidth } = computeBarLineLayout(data);
  const plotW = contentWidth - CHART_PADDING.left - CHART_PADDING.right;
  const plotH = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  // The real available width for the chart, measured once this View lays
  // out (null beforehand). Distinct from contentWidth, which is this
  // chart's own minimum size regardless of the screen.
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  function handleLayout(e: LayoutChangeEvent) {
    const measured = e.nativeEvent.layout.width;
    if (measured > 0) setViewportWidth(measured);
  }
  // Before the first layout event, render at this chart's natural size
  // rather than guessing — avoids a flash of an incorrectly-shrunk chart.
  const needsScroll = viewportWidth != null && viewportWidth < contentWidth;
  const renderWidth = viewportWidth != null && !needsScroll ? viewportWidth : contentWidth;
  const renderHeight = viewportWidth != null && !needsScroll ? renderWidth * (CHART_HEIGHT / contentWidth) : CHART_HEIGHT;

  const rawMaxY = Math.max(1, ...data.series.flatMap((s) => s.points.map((p) => p.y)));
  const { max: maxY, ticks: yTicks, decimals: yDecimals } = niceAxisTicks(rawMaxY);

  // Bar groups each get their own equal, non-overlapping slot (see
  // computeBarLineLayout); line charts instead space points edge-to-edge
  // across the full plot area, the conventional way to draw a line graph.
  const xScale = (x: string) => {
    const i = xLabels.indexOf(x);
    if (data.type === 'bar') return CHART_PADDING.left + i * slotWidth + slotWidth / 2;
    return xLabels.length > 1 ? CHART_PADDING.left + (i / (xLabels.length - 1)) * plotW : CHART_PADDING.left + plotW / 2;
  };
  const yScale = (y: number) => CHART_PADDING.top + plotH - (y / maxY) * plotH;

  const totalBarsWidth = seriesCount * MIN_BAR_WIDTH + (seriesCount - 1) * BAR_GAP;

  const svgChildren = (
    <>
      <Line x1={CHART_PADDING.left} y1={CHART_PADDING.top} x2={CHART_PADDING.left} y2={CHART_HEIGHT - CHART_PADDING.bottom} stroke={theme.colors.border} strokeWidth={1} />
      <Line
        x1={CHART_PADDING.left}
        y1={CHART_HEIGHT - CHART_PADDING.bottom}
        x2={contentWidth - CHART_PADDING.right}
        y2={CHART_HEIGHT - CHART_PADDING.bottom}
        stroke={theme.colors.border}
        strokeWidth={1}
      />
      {yTicks.map((tick) => {
        const y = yScale(tick);
        return (
          <G key={`y-tick-${tick}`}>
            <Line x1={CHART_PADDING.left - 4} y1={y} x2={CHART_PADDING.left} y2={y} stroke={theme.colors.border} strokeWidth={1} />
            <SvgText x={CHART_PADDING.left - 8} y={y + 3} fontSize={9} fill={theme.colors.textTertiary} textAnchor="end">
              {tick.toFixed(yDecimals)}
            </SvgText>
          </G>
        );
      })}
      {xLabels.map((label) => (
        <SvgText key={label} x={xScale(label)} y={CHART_HEIGHT - CHART_PADDING.bottom + 16} fontSize={10} fill={theme.colors.textTertiary} textAnchor="middle">
          {label}
        </SvgText>
      ))}
      {data.type === 'line'
        ? data.series.map((s, si) => (
            <Polyline
              key={s.label}
              points={s.points.map((p) => `${xScale(p.x)},${yScale(p.y)}`).join(' ')}
              fill="none"
              stroke={SERIES_COLORS[si % SERIES_COLORS.length]}
              strokeWidth={2.5}
            />
          ))
        : data.series.map((s, si) =>
            s.points.map((p, pi) => {
              const groupCenter = xScale(p.x);
              const groupStart = groupCenter - totalBarsWidth / 2;
              const x = groupStart + si * (MIN_BAR_WIDTH + BAR_GAP);
              const y = yScale(p.y);
              return (
                <Rect
                  key={`${s.label}-${pi}`}
                  x={x}
                  y={y}
                  width={MIN_BAR_WIDTH}
                  height={CHART_HEIGHT - CHART_PADDING.bottom - y}
                  fill={SERIES_COLORS[si % SERIES_COLORS.length]}
                  rx={2}
                />
              );
            })
          )}
    </>
  );

  return (
    <View testID="writing-chart-container" onLayout={handleLayout} style={{ width: '100%' }}>
      {needsScroll ? (
        // Horizontal-only: a horizontal ScrollView nested inside the
        // writing-test screen's vertical one doesn't fight it — RN routes a
        // horizontal drag to this ScrollView and a vertical one to the
        // ancestor, so page scrolling is unaffected. The SVG below renders
        // at its full native size (contentWidth), not scaled down, so
        // scrolling reveals the complete, unclipped chart.
        <ScrollView testID="writing-chart-scroll" horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
          <Svg testID="writing-chart-svg" width={contentWidth} height={CHART_HEIGHT} viewBox={`0 0 ${contentWidth} ${CHART_HEIGHT}`}>
            {svgChildren}
          </Svg>
        </ScrollView>
      ) : (
        <Svg testID="writing-chart-svg" width={renderWidth} height={renderHeight} viewBox={`0 0 ${contentWidth} ${CHART_HEIGHT}`}>
          {svgChildren}
        </Svg>
      )}
      {needsScroll ? (
        <Text testID="writing-chart-scroll-hint" variant="micro" color="tertiary" style={{ marginTop: 2, textAlign: 'center' }}>
          {SWIPE_HINT}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginTop: theme.spacing.xs }}>
        {data.series.map((s, i) => (
          <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }} />
            <Text variant="caption" color="secondary">
              {s.label}
              {data.unit ? ` (${data.unit})` : ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PieChart({ data }: { data: Extract<WritingChartData, { type: 'pie' }> }) {
  const theme = useTheme();
  const size = 180;
  const r = 80;
  const cx = size / 2;
  const cy = size / 2;
  const total = data.segments.reduce((sum, s) => sum + s.value, 0) || 1;

  const startAngles = data.segments.reduce<number[]>((acc, seg) => {
    const prev = acc.length ? acc[acc.length - 1] : -90;
    const sweep = (seg.value / total) * 360;
    acc.push(prev + sweep);
    return acc;
  }, []);
  const arcs = data.segments.map((seg, i) => {
    const sweep = (seg.value / total) * 360;
    const startAngle = i === 0 ? -90 : startAngles[i - 1];
    const endAngle = startAngles[i];
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = sweep > 180 ? 1 : 0;
    return { path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`, color: SERIES_COLORS[i % SERIES_COLORS.length] };
  });

  // Fixed small SVG (180px) + a legend that wraps its own text onto new
  // lines as it shrinks — unlike the bar/line chart, nothing here is ever
  // clipped by a narrow screen, so no horizontal scroll is needed.
  //
  // The explicit width: '100%' on the root is still required, though: the
  // legend column below is flex: 1, and a flex child only gets a real
  // (non-zero) measured width when ITS parent has a definite width to
  // divide up. Under writing-test.tsx's alignItems: 'center' wrapper, a
  // root with no explicit width shrinks to hug its own content instead of
  // reporting the available width, so React Native resolves that flex: 1
  // legend to zero width and its labels silently never render — the same
  // class of bug fixed in ProcessDiagram/MapDiagram below.
  return (
    <View testID="writing-pie-container" style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, width: '100%' }}>
      <Svg width={size} height={size}>
        <G>
          {arcs.map((a, i) => (
            <Path key={i} d={a.path} fill={a.color} />
          ))}
        </G>
      </Svg>
      <View style={{ gap: 6, flex: 1 }}>
        {data.segments.map((s, i) => (
          <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }} />
            <Text variant="caption" color="secondary">
              {s.label} — {Math.round((s.value / total) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const TABLE_MIN_COL_WIDTH = 90;
const TABLE_CHAR_WIDTH = 6.5;
const TABLE_CELL_PADDING = 16;

function TableChart({ data }: { data: Extract<WritingChartData, { type: 'table' }> }) {
  const theme = useTheme();
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  function handleLayout(e: LayoutChangeEvent) {
    const measured = e.nativeEvent.layout.width;
    if (measured > 0) setViewportWidth(measured);
  }

  // Same idea as the bar/line chart: a column never gets squeezed below a
  // width that actually fits its longest cell — if that sum doesn't fit the
  // screen, scroll to reveal it instead of wrapping every cell into an
  // unreadable stack of one-word lines.
  const colWidths = data.headers.map((h, ci) => {
    const longest = Math.max(h.length, ...data.rows.map((r) => (r[ci] ?? '').length));
    return Math.max(TABLE_MIN_COL_WIDTH, Math.round(longest * TABLE_CHAR_WIDTH + TABLE_CELL_PADDING));
  });
  const naturalTableWidth = colWidths.reduce((a, b) => a + b, 0);
  const needsScroll = viewportWidth != null && viewportWidth < naturalTableWidth;

  const fixedWidthTable = (
    <View style={{ width: naturalTableWidth, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', backgroundColor: theme.colors.surfaceAlt }}>
        {data.headers.map((h, i) => (
          <Text key={i} variant="caption" style={{ width: colWidths[i], padding: theme.spacing.xs, fontWeight: '700' as const }}>
            {h}
          </Text>
        ))}
      </View>
      {data.rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.border }}>
          {row.map((cell, ci) => (
            <Text key={ci} variant="caption" color="secondary" style={{ width: colWidths[ci], padding: theme.spacing.xs }}>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <View testID="writing-table-container" onLayout={handleLayout} style={{ width: '100%' }}>
      {needsScroll ? (
        <ScrollView testID="writing-table-scroll" horizontal showsHorizontalScrollIndicator nestedScrollEnabled>
          {fixedWidthTable}
        </ScrollView>
      ) : (
        <View style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', backgroundColor: theme.colors.surfaceAlt }}>
            {data.headers.map((h, i) => (
              <Text key={i} variant="caption" style={{ flex: 1, padding: theme.spacing.xs, fontWeight: '700' as const }}>
                {h}
              </Text>
            ))}
          </View>
          {data.rows.map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.border }}>
              {row.map((cell, ci) => (
                <Text key={ci} variant="caption" color="secondary" style={{ flex: 1, padding: theme.spacing.xs }}>
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
      {needsScroll ? (
        <Text testID="writing-table-scroll-hint" variant="micro" color="tertiary" style={{ marginTop: 2, textAlign: 'center' }}>
          {SWIPE_HINT}
        </Text>
      ) : null}
    </View>
  );
}

const PROCESS_CIRCLE_SIZE = 24;

// Root needs an explicit width for the same reason PieChart's does: under
// writing-test.tsx's alignItems: 'center' wrapper, a root with no width
// shrinks to hug its content instead of taking the available width, and
// each row's flex: 1 step-description Text then resolves to zero width —
// this was the actual bug (only the numbered circles were visible, with no
// step text and no connector between them).
function ProcessDiagram({ data }: { data: Extract<WritingChartData, { type: 'process' }> }) {
  const theme = useTheme();
  return (
    <View testID="writing-process-container" style={{ width: '100%' }}>
      {data.steps.map((step, i) => (
        <React.Fragment key={i}>
          <View testID="writing-process-step" style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
            <View
              style={{
                width: PROCESS_CIRCLE_SIZE,
                height: PROCESS_CIRCLE_SIZE,
                borderRadius: PROCESS_CIRCLE_SIZE / 2,
                backgroundColor: theme.colors.primarySoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text variant="micro" color="brand">
                {i + 1}
              </Text>
            </View>
            <Text variant="body" style={{ flex: 1 }}>
              {step}
            </Text>
          </View>
          {i < data.steps.length - 1 ? (
            // A connecting arrow between consecutive steps, centred under
            // the numbered circle — shows the sequence already implied by
            // the step order, nothing beyond what the data already says.
            <View testID="writing-process-connector" style={{ width: PROCESS_CIRCLE_SIZE, alignItems: 'center' }}>
              <Ionicons name="arrow-down" size={16} color={theme.colors.textTertiary} />
            </View>
          ) : null}
        </React.Fragment>
      ))}
    </View>
  );
}

function MapDiagram({ data }: { data: Extract<WritingChartData, { type: 'map' }> }) {
  const theme = useTheme();
  return (
    <View testID="writing-map-container" style={{ gap: theme.spacing.xs, width: '100%' }}>
      <Text variant="body" color="secondary">
        {data.description}
      </Text>
      {data.features.map((f, i) => (
        <View key={i} testID="writing-map-feature" style={{ flexDirection: 'row', gap: 6 }}>
          <Text variant="body">•</Text>
          <Text variant="body" style={{ flex: 1 }}>
            {f}
          </Text>
        </View>
      ))}
    </View>
  );
}

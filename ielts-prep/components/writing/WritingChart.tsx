import React from 'react';
import { View } from 'react-native';
import Svg, { G, Line, Path, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import type { WritingChartData } from '@/types/models';

const SERIES_COLORS = ['#2F5DE3', '#1B9C9C', '#7C5CE0', '#E2694F', '#C98A1B'];

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

function BarOrLineChart({ data }: { data: Extract<WritingChartData, { type: 'bar' | 'line' }> }) {
  const theme = useTheme();
  const width = 320;
  const height = 220;
  const padding = { left: 40, right: 12, top: 16, bottom: 28 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const allPoints = data.series.flatMap((s) => s.points);
  const xLabels = Array.from(new Set(allPoints.map((p) => p.x)));
  const maxY = Math.max(1, ...allPoints.map((p) => p.y)) * 1.15;

  const xScale = (x: string) => {
    const i = xLabels.indexOf(x);
    return xLabels.length > 1 ? padding.left + (i / (xLabels.length - 1)) * plotW : padding.left + plotW / 2;
  };
  const yScale = (y: number) => padding.top + plotH - (y / maxY) * plotH;

  const barGroupWidth = plotW / xLabels.length;
  const barWidth = Math.min(28, (barGroupWidth * 0.7) / data.series.length);

  return (
    <View>
      <Svg width={width} height={height}>
        <Line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke={theme.colors.border} strokeWidth={1} />
        <Line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke={theme.colors.border}
          strokeWidth={1}
        />
        {xLabels.map((label) => (
          <SvgText key={label} x={xScale(label)} y={height - padding.bottom + 16} fontSize={10} fill={theme.colors.textTertiary} textAnchor="middle">
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
                const groupStart = xScale(p.x) - barGroupWidth / 2 + (barGroupWidth - data.series.length * barWidth) / 2;
                const x = groupStart + si * barWidth;
                const y = yScale(p.y);
                return (
                  <Rect
                    key={`${s.label}-${pi}`}
                    x={x}
                    y={y}
                    width={barWidth - 2}
                    height={height - padding.bottom - y}
                    fill={SERIES_COLORS[si % SERIES_COLORS.length]}
                    rx={2}
                  />
                );
              })
            )}
      </Svg>
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

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
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

function TableChart({ data }: { data: Extract<WritingChartData, { type: 'table' }> }) {
  const theme = useTheme();
  return (
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
  );
}

function ProcessDiagram({ data }: { data: Extract<WritingChartData, { type: 'process' }> }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      {data.steps.map((step, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
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
      ))}
    </View>
  );
}

function MapDiagram({ data }: { data: Extract<WritingChartData, { type: 'map' }> }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text variant="body" color="secondary">
        {data.description}
      </Text>
      {data.features.map((f, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 6 }}>
          <Text variant="body">•</Text>
          <Text variant="body" style={{ flex: 1 }}>
            {f}
          </Text>
        </View>
      ))}
    </View>
  );
}

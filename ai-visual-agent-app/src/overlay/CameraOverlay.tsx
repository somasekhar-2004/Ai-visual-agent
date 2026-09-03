import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";

import type { VisualTarget } from "../types";
import { computeCoverTransform, mapPoint, type Size } from "./coordinateMapping";

const ACCENT = "#22d3ee"; // cyan-400 - "source" targets
const ACCENT_DIM = "rgba(34, 211, 238, 0.35)";
const DEST_ACCENT = "#f59e0b"; // amber-400 - "destination" targets
const DEST_ACCENT_DIM = "rgba(245, 158, 11, 0.35)";
const LINK_COLOR = "rgba(226, 232, 240, 0.85)";

interface CameraOverlayProps {
  /** Targets from the latest Gemini response - unmodified, still in normalized (0-1) frame
   * coordinates; this component does the frame -> screen mapping itself. */
  targets: VisualTarget[];
  /** Pixel size of the analyzed frame that `targets`' coordinates are normalized against (the
   * resized image actually sent to the backend). */
  frameSize: Size;
  /** Pixel size of the on-screen camera preview container. */
  containerSize: Size | null;
  /** Estimated on-screen pixel shift since `targets`' frame was captured - see
   * useTrackedTargets.ts. Applied as a single translation on the whole group, not baked into
   * each individual target's own coordinates. */
  pixelOffset: { dx: number; dy: number };
}

/**
 * Renders live on top of the camera preview (a sibling View, never baked into a captured image) -
 * the preview itself never pauses. Mirrors the web app's CameraOverlay.tsx shape/color/label
 * conventions (cyan source / amber destination / dashed connector) using react-native-svg instead
 * of a 2D canvas.
 */
export function CameraOverlay({ targets, frameSize, containerSize, pixelOffset }: CameraOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevTargetsRef = useRef<VisualTarget[]>(targets);

  useEffect(() => {
    if (prevTargetsRef.current === targets) return;
    prevTargetsRef.current = targets;
    // Soften a sudden target-set change (new Gemini response landing) with a quick fade rather
    // than an instant hard cut - the position itself still updates immediately underneath, this
    // just avoids a jarring flash.
    fadeAnim.setValue(0.25);
    Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [targets, fadeAnim]);

  if (!containerSize || targets.length === 0) return null;

  const transform = computeCoverTransform(containerSize, frameSize);
  const centers = new Map<string, { x: number; y: number }>();

  const shapes = targets.map((target) => {
    const hasPath = target.shape === "path" && target.path && target.path.length >= 2;
    if (!target.boundingBox && !hasPath) return null;

    const isDestination = target.role === "destination";
    const color = isDestination ? DEST_ACCENT : ACCENT;
    const colorDim = isDestination ? DEST_ACCENT_DIM : ACCENT_DIM;

    let px: number, py: number, pw: number, ph: number;
    if (target.boundingBox) {
      const { x, y, width, height } = target.boundingBox;
      const topLeft = mapPoint(x, y, frameSize, transform);
      px = topLeft.x;
      py = topLeft.y;
      pw = width * frameSize.width * transform.scale;
      ph = height * frameSize.height * transform.scale;
    } else {
      const xs = target.path!.map((p) => p.x);
      const ys = target.path!.map((p) => p.y);
      const minPt = mapPoint(Math.min(...xs), Math.min(...ys), frameSize, transform);
      const maxPt = mapPoint(Math.max(...xs), Math.max(...ys), frameSize, transform);
      px = minPt.x;
      py = minPt.y;
      pw = maxPt.x - minPt.x;
      ph = maxPt.y - minPt.y;
    }
    const cx = px + pw / 2;
    const cy = py + ph / 2;
    centers.set(target.id, { x: cx, y: cy });

    let shapeEl = null;
    if (hasPath) {
      const points = target.path!.map((p) => mapPoint(p.x, p.y, frameSize, transform));
      shapeEl = (
        <G>
          <Path
            d={`M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`}
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Circle cx={points[0].x} cy={points[0].y} r={4} fill={color} />
          <Circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4} fill={color} />
        </G>
      );
    } else if (target.shape === "circle") {
      const r = Math.max(pw, ph) / 2;
      shapeEl = <Circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={2.5} fill={colorDim} />;
    } else if (target.shape === "point") {
      shapeEl = (
        <G>
          <Line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} stroke={color} strokeWidth={2.5} />
          <Line x1={cx} y1={cy - 10} x2={cx} y2={cy + 10} stroke={color} strokeWidth={2.5} />
          <Circle cx={cx} cy={cy} r={4} fill={color} />
        </G>
      );
    } else {
      shapeEl = <Rect x={px} y={py} width={pw} height={ph} rx={8} stroke={color} strokeWidth={2.5} fill={colorDim} />;
    }

    const badgeAnchor = hasPath ? mapPoint(target.path![0].x, target.path![0].y, frameSize, transform) : { x: px, y: py };
    const badgeR = 12;
    const badgeX = badgeAnchor.x + badgeR + 2;
    const badgeY = badgeAnchor.y - badgeR - 2 < 0 ? badgeAnchor.y + badgeR + 2 : badgeAnchor.y - badgeR - 2;

    const label = isDestination ? `→ ${target.label}` : target.label;
    const labelY = py + ph + 4;
    // react-native-svg has no text-measurement API on-device without an extra native call, so the
    // label background is sized from an estimate (character count) rather than exact glyph
    // metrics - close enough for a small instructional label, occasionally a few px wider/narrower
    // than the text itself.
    const estCharWidth = 6.5;
    const labelW = Math.min(220, Math.max(40, label.length * estCharWidth + 12));

    return (
      <G key={target.id}>
        {shapeEl}
        <Circle cx={badgeX} cy={badgeY} r={badgeR} fill={color} />
        <SvgText x={badgeX} y={badgeY + 4.5} fontSize={13} fontWeight="bold" fill="#022c33" textAnchor="middle">
          {target.marker}
        </SvgText>
        <Rect x={Math.max(px, 0)} y={labelY} width={labelW} height={18} rx={4} fill="rgba(2,6,23,0.75)" />
        <SvgText x={Math.max(px, 0) + 6} y={labelY + 13} fontSize={12} fontWeight="600" fill="#e5faff">
          {label}
        </SvgText>
      </G>
    );
  });

  const connectors = targets.map((target) => {
    if (target.role !== "destination" || !target.linkedTargetId) return null;
    const from = centers.get(target.linkedTargetId);
    const to = centers.get(target.id);
    if (!from || !to) return null;

    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLen = 10;
    const p1 = { x: to.x - headLen * Math.cos(angle - Math.PI / 6), y: to.y - headLen * Math.sin(angle - Math.PI / 6) };
    const p2 = { x: to.x - headLen * Math.cos(angle + Math.PI / 6), y: to.y - headLen * Math.sin(angle + Math.PI / 6) };

    return (
      <G key={`link-${target.id}`}>
        <Line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={LINK_COLOR} strokeWidth={2} strokeDasharray="6,5" />
        <Polygon points={`${to.x},${to.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`} fill={LINK_COLOR} />
      </G>
    );
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: "absolute", inset: 0, opacity: fadeAnim }}
    >
      <Svg width={containerSize.width} height={containerSize.height}>
        <G transform={`translate(${pixelOffset.dx}, ${pixelOffset.dy})`}>
          {connectors}
          {shapes}
        </G>
      </Svg>
    </Animated.View>
  );
}

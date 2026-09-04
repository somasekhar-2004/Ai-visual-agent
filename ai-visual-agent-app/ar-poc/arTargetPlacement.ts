import type { RefObject } from "react";
import { PixelRatio } from "react-native";
import type { ViroARHitTestResult, ViroARScene } from "@reactvision/react-viro";

import type { TargetRole, VisualTarget } from "../src/types";
import { computeCoverTransform, mapPoint, type Size } from "../src/overlay/coordinateMapping";

/** ViroReact doesn't export its own Viro3DPoint type from the package root - this is the same
 * [x, y, z] shape, defined locally so this file has no dependency on an unexported internal type. */
export type Point3D = [number, number, number];

export interface PlacedMarker {
  id: string;
  marker: number;
  label: string;
  role?: TargetRole;
  linkedTargetId?: string | null;
  position: Point3D;
}

/**
 * Best-first ranking for which hit-test result to trust when several come back for one point -
 * mirrors the ranking ViroReact's own Studio tap-to-place feature uses internally (a confirmed
 * real surface beats a sparse feature point; LiDAR/depth data beats both).
 */
const HIT_TEST_PRIORITY: ViroARHitTestResult["type"][] = [
  "DepthPoint",
  "ExistingPlaneUsingExtent",
  "ExistingPlane",
  "EstimatedHorizontalPlane",
  "FeaturePoint",
];

function isUsablePosition(p: unknown): p is Point3D {
  return (
    Array.isArray(p) &&
    p.length >= 3 &&
    p.every((n) => typeof n === "number" && Number.isFinite(n)) &&
    !(p[0] === 0 && p[1] === 0 && p[2] === 0)
  );
}

function pickBestHit(results: ViroARHitTestResult[] | null | undefined): ViroARHitTestResult | null {
  if (!Array.isArray(results) || results.length === 0) return null;
  for (const type of HIT_TEST_PRIORITY) {
    const match = results.find((r) => r.type === type && isUsablePosition(r.transform?.position));
    if (match) return match;
  }
  return null;
}

/** One hit-test attempt at a normalized (0-1) frame point - converts to on-screen dp via the
 * shared "cover" mapping, then to raw device pixels the same way ViroReact's own tap-to-place
 * does (see the comment at its call site below), and returns the best-ranked usable result.
 * `label` is only for the diagnostic log line - identifies which target/retry this attempt is. */
async function hitTestAt(
  scene: ViroARScene,
  nx: number,
  ny: number,
  frameSize: Size,
  transform: ReturnType<typeof computeCoverTransform>,
  pixelRatio: number,
  label: string,
): Promise<ViroARHitTestResult | null> {
  const screenPoint = mapPoint(nx, ny, frameSize, transform);
  const physX = screenPoint.x * pixelRatio;
  const physY = screenPoint.y * pixelRatio;
  // Requested diagnostic logging for the mismatched-marker investigation: the full chain from
  // Gemini's normalized point down to the exact pixel handed to the native hit test, so a
  // mapping bug shows up as numbers in the log instead of something that has to be guessed at.
  console.log(
    `[ar-anchor:coords] ${label} normalized=(${nx.toFixed(4)}, ${ny.toFixed(4)}) -> dp=(${screenPoint.x.toFixed(1)}, ${screenPoint.y.toFixed(1)}) -> devicePx=(${physX.toFixed(1)}, ${physY.toFixed(1)}) [pixelRatio=${pixelRatio}]`,
  );
  const results: ViroARHitTestResult[] = await scene.performARHitTestWithPoint(physX, physY);
  return pickBestHit(results);
}

/**
 * A single representative 2D point (normalized 0-1, frame-relative) to hit-test for a target -
 * the bounding box center for a box/circle/point target, or a point actually ON the path for a
 * wire/path-shaped one.
 *
 * The path case deliberately does NOT use the path's bounding-box center (min/max of its x/y
 * extent) - for anything but a straight horizontal/vertical wire, that computed centroid is not
 * guaranteed to land anywhere near the path itself (an L-shaped or diagonal wire's bounding-box
 * center can fall in the empty space the wire bends around). It uses the path's own middle
 * vertex instead - a point Gemini actually placed on the wire - which is a real, likely
 * contributor to "no surface found" misses for path-shaped targets specifically, found by
 * re-reading this function, not by guessing.
 */
function targetCenter(target: VisualTarget): { x: number; y: number } | null {
  if (target.boundingBox) {
    const { x, y, width, height } = target.boundingBox;
    return { x: x + width / 2, y: y + height / 2 };
  }
  if (target.path && target.path.length > 0) {
    const mid = target.path[Math.floor(target.path.length / 2)];
    return { x: mid.x, y: mid.y };
  }
  return null;
}

/**
 * Small, bounded set of nearby points (normalized frame fractions) to retry a hit test against if
 * the exact target point misses. This is a legitimate, well-established AR UX pattern (a hit test
 * failing at one exact pixel while a real surface exists a few pixels away is routine - feature
 * detection is inherently a little noisy), not a way to fabricate a result: every point tried is
 * still hit-tested for real, and the search radius is kept small (up to ~3.5% of the frame) so a
 * successful retry is still visually right next to the original point, not a guess.
 *
 * Deliberately NOT implemented: falling back to the nearest already-detected plane regardless of
 * distance. That could easily place a marker on a real but unrelated surface (e.g. the table
 * instead of the small component sitting on it), which is worse than an honest "couldn't place
 * this one" - a confidently wrong pointer undermines the whole point of a precision AR marker.
 */
const RETRY_OFFSETS_NORMALIZED: { dx: number; dy: number }[] = [
  { dx: 0.015, dy: 0 },
  { dx: -0.015, dy: 0 },
  { dx: 0, dy: 0.015 },
  { dx: 0, dy: -0.015 },
  { dx: 0.03, dy: 0.03 },
  { dx: -0.03, dy: 0.03 },
  { dx: 0.03, dy: -0.03 },
  { dx: -0.03, dy: -0.03 },
];

/**
 * Hit-tests each target's 2D screen position against the live AR session and, for every target
 * that lands on a real surface/feature, creates a native AR anchor there.
 *
 * Targets that don't correspond to a real detected surface (no usable hit-test result under that
 * point) are skipped, not thrown - Gemini reasons over the flat 2D image; ARKit/ARCore reasons
 * over the live 3D surfaces it's actually mapped so far. Those two views of "the same" scene don't
 * always agree pixel-for-pixel, especially early in a session before much of the scene has been
 * scanned, or for a target that's genuinely on a feature-poor surface (bare wire, dark plastic).
 * This is a real, expected limitation of 2D-vision-to-3D-AR handoff, not a bug to fix here - see
 * the README's Phase C section.
 *
 * Runs each target's hit test sequentially (not concurrently) - there are only ever a handful of
 * targets per response, hit-testing is cheap, and sequential awaits sidestep any native-bridge
 * behavior for overlapping concurrent hit-test calls that can't be verified from this sandbox.
 *
 * @param isCancelled - checked before each target; lets the caller abandon a stale placement pass
 * (e.g. a newer response already arrived) without racing its results against a newer pass's.
 */
export async function placeTargets(
  sceneRef: RefObject<ViroARScene | null>,
  targets: VisualTarget[],
  frameSize: Size,
  containerSize: Size,
  isCancelled: () => boolean,
): Promise<{ placed: PlacedMarker[]; skipped: number }> {
  const scene = sceneRef.current;
  if (!scene) return { placed: [], skipped: targets.length };

  const transform = computeCoverTransform(containerSize, frameSize);
  const pixelRatio = PixelRatio.get();
  const placed: PlacedMarker[] = [];
  let skipped = 0;

  // Requested diagnostic: frameSize (the screenshot Gemini actually analyzed, resized by width
  // only so its aspect ratio here is exactly the raw screenshot's) vs. containerSize (the live
  // ViroARSceneNavigator view's own on-screen bounds - see ArMainApp.tsx for why it's now read
  // directly from the navigator itself, not an ancestor View). The "cover" mapping this hit-test
  // pipeline uses assumes these represent the *same* rectangle (same crop/field of view), just at
  // different sizes - if takeScreenshot() actually captures a different aspect ratio than what's
  // displayed edge-to-edge (letterboxing, a different crop, anything like that), this ratio will
  // visibly disagree, and that's a real, exact-source-of-error signal, not a guess.
  const frameAspect = frameSize.height / frameSize.width;
  const containerAspect = containerSize.height / containerSize.width;
  const aspectMismatchPct = Math.abs(frameAspect - containerAspect) / containerAspect;
  console.log(
    `[ar-anchor:coords] frameSize=${frameSize.width}x${frameSize.height} (aspect ${frameAspect.toFixed(4)}), ` +
      `containerSize=${containerSize.width}x${containerSize.height} (aspect ${containerAspect.toFixed(4)}), ` +
      `mismatch=${(aspectMismatchPct * 100).toFixed(1)}%`,
  );
  if (aspectMismatchPct > 0.03) {
    console.warn(
      `[ar-anchor:coords] frameSize/containerSize aspect ratios differ by ${(aspectMismatchPct * 100).toFixed(1)}% - ` +
        `the captured screenshot likely does NOT represent the same crop as what's on-screen. The "cover" mapping ` +
        `below is only valid when they match; a mismatch this size will misplace markers, worse the further a ` +
        `target is from the frame's center.`,
    );
  }

  for (const target of targets) {
    if (isCancelled()) break;

    const center = targetCenter(target);
    if (!center) {
      skipped++;
      console.warn(`[ar-anchor] target ${target.id} (${target.label}) has no boundingBox/path - skipping`);
      continue;
    }

    // Diagnostic only (no behavior change) for the misplaced-marker investigation: a "bottom of
    // frame ends up near the top of the screen" symptom is exactly what a Y-axis flip would
    // produce (e.g. Gemini's normalized y measured from a different edge than assumed here, or an
    // orientation/EXIF mismatch between the pixel buffer frameSize describes and the one Gemini
    // actually analyzed) - this line computes where the Y-flipped point (1-ny) would land, purely
    // so it can be compared against the real device-pixel point above in the log, without
    // committing to that guess as an actual fix.
    const flippedPoint = mapPoint(center.x, 1 - center.y, frameSize, transform);
    console.log(
      `[ar-anchor:coords] ${target.id} (${target.label}) if-Y-flipped would map to dp=(${flippedPoint.x.toFixed(1)}, ${flippedPoint.y.toFixed(1)}) - compare against the real hit test's dp point below and where the marker actually showed up on-device`,
    );

    // performARHitTestWithPoint expects raw device pixels, not React Native's dp units - confirmed
    // by reading ViroReact's own Studio tap-to-place call site, which does
    // `locationX * PixelRatio.get()` before calling it. hitTestAt() reproduces that same
    // conversion via mapPoint() (shared with the 2D SVG overlay's own coordinate math).
    let best: ViroARHitTestResult | null = null;
    let hitAt = "exact";
    try {
      best = await hitTestAt(scene, center.x, center.y, frameSize, transform, pixelRatio, `${target.id} (${target.label}) exact`);
      if (!best) {
        for (const offset of RETRY_OFFSETS_NORMALIZED) {
          if (isCancelled()) break;
          const nx = Math.min(1, Math.max(0, center.x + offset.dx));
          const ny = Math.min(1, Math.max(0, center.y + offset.dy));
          best = await hitTestAt(
            scene,
            nx,
            ny,
            frameSize,
            transform,
            pixelRatio,
            `${target.id} (${target.label}) retry dx=${offset.dx} dy=${offset.dy}`,
          );
          if (best) {
            hitAt = `nearby (dx=${offset.dx}, dy=${offset.dy})`;
            break;
          }
        }
      }
    } catch (err) {
      console.warn(`[ar-anchor] hit test threw for target ${target.id} (${target.label}):`, err);
      skipped++;
      continue;
    }

    if (!best) {
      console.warn(
        `[ar-anchor] no usable surface under target ${target.id} (${target.label}), even after ${RETRY_OFFSETS_NORMALIZED.length} nearby retries - skipping. ` +
          `This is often expected (low-feature surface, or ARKit/ARCore hasn't scanned this area yet - try moving the phone slightly around the target before asking).`,
      );
      skipped++;
      continue;
    }
    if (hitAt !== "exact") {
      console.log(`[ar-anchor] target ${target.id} (${target.label}) placed via ${hitAt} retry, not the exact point`);
    }

    // createAnchoredNode gives this point a real, persisted native AR anchor - the correct AR
    // practice for content meant to stay put, and what was explicitly asked for. In this
    // ViroReact version there's no ViroARNode to parent visible content under that anchor (see
    // the README's Phase C section), so its returned transform is used only as a - possibly
    // slightly refined - one-time position snapshot; the actual "stays locked" behavior for the
    // rendered marker comes from Viro's normal world-space positioning (the same mechanism Phase
    // A's tap-to-place sphere already proved works), not from this anchor. It's still created
    // because it costs nothing to have and is the more correct thing to do, not because placement
    // depends on it.
    let nodePosition: Point3D = best.transform.position;
    try {
      const nodeRef = await scene.createAnchoredNode(best);
      if (nodeRef?.transform?.position && isUsablePosition(nodeRef.transform.position)) {
        nodePosition = nodeRef.transform.position;
      }
    } catch (err) {
      console.warn(
        `[ar-anchor] createAnchoredNode failed for target ${target.id} (${target.label}), using raw hit position:`,
        err,
      );
    }

    placed.push({
      id: target.id,
      marker: target.marker,
      label: target.label,
      role: target.role,
      linkedTargetId: target.linkedTargetId,
      position: nodePosition,
    });
  }

  return { placed, skipped };
}

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

/** A single representative 2D point (normalized 0-1, frame-relative) to hit-test for a target -
 * the bounding box center, or the midpoint of a path's extent for wire/path-shaped targets. */
function targetCenter(target: VisualTarget): { x: number; y: number } | null {
  if (target.boundingBox) {
    const { x, y, width, height } = target.boundingBox;
    return { x: x + width / 2, y: y + height / 2 };
  }
  if (target.path && target.path.length > 0) {
    const xs = target.path.map((p) => p.x);
    const ys = target.path.map((p) => p.y);
    return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
  }
  return null;
}

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

  for (const target of targets) {
    if (isCancelled()) break;

    const center = targetCenter(target);
    if (!center) {
      skipped++;
      console.warn(`[ar-anchor] target ${target.id} (${target.label}) has no boundingBox/path - skipping`);
      continue;
    }

    // performARHitTestWithPoint expects raw device pixels, not React Native's dp units - confirmed
    // by reading ViroReact's own Studio tap-to-place call site, which does
    // `locationX * PixelRatio.get()` before calling it. mapPoint() (shared with the 2D SVG
    // overlay's own coordinate math) gives dp; multiply by PixelRatio.get() the same way.
    const screenPoint = mapPoint(center.x, center.y, frameSize, transform);
    const physX = screenPoint.x * pixelRatio;
    const physY = screenPoint.y * pixelRatio;

    let results: ViroARHitTestResult[] = [];
    try {
      results = await scene.performARHitTestWithPoint(physX, physY);
    } catch (err) {
      console.warn(`[ar-anchor] hit test threw for target ${target.id} (${target.label}):`, err);
      skipped++;
      continue;
    }

    const best = pickBestHit(results);
    if (!best) {
      console.warn(`[ar-anchor] no usable surface under target ${target.id} (${target.label}) - skipping`);
      skipped++;
      continue;
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

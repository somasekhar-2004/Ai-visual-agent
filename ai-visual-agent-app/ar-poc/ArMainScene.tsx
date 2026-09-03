import { useEffect, useRef, useState } from "react";
import { ViroARScene, ViroAmbientLight } from "@reactvision/react-viro";
import type { ViroTrackingReason, ViroTrackingState } from "@reactvision/react-viro";

import type { VisualTarget } from "../src/types";
import type { Size } from "../src/overlay/coordinateMapping";
import { ArAnchoredTargets } from "./ArAnchoredTargets";
import { placeTargets, type PlacedMarker } from "./arTargetPlacement";

/**
 * Phase C: the AR camera background for the real app flow, now also responsible for turning
 * Gemini's returned targets into real, world-anchored AR content - hit-testing each target's 2D
 * position against the live AR session (arTargetPlacement.ts) and rendering the results
 * (ArAnchoredTargets.tsx). Plane detection keeps running in the background the same as Phase B,
 * so there's always a live, mapped session to hit-test against.
 *
 * `targets`/`frameSize`/`containerSize` arrive as live-updating data from ArMainApp.tsx, not as
 * a one-time prop - see the long comment in ArMainApp.tsx above where this scene is constructed
 * for why that specifically requires ViroReact's `viroAppProps` channel rather than an ordinary
 * prop passed through `initialScene`'s scene factory (a real, verified ViroARSceneNavigator
 * behavior, not a stylistic choice).
 */

type Props = {
  targets: VisualTarget[];
  frameSize: Size;
  containerSize: Size | null;
  onTrackingStateChange: (state: ViroTrackingState, reason: ViroTrackingReason) => void;
  onPlacementStatusChange: (status: { placed: number; skipped: number; total: number } | null) => void;
};

export default function ArMainScene({
  targets,
  frameSize,
  containerSize,
  onTrackingStateChange,
  onPlacementStatusChange,
}: Props) {
  const sceneRef = useRef<ViroARScene>(null);
  const [placedMarkers, setPlacedMarkers] = useState<PlacedMarker[]>([]);

  useEffect(() => {
    if (!containerSize || targets.length === 0) {
      setPlacedMarkers([]);
      onPlacementStatusChange(null);
      return;
    }

    let cancelled = false;
    console.log(`[ar-anchor] placement pass starting for ${targets.length} target(s)`);
    placeTargets(sceneRef, targets, frameSize, containerSize, () => cancelled)
      .then(({ placed, skipped }) => {
        if (cancelled) return;
        console.log(`[ar-anchor] placement pass done: ${placed.length} placed, ${skipped} skipped`);
        setPlacedMarkers(placed);
        onPlacementStatusChange({ placed: placed.length, skipped, total: targets.length });
      })
      // placeTargets already catches per-target hit-test/anchor errors internally (see
      // arTargetPlacement.ts) - this only guards against something unexpected escaping that (a
      // real gap found on review: an unhandled rejection here wouldn't crash anything visibly in
      // React Native, but would silently leave the placement status badge stuck on stale data).
      .catch((err) => {
        if (cancelled) return;
        console.error("[ar-anchor] placement pass threw unexpectedly:", err);
        setPlacedMarkers([]);
        onPlacementStatusChange(null);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onPlacementStatusChange is a stable
    // setState-wrapping callback from ArMainApp, not something that should re-trigger placement.
  }, [targets, frameSize, containerSize]);

  return (
    <ViroARScene ref={sceneRef} anchorDetectionTypes={["PlanesHorizontal"]} onTrackingUpdated={onTrackingStateChange}>
      <ViroAmbientLight color="#ffffff" intensity={300} />
      <ArAnchoredTargets markers={placedMarkers} />
    </ViroARScene>
  );
}

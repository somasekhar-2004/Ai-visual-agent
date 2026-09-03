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
  /** Bumped by ArMainApp once per real /api/analyze response - see the long comment below for why
   * this, not the targets array or its content, is what the placement effect should key off. */
  targetsGeneration: number;
  frameSize: Size;
  containerSize: Size | null;
  onTrackingStateChange: (state: ViroTrackingState, reason: ViroTrackingReason) => void;
  onPlacementStatusChange: (status: { placed: number; skipped: number; total: number } | null) => void;
};

export default function ArMainScene({
  targets,
  targetsGeneration,
  frameSize,
  containerSize,
  onTrackingStateChange,
  onPlacementStatusChange,
}: Props) {
  const sceneRef = useRef<ViroARScene>(null);
  const [placedMarkers, setPlacedMarkers] = useState<PlacedMarker[]>([]);

  // Real bug found from on-device logs: placement was re-running in a tight loop, many times for
  // the same response, with no new question asked. Root cause: this effect depended on the raw
  // `frameSize`/`containerSize` *objects*, and ArMainApp's onLayout handler was calling
  // setContainerSize({width, height}) - a brand-new object literal - on every layout event,
  // including ones reporting a size identical to what it already had. React can't tell an
  // unchanged-but-new object apart from a real change by reference, so every one of those
  // re-fired the placement effect even though the target *data* never changed. (onLayout itself
  // firing repeatedly is now also guarded in ArMainApp.tsx, but this effect shouldn't have been
  // depending on those objects' identity to decide whether new targets arrived in the first
  // place at all.)
  //
  // Fix: the effect's real trigger is now `targetsGeneration`, a plain counter ArMainApp
  // increments exactly once per real backend response (see handleAsk there). A content-derived
  // key (e.g. joined target IDs) was considered and rejected: the backend doesn't guarantee IDs
  // are unique *across* responses - the mock provider generates simple per-call indices like
  // "source-0", and nothing in the Gemini prompt schema requires otherwise - so two genuinely
  // different responses could plausibly produce the same ID set and silently fail to trigger a
  // new placement pass. A response-identity counter has no such ambiguity: every real answer from
  // the backend is unconditionally a new generation, regardless of what its targets contain.
  // frameSize/containerSize are still needed for the hit-test math, but only their current values
  // at the moment a pass runs, not as a signal that a new pass should start - so they're read
  // from a ref (always current, updated every render, never causes a re-run) instead of the
  // dependency array.
  const latestFrameSize = useRef(frameSize);
  latestFrameSize.current = frameSize;
  const latestContainerSize = useRef(containerSize);
  latestContainerSize.current = containerSize;

  useEffect(() => {
    const containerSizeNow = latestContainerSize.current;
    if (!containerSizeNow || targets.length === 0) {
      setPlacedMarkers([]);
      onPlacementStatusChange(null);
      return;
    }

    let cancelled = false;
    console.log(`[ar-anchor] placement pass starting for ${targets.length} target(s)`);
    placeTargets(sceneRef, targets, latestFrameSize.current, containerSizeNow, () => cancelled)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deliberate: targetsGeneration (see
    // the comment above) is the real trigger, not the targets array's own reference and not
    // frameSize/containerSize (read fresh via ref above) or onPlacementStatusChange (a stable
    // setState-wrapping callback from ArMainApp).
  }, [targetsGeneration]);

  return (
    <ViroARScene ref={sceneRef} anchorDetectionTypes={["PlanesHorizontal"]} onTrackingUpdated={onTrackingStateChange}>
      <ViroAmbientLight color="#ffffff" intensity={300} />
      <ArAnchoredTargets markers={placedMarkers} />
    </ViroARScene>
  );
}

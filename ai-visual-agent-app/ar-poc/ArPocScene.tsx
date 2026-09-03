import { useRef, useState } from "react";
import {
  ViroARScene,
  ViroARPlaneSelector,
  ViroSphere,
  ViroText,
  ViroAmbientLight,
  ViroMaterials,
  ViroTrackingStateConstants,
} from "@reactvision/react-viro";
import type { ViroAnchor, ViroTrackingReason, ViroTrackingState } from "@reactvision/react-viro";

/**
 * Phase A toolchain smoke test - NOT wired into the real app. Deliberately as simple as
 * possible: no 3D model asset, no hit-test-from-2D-point math yet (that's Phase C, once this
 * proves ViroReact itself builds and runs). Just: does the AR session start, does plane
 * detection work, can we place something that then stays world-locked as the camera moves.
 *
 * What "success" looks like on-device:
 *  1. Camera feed appears with "Move phone to find surfaces..." floating text.
 *  2. Point at a flat surface (table/floor) until a translucent blue overlay appears on it.
 *  3. Tap the overlay - a small cyan sphere appears where you tapped, text changes to
 *     "Placed! ViroReact is working."
 *  4. Walk around / move the phone - the sphere should stay locked to that real-world point
 *     (this is the actual thing being validated - ARKit world tracking, not this app's code).
 */

ViroMaterials.createMaterials({
  ar_poc_sphere: {
    diffuseColor: "#22d3ee",
    lightingModel: "Constant", // unlit - visible regardless of scene lighting setup
  },
});

export default function ArPocScene() {
  // ViroARPlaneSelector's ref type isn't exported as a standalone name in the package's public
  // API surface - `any` here is deliberate (matches the pattern ViroReact's own docs use for
  // this exact ref), not a shortcut taken to skip typing something that was typed elsewhere.
  const selectorRef = useRef<any>(null);
  const [status, setStatus] = useState("Starting AR session...");

  return (
    <ViroARScene
      anchorDetectionTypes={["PlanesHorizontal"]}
      onAnchorFound={(a: ViroAnchor) => selectorRef.current?.handleAnchorFound(a)}
      onAnchorUpdated={(a: ViroAnchor) => selectorRef.current?.handleAnchorUpdated(a)}
      onAnchorRemoved={(a?: ViroAnchor) => a && selectorRef.current?.handleAnchorRemoved(a)}
      onTrackingUpdated={(state: ViroTrackingState, _reason: ViroTrackingReason) => {
        if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
          setStatus((prev) => (prev.startsWith("Placed") ? prev : "Tracking - point at a flat surface"));
        } else {
          setStatus("Move phone to find surfaces...");
        }
      }}
    >
      <ViroAmbientLight color="#ffffff" intensity={300} />

      <ViroText
        text={status}
        position={[0, 0, -1]}
        width={2}
        height={0.5}
        style={{ fontFamily: "Arial", fontSize: 20, color: "#ffffff", textAlign: "center" }}
      />

      <ViroARPlaneSelector
        ref={selectorRef}
        alignment="Horizontal"
        onPlaneSelected={() => setStatus("Placed! ViroReact is working.")}
      >
        <ViroSphere radius={0.03} position={[0, 0.03, 0]} materials={["ar_poc_sphere"]} />
      </ViroARPlaneSelector>
    </ViroARScene>
  );
}

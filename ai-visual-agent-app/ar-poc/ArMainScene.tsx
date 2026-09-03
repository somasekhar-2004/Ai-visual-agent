import { ViroARScene, ViroAmbientLight } from "@reactvision/react-viro";
import type { ViroTrackingReason, ViroTrackingState } from "@reactvision/react-viro";

/**
 * Phase B AR camera background for the real app flow. Deliberately has no visible 3D content -
 * Gemini-target-to-AR-anchor placement is Phase C. This scene's only job right now is to be the
 * live AR camera passthrough with plane detection running in the background (so ARKit's world-
 * tracking session is live and warm for when Phase C needs to hit-test/anchor against it), while
 * ArMainApp.tsx captures screenshots from it and drives the same ask/analyze/speak flow App.tsx
 * already has.
 */

type Props = {
  onTrackingStateChange: (state: ViroTrackingState, reason: ViroTrackingReason) => void;
};

export default function ArMainScene({ onTrackingStateChange }: Props) {
  return (
    <ViroARScene
      anchorDetectionTypes={["PlanesHorizontal"]}
      onTrackingUpdated={onTrackingStateChange}
    >
      <ViroAmbientLight color="#ffffff" intensity={300} />
    </ViroARScene>
  );
}

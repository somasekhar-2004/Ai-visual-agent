import { ViroNode, ViroPolyline, ViroSphere, ViroText, ViroMaterials } from "@reactvision/react-viro";

import type { PlacedMarker } from "./arTargetPlacement";

// Same cyan-source/amber-destination convention as the web app and the native gyroscope-tracked
// overlay (src/overlay/CameraOverlay.tsx's ACCENT/DEST_ACCENT) - kept identical here for
// consistency across all three renderings of the same targets.
const SOURCE_COLOR = "#22d3ee";
const DEST_COLOR = "#f59e0b";
const CONNECTOR_COLOR = "#e2e8f0";

ViroMaterials.createMaterials({
  ar_marker_source: { diffuseColor: SOURCE_COLOR, lightingModel: "Constant" },
  ar_marker_destination: { diffuseColor: DEST_COLOR, lightingModel: "Constant" },
  ar_connector_line: { diffuseColor: CONNECTOR_COLOR, lightingModel: "Constant" },
});

const MARKER_RADIUS_M = 0.012;
const CONNECTOR_THICKNESS_M = 0.004;
// ViroText's fontSize is not meters - confirmed by reading ViroReact's own shipped usage
// (StudioARScene.js's Quest placement prompt: fontSize 14, no scale override, positioned 2m from
// the camera and clearly meant to read as a large HUD message filling a good part of the view).
// Unscaled, that same fontSize/position pattern is exactly what produced the "single digit
// rendering many times larger than the physical objects" bug reported from device testing - it's
// sized for a big on-screen message, not a small precise label sitting a few cm from a real
// component. Rather than guess an absolute small fontSize (there's no documented meters-per-
// fontSize-unit conversion to calculate from, and it can't be measured from this sandbox), the
// whole label node is shrunk by a flat scale factor instead - a simple, predictable, easily-
// retunable knob regardless of what fontSize itself actually maps to internally.
// NOT verified on a real device - this specific factor is a first estimate; if labels are still
// too big or now too small/illegible, adjust LABEL_SCALE (linearly - doubling it doubles the
// rendered size) rather than fontSize.
const LABEL_SCALE = 0.05;

/**
 * Renders Gemini's targets as real AR content, given the world positions arTargetPlacement.ts
 * already resolved via hit-testing. Deliberately simple shapes: every target (regardless of its
 * original 2D shape - box/circle/point/path) becomes a small sphere marker + a billboarded text
 * label, rather than trying to reproduce box/path shapes faithfully in 3D.
 *
 * That's a real simplification, not an oversight: turning a normalized 2D bounding box or path
 * into accurate 3D world geometry would need either multiple hit tests per corner (which can each
 * land on a different real-world depth/surface, producing a warped, non-planar shape - there's no
 * guarantee a box's four corners are even on the same plane from the camera's point of view) or an
 * assumed fixed depth for the whole shape (which would just be a guess). A single well-placed
 * marker + a readable label is more useful and far more robust than a shape that might render
 * distorted, and it's what actually matters for "where do I look and what is it."
 */
export function ArAnchoredTargets({ markers }: { markers: PlacedMarker[] }) {
  const byId = new Map(markers.map((m) => [m.id, m]));

  const connectors = markers
    .filter((m) => m.role === "destination" && m.linkedTargetId)
    .map((dest) => {
      const source = byId.get(dest.linkedTargetId!);
      if (!source) return null; // source target wasn't placed (e.g. its own hit test missed)
      return (
        <ViroPolyline
          key={`link-${dest.id}`}
          points={[source.position, dest.position]}
          thickness={CONNECTOR_THICKNESS_M}
          materials={["ar_connector_line"]}
        />
      );
    });

  return (
    <ViroNode>
      {connectors}
      {markers.map((marker) => {
        const isDestination = marker.role === "destination";
        const displayLabel = isDestination ? `${marker.marker}. → ${marker.label}` : `${marker.marker}. ${marker.label}`;
        return (
          <ViroNode key={marker.id} position={marker.position}>
            <ViroSphere radius={MARKER_RADIUS_M} materials={[isDestination ? "ar_marker_destination" : "ar_marker_source"]} />
            <ViroText
              text={displayLabel}
              position={[0, MARKER_RADIUS_M + 0.025, 0]}
              scale={[LABEL_SCALE, LABEL_SCALE, LABEL_SCALE]}
              width={1}
              height={0.3}
              style={{
                fontFamily: "Arial",
                fontSize: 14,
                color: isDestination ? DEST_COLOR : SOURCE_COLOR,
                textAlign: "center",
              }}
              transformBehaviors={["billboard"]}
            />
          </ViroNode>
        );
      })}
    </ViroNode>
  );
}

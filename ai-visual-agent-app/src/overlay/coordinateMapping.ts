/**
 * Ported from the web app's CameraOverlay.tsx (object-fit: cover mapping from a source frame's
 * normalized 0-1 coordinates to on-screen pixels). The captured/analyzed frame's aspect ratio
 * rarely matches the on-screen container's aspect ratio exactly, so this reproduces the same
 * "cover" scaling the web app used (scale to fill the container, center-crop the overflow) rather
 * than stretching or letterboxing.
 */

export interface Size {
  width: number;
  height: number;
}

export interface CoverTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function computeCoverTransform(container: Size, frame: Size): CoverTransform {
  if (!frame.width || !frame.height || !container.width || !container.height) {
    return { scale: 1, offsetX: 0, offsetY: 0 };
  }
  const scale = Math.max(container.width / frame.width, container.height / frame.height);
  const dispW = frame.width * scale;
  const dispH = frame.height * scale;
  return {
    scale,
    offsetX: (container.width - dispW) / 2,
    offsetY: (container.height - dispH) / 2,
  };
}

/** Maps a normalized (0-1) point, relative to the analyzed frame, to on-screen pixel coordinates. */
export function mapPoint(nx: number, ny: number, frame: Size, t: CoverTransform): { x: number; y: number } {
  return {
    x: t.offsetX + nx * frame.width * t.scale,
    y: t.offsetY + ny * frame.height * t.scale,
  };
}

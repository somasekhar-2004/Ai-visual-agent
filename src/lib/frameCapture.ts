/**
 * Captures the current video frame, downscales it to a reasonable max dimension, and
 * compresses it to JPEG. Keeps upload size small (a few dozen KB) instead of sending
 * full-resolution frames to the vision API.
 */

export interface CaptureOptions {
  maxDimension?: number;
  quality?: number;
}

export interface CapturedFrame {
  dataUrl: string;
  width: number;
  height: number;
}

let scratchCanvas: HTMLCanvasElement | null = null;

function getScratchCanvas(): HTMLCanvasElement {
  if (!scratchCanvas) scratchCanvas = document.createElement("canvas");
  return scratchCanvas;
}

export function captureFrame(
  video: HTMLVideoElement,
  { maxDimension = 896, quality = 0.72 }: CaptureOptions = {},
): CapturedFrame | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const scale = Math.min(1, maxDimension / Math.max(vw, vh));
  const width = Math.max(1, Math.round(vw * scale));
  const height = Math.max(1, Math.round(vh * scale));

  const canvas = getScratchCanvas();
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, width, height);
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return { dataUrl, width, height };
}

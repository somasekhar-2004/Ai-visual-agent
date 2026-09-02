/**
 * Lightweight, dependency-free client-side change detection.
 * Downsamples the current video frame to a tiny grayscale grid and diffs it against the
 * previous sample. This is intentionally crude (it's just meant to notice "something moved
 * in the frame", not to understand what) - real understanding is left to the vision model,
 * which we only call when this local check (or a user action) says it's worth it.
 */

const SAMPLE_SIZE = 24;

export class ChangeDetector {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private previous: Uint8ClampedArray | null = null;

  constructor(private sampleSize = SAMPLE_SIZE) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = sampleSize;
    this.canvas.height = sampleSize;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
  }

  reset() {
    this.previous = null;
  }

  /**
   * Samples the current video frame and returns a 0-1 "how different from the last sample"
   * score. Returns null if the video isn't ready yet.
   */
  sample(video: HTMLVideoElement): number | null {
    if (!this.ctx || !video.videoWidth || !video.videoHeight) return null;

    this.ctx.drawImage(video, 0, 0, this.sampleSize, this.sampleSize);
    const frame = this.ctx.getImageData(0, 0, this.sampleSize, this.sampleSize).data;

    if (!this.previous) {
      this.previous = frame;
      return 0;
    }

    let diffSum = 0;
    const pixelCount = this.sampleSize * this.sampleSize;
    for (let i = 0; i < frame.length; i += 4) {
      // Cheap luminance approximation.
      const lumaNow = (frame[i] + frame[i + 1] + frame[i + 2]) / 3;
      const lumaPrev = (this.previous[i] + this.previous[i + 1] + this.previous[i + 2]) / 3;
      diffSum += Math.abs(lumaNow - lumaPrev);
    }

    this.previous = frame;
    // Normalize: max possible per-pixel diff is 255.
    return diffSum / (pixelCount * 255);
  }
}

export interface ChangeWatcherOptions {
  /** How often to sample locally, in ms. */
  intervalMs?: number;
  /** 0-1 normalized diff score above which we consider it "significant movement". */
  threshold?: number;
  /** Consecutive samples the scene must stay under threshold (i.e. settle) before firing "stable". */
  stableSamplesRequired?: number;
  onSignificantChange?: (score: number) => void;
  /** Fired once movement has stopped and the scene has held still for stableSamplesRequired samples. */
  onStable?: () => void;
}

/**
 * Runs a polling loop that samples the video, and reports both "something is moving" and
 * "movement has settled" (the latter is what should actually trigger a verification capture -
 * a blurry mid-motion frame is useless to the vision model).
 */
export function watchForChange(video: HTMLVideoElement, options: ChangeWatcherOptions = {}): () => void {
  const { intervalMs = 700, threshold = 0.035, stableSamplesRequired = 2, onSignificantChange, onStable } = options;

  const detector = new ChangeDetector();
  let sawChange = false;
  let stableCount = 0;
  let stopped = false;

  const timer = window.setInterval(() => {
    if (stopped) return;
    const score = detector.sample(video);
    if (score === null) return;

    if (score >= threshold) {
      sawChange = true;
      stableCount = 0;
      onSignificantChange?.(score);
    } else if (sawChange) {
      stableCount += 1;
      if (stableCount >= stableSamplesRequired) {
        sawChange = false;
        stableCount = 0;
        onStable?.();
      }
    }
  }, intervalMs);

  return () => {
    stopped = true;
    window.clearInterval(timer);
  };
}

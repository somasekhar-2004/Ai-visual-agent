import type {
  ComponentType,
  NormalizedBoundingBox,
  NormalizedPoint,
  SafetyFlag,
  VisionAnalysisResponse,
  VisualTarget,
} from "./types";

/**
 * Defensive validation shared by every real VisionProvider: a model's raw output - even one
 * produced under a forced schema - is still untrusted input from the app's point of view, so
 * every field is coerced to a safe value rather than trusted as-is.
 */

export function clamp01(n: unknown, fallback = 0): number {
  const v = typeof n === "number" && Number.isFinite(n) ? n : fallback;
  return Math.min(1, Math.max(0, v));
}

function sanitizeBoundingBox(raw: unknown): NormalizedBoundingBox | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  if (
    typeof b.x !== "number" ||
    typeof b.y !== "number" ||
    typeof b.width !== "number" ||
    typeof b.height !== "number"
  ) {
    return null;
  }
  return {
    x: clamp01(b.x),
    y: clamp01(b.y),
    width: Math.min(1, Math.max(0.01, b.width)),
    height: Math.min(1, Math.max(0.01, b.height)),
  };
}

function sanitizePath(raw: unknown): NormalizedPoint[] | null {
  if (!Array.isArray(raw)) return null;
  const points: NormalizedPoint[] = [];
  for (const item of raw.slice(0, 12)) {
    if (!item || typeof item !== "object") continue;
    const p = item as Record<string, unknown>;
    if (typeof p.x !== "number" || typeof p.y !== "number") continue;
    points.push({ x: clamp01(p.x), y: clamp01(p.y) });
  }
  // A "path" needs at least two points to draw a line; anything less isn't usable.
  return points.length >= 2 ? points : null;
}

const VALID_TYPES: ComponentType[] = [
  "wire",
  "resistor",
  "capacitor",
  "ic",
  "connector",
  "led",
  "board",
  "battery",
  "sensor",
  "switch",
  "terminal",
  "other",
];

const VALID_SHAPES = ["box", "circle", "arrow", "point", "path"] as const;

function sanitizeTargets(raw: unknown): VisualTarget[] {
  if (!Array.isArray(raw)) return [];
  const out: VisualTarget[] = [];
  raw.slice(0, 4).forEach((item, i) => {
    if (!item || typeof item !== "object") return;
    const t = item as Record<string, unknown>;
    const type = VALID_TYPES.includes(t.type as ComponentType) ? (t.type as ComponentType) : "other";
    const shape = VALID_SHAPES.includes(t.shape as (typeof VALID_SHAPES)[number])
      ? (t.shape as (typeof VALID_SHAPES)[number])
      : "box";
    const path = shape === "path" ? sanitizePath(t.path) : null;
    out.push({
      id: typeof t.id === "string" && t.id ? t.id : `target-${i}`,
      marker: typeof t.marker === "number" && t.marker > 0 ? Math.round(t.marker) : i + 1,
      label: typeof t.label === "string" && t.label ? t.label : "component",
      type,
      boundingBox: sanitizeBoundingBox(t.boundingBox),
      confidence: clamp01(t.confidence, 0.5),
      // A "path" shape with no usable points degrades to a plain box rather than drawing nothing.
      shape: shape === "path" && !path ? "box" : shape,
      path,
    });
  });
  return out;
}

function sanitizeSafetyFlag(raw: unknown): SafetyFlag | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (!s.triggered) return null;
  return {
    triggered: true,
    reason: typeof s.reason === "string" ? s.reason : "Potential high-voltage hazard detected.",
    message:
      typeof s.message === "string" && s.message
        ? s.message
        : "This looks like it may involve mains or high-voltage equipment. Please stop and consult a qualified electrician.",
  };
}

/** Coerces/validates a raw model response payload into our strict VisionAnalysisResponse shape. */
export function sanitizeAnalysisResponse(raw: unknown): VisionAnalysisResponse {
  const r = (raw ?? {}) as Record<string, unknown>;
  const validStatuses = ["continue", "needs_clarification", "resolved", "safety_stop", "error"];
  const status = validStatuses.includes(r.status as string)
    ? (r.status as VisionAnalysisResponse["status"])
    : "error";

  return {
    status,
    observation: typeof r.observation === "string" ? r.observation : "",
    targets: sanitizeTargets(r.targets),
    instruction: typeof r.instruction === "string" ? r.instruction : "",
    spokenInstruction: typeof r.spokenInstruction === "string" ? r.spokenInstruction : "",
    requiresVerification: Boolean(r.requiresVerification),
    confidence: clamp01(r.confidence, 0.5),
    nextExpectedState: typeof r.nextExpectedState === "string" ? r.nextExpectedState : null,
    clarifyingQuestion: typeof r.clarifyingQuestion === "string" ? r.clarifyingQuestion : null,
    safetyFlag: sanitizeSafetyFlag(r.safetyFlag),
    verified: typeof r.verified === "boolean" ? r.verified : null,
  };
}

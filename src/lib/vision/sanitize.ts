import type {
  ComponentType,
  NormalizedBoundingBox,
  NormalizedPoint,
  SafetyFlag,
  TargetRole,
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
const VALID_ROLES: TargetRole[] = ["source", "destination"];

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
    const role = VALID_ROLES.includes(t.role as TargetRole) ? (t.role as TargetRole) : "source";
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
      role,
      linkedTargetId: role === "destination" && typeof t.linkedTargetId === "string" ? t.linkedTargetId : null,
    });
  });
  return out;
}

// Below this, a target's location is too uncertain to show at all - rule 14 in the system prompt
// already asks the model to omit boundingBox/path when unsure, this is the defensive backstop for
// when it doesn't. "No guessed targets" beats "something on screen".
const MIN_TARGET_CONFIDENCE = 0.35;

/** Component-type keywords a target's spoken/written description should plausibly contain if the
 * model is genuinely talking about it - deliberately excludes generic words ("board", "power")
 * that would match almost any instruction and defeat the check. */
const TYPE_KEYWORDS: Record<ComponentType, string[]> = {
  wire: ["wire", "cable", "lead", "jumper"],
  resistor: ["resistor"],
  capacitor: ["capacitor"],
  ic: ["ic", "chip", "microcontroller", "processor"],
  connector: ["connector", "socket", "header"],
  led: ["led", "diode"],
  board: ["board", "breadboard", "pcb"],
  battery: ["battery", "cell"],
  sensor: ["sensor"],
  switch: ["switch", "button"],
  terminal: ["terminal", "pin", "hole", "row", "rail"],
  other: [],
};

/**
 * Defense-in-depth check that a target is actually the thing being talked about, independent of
 * whatever the model claims - a mismatched target (highlighting one component while the
 * instruction describes another) is worse than no highlight at all for a tool telling someone
 * which wire to touch. Matches on the same marker-reference convention rule 6 in the system
 * prompt asks the model to use ("point 2"), or on a type-specific keyword, or (for the
 * type-less "other" bucket) a distinctive word from the label itself.
 */
function targetReferencedInText(target: VisualTarget, lowerText: string): boolean {
  if (
    lowerText.includes(`point ${target.marker}`) ||
    lowerText.includes(`marker ${target.marker}`) ||
    lowerText.includes(`target ${target.marker}`) ||
    lowerText.includes(`#${target.marker}`)
  ) {
    return true;
  }

  const typeKeywords = TYPE_KEYWORDS[target.type] ?? [];
  if (typeKeywords.some((k) => lowerText.includes(k))) return true;

  const labelWords = target.label
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 4);
  return labelWords.some((w) => lowerText.includes(w));
}

/**
 * Drops any target whose location is too uncertain (MIN_TARGET_CONFIDENCE). "source" targets
 * additionally must be textually corroborated (targetReferencedInText) - but "destination"
 * targets are exempt from that check: they describe a physical location ("empty row near pin 4")
 * that an instruction references descriptively, not by that exact label/type, so requiring their
 * own text match produces false negatives on correctly-identified destinations. A destination's
 * validity instead comes entirely from its linked "source" target surviving - a destination with
 * no valid source loses the "move THIS to there" meaning it exists for.
 */
function filterInconsistentTargets(targets: VisualTarget[], text: string): VisualTarget[] {
  const lowerText = text.toLowerCase();
  const sourceIds = new Set(
    targets
      .filter((t) => t.role !== "destination" && t.confidence >= MIN_TARGET_CONFIDENCE && targetReferencedInText(t, lowerText))
      .map((t) => t.id),
  );

  return targets.filter((t) => {
    if (t.confidence < MIN_TARGET_CONFIDENCE) return false;
    if (t.role === "destination") return !t.linkedTargetId || sourceIds.has(t.linkedTargetId);
    return targetReferencedInText(t, lowerText);
  });
}

/**
 * The model is asked to set a destination's linkedTargetId to its paired source (see prompt rule
 * 6b), but doesn't always do so even when it clearly means one specific source - observed live
 * against the real API (a "connect this wire to that hole" response with a valid destination
 * target but linkedTargetId: null). When exactly one source target survived filtering, any
 * unlinked destination unambiguously refers to it, so link it - this is what lets
 * CameraOverlay draw the connecting arrow instead of showing two unrelated-looking markers.
 * Left alone (not guessed) whenever there's more than one source, since guessing which one would
 * risk drawing a connector to the wrong object.
 */
function linkOrphanDestinations(targets: VisualTarget[]): VisualTarget[] {
  const sources = targets.filter((t) => t.role !== "destination");
  if (sources.length !== 1) return targets;
  const onlySourceId = sources[0].id;
  return targets.map((t) =>
    t.role === "destination" && !t.linkedTargetId ? { ...t, linkedTargetId: onlySourceId } : t,
  );
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

  const observation = typeof r.observation === "string" ? r.observation : "";
  const instruction = typeof r.instruction === "string" ? r.instruction : "";
  const spokenInstruction = typeof r.spokenInstruction === "string" ? r.spokenInstruction : "";
  const clarifyingQuestion = typeof r.clarifyingQuestion === "string" ? r.clarifyingQuestion : null;

  // Consistency net: only ever show a target that's actually corroborated by what this same
  // response says, across every field the user might hear or read - see filterInconsistentTargets.
  const consistencyText = [observation, instruction, spokenInstruction, clarifyingQuestion ?? ""].join(" ");
  const targets = linkOrphanDestinations(filterInconsistentTargets(sanitizeTargets(r.targets), consistencyText));

  return {
    status,
    observation,
    targets,
    instruction,
    spokenInstruction,
    requiresVerification: Boolean(r.requiresVerification),
    confidence: clamp01(r.confidence, 0.5),
    nextExpectedState: typeof r.nextExpectedState === "string" ? r.nextExpectedState : null,
    clarifyingQuestion,
    safetyFlag: sanitizeSafetyFlag(r.safetyFlag),
    verified: typeof r.verified === "boolean" ? r.verified : null,
  };
}

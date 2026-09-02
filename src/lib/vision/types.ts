/**
 * Shared types for the vision / troubleshooting layer.
 * Kept provider-agnostic so any multimodal vision API can implement VisionProvider.
 */

export type ComponentType =
  | "wire"
  | "resistor"
  | "capacitor"
  | "ic"
  | "connector"
  | "led"
  | "board"
  | "battery"
  | "sensor"
  | "switch"
  | "terminal"
  | "other";

export interface NormalizedBoundingBox {
  /** 0-1, left edge relative to frame width */
  x: number;
  /** 0-1, top edge relative to frame height */
  y: number;
  /** 0-1, relative to frame width */
  width: number;
  /** 0-1, relative to frame height */
  height: number;
}

export interface NormalizedPoint {
  /** 0-1, relative to frame width */
  x: number;
  /** 0-1, relative to frame height */
  y: number;
}

export interface VisualTarget {
  id: string;
  /** Stable small integer used as an on-screen marker (1, 2, 3...) so color isn't required. */
  marker: number;
  label: string;
  type: ComponentType;
  boundingBox: NormalizedBoundingBox | null;
  /** 0-1 confidence in the *location* of this target. */
  confidence: number;
  shape?: "box" | "circle" | "arrow" | "point" | "path";
  /**
   * Ordered polyline points (2+) tracing an elongated object's visible route, normalized 0-1.
   * Used for "path" shape targets - a wire following a bend looks much better highlighted as a
   * traced line than boxed in a big rectangle. Only meaningful when shape is "path"; null/absent
   * otherwise. boundingBox is still expected alongside it (used as a fallback and for hit-testing).
   */
  path?: NormalizedPoint[] | null;
}

export type SessionStatus =
  | "continue"
  | "needs_clarification"
  | "resolved"
  | "safety_stop"
  | "error";

export interface SafetyFlag {
  triggered: boolean;
  reason: string;
  message: string;
}

/** Strict structured response every VisionProvider call must return. */
export interface VisionAnalysisResponse {
  status: SessionStatus;
  observation: string;
  targets: VisualTarget[];
  instruction: string;
  spokenInstruction: string;
  requiresVerification: boolean;
  confidence: number;
  nextExpectedState: string | null;
  clarifyingQuestion: string | null;
  safetyFlag: SafetyFlag | null;
  /** Present only when this call was answering "did the user complete the previous step?" */
  verified: boolean | null;
}

export type AnalysisMode = "initial" | "followup" | "verify" | "periodic_check";

export interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
}

export interface DetectedComponentSummary {
  label: string;
  type: ComponentType;
  lastSeen: string;
}

export interface VisionProviderRequest {
  /** Resized/compressed JPEG data URL, e.g. "data:image/jpeg;base64,...." */
  frameDataUrl: string;
  mode: AnalysisMode;
  /** The user's freeform question/statement triggering this call, if any. */
  userMessage: string | null;
  /** The original problem statement for the session ("circuit isn't working"). */
  problemDescription: string | null;
  previousInstruction: string | null;
  expectedNextState: string | null;
  previousObservations: string[];
  detectedComponents: DetectedComponentSummary[];
  conversationTail: ConversationTurn[];
  /** How many times we've asked the user to verify the *current* target without success. */
  verifyAttempt: number;
}

export interface VisionProvider {
  readonly name: string;
  analyzeFrame(request: VisionProviderRequest): Promise<VisionAnalysisResponse>;
}

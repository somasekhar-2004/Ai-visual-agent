/**
 * Mirrors the backend's request/response contract exactly:
 * ai-visual-agent (Next.js)/src/lib/vision/types.ts
 *
 * This app has no build-time link to that repo/package (separate Expo project), so these types
 * are duplicated by hand rather than imported - if the backend's VisionProviderRequest /
 * VisionAnalysisResponse / VisualTarget shapes change, update both copies together.
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
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NormalizedPoint {
  x: number;
  y: number;
}

export type TargetRole = "source" | "destination";

export interface VisualTarget {
  id: string;
  marker: number;
  label: string;
  type: ComponentType;
  boundingBox: NormalizedBoundingBox | null;
  confidence: number;
  shape?: "box" | "circle" | "arrow" | "point" | "path";
  path?: NormalizedPoint[] | null;
  role?: TargetRole;
  linkedTargetId?: string | null;
}

export type SessionStatus = "continue" | "needs_clarification" | "resolved" | "safety_stop" | "error";

export interface SafetyFlag {
  triggered: boolean;
  reason: string;
  message: string;
}

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
  userMessage: string | null;
  problemDescription: string | null;
  previousInstruction: string | null;
  expectedNextState: string | null;
  previousObservations: string[];
  detectedComponents: DetectedComponentSummary[];
  conversationTail: ConversationTurn[];
  verifyAttempt: number;
}

import type { ComponentType, SessionStatus, VisualTarget } from "@/lib/vision/types";

export interface Observation {
  id: string;
  timestamp: number;
  text: string;
}

export interface Instruction {
  id: string;
  timestamp: number;
  text: string;
  spokenText: string;
  targets: VisualTarget[];
  requiresVerification: boolean;
  verified: boolean | null;
}

export interface DetectedComponent {
  id: string;
  label: string;
  type: ComponentType;
  lastSeenBoundingBox: VisualTarget["boundingBox"];
  confidence: number;
  lastSeenAt: number;
}

export interface UserResponse {
  id: string;
  timestamp: number;
  text: string;
  source: "voice" | "text" | "system";
}

export type AppPhase =
  | "idle"
  | "watching"
  | "listening"
  | "analyzing"
  | "checking"
  | "speaking"
  | "error";

export interface TroubleshootingSession {
  id: string;
  userProblem: string | null;
  currentStep: number;
  observations: Observation[];
  previousInstructions: Instruction[];
  detectedComponents: DetectedComponent[];
  userResponses: UserResponse[];
  currentTargets: VisualTarget[];
  expectedNextState: string | null;
  status: SessionStatus;
  verifyAttempt: number;
  createdAt: number;
  lastAnalyzedAt: number | null;
}

/**
 * `crypto.randomUUID` only exists in secure contexts (HTTPS/localhost) and only on browsers
 * new enough to support it (Safari added it in 15.4) - calling it unguarded during React's
 * very first render (this is used as lazy useState initial state) throws before hydration can
 * attach any event listeners, leaving the page looking loaded but fully inert. Fall back to a
 * non-cryptographic id in that case; these ids are only ever used as local React keys/state
 * identifiers, never for anything security-sensitive.
 */
export function uid(): string {
  return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createSession(): TroubleshootingSession {
  return {
    id: uid(),
    userProblem: null,
    currentStep: 0,
    observations: [],
    previousInstructions: [],
    detectedComponents: [],
    userResponses: [],
    currentTargets: [],
    expectedNextState: null,
    status: "continue",
    verifyAttempt: 0,
    createdAt: Date.now(),
    lastAnalyzedAt: null,
  };
}

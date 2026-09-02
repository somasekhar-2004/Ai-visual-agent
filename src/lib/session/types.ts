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

export function createSession(): TroubleshootingSession {
  return {
    id: crypto.randomUUID(),
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

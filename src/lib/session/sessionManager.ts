import type { VisionAnalysisResponse } from "@/lib/vision/types";
import { createSession, type TroubleshootingSession, type UserResponse } from "./types";

export { createSession };
export type { TroubleshootingSession };

function uid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function addUserResponse(
  session: TroubleshootingSession,
  text: string,
  source: UserResponse["source"],
): TroubleshootingSession {
  return {
    ...session,
    userResponses: [...session.userResponses, { id: uid(), timestamp: Date.now(), text, source }],
  };
}

export function setUserProblem(session: TroubleshootingSession, problem: string): TroubleshootingSession {
  return { ...session, userProblem: session.userProblem ?? problem };
}

/** Applies a VisionAnalysisResponse (from either /api/analyze or /api/verify) onto the session. */
export function applyAnalysisResponse(
  session: TroubleshootingSession,
  response: VisionAnalysisResponse,
): TroubleshootingSession {
  const now = Date.now();
  const observations = response.observation
    ? [...session.observations, { id: uid(), timestamp: now, text: response.observation }]
    : session.observations;

  const previousInstructions = response.instruction
    ? [
        ...session.previousInstructions,
        {
          id: uid(),
          timestamp: now,
          text: response.instruction,
          spokenText: response.spokenInstruction,
          targets: response.targets,
          requiresVerification: response.requiresVerification,
          verified: response.verified,
        },
      ]
    : session.previousInstructions;

  const detectedComponents = [...session.detectedComponents];
  for (const target of response.targets) {
    const existingIdx = detectedComponents.findIndex(
      (c) => c.label.toLowerCase() === target.label.toLowerCase(),
    );
    const entry = {
      id: existingIdx >= 0 ? detectedComponents[existingIdx].id : uid(),
      label: target.label,
      type: target.type,
      lastSeenBoundingBox: target.boundingBox,
      confidence: target.confidence,
      lastSeenAt: now,
    };
    if (existingIdx >= 0) detectedComponents[existingIdx] = entry;
    else detectedComponents.push(entry);
  }

  // Reset the retry counter whenever we move to a fresh instruction with new targets;
  // keep incrementing it while we're still verifying the same one.
  const targetsChanged =
    JSON.stringify(response.targets.map((t) => t.id)) !==
    JSON.stringify(session.currentTargets.map((t) => t.id));

  return {
    ...session,
    status: response.status,
    observations,
    previousInstructions,
    detectedComponents,
    currentTargets: response.targets.length > 0 ? response.targets : session.currentTargets,
    expectedNextState: response.requiresVerification ? response.nextExpectedState : null,
    verifyAttempt: response.verified === false ? session.verifyAttempt + 1 : targetsChanged ? 0 : session.verifyAttempt,
    currentStep: session.currentStep + 1,
    lastAnalyzedAt: now,
  };
}

export function recentObservationTexts(session: TroubleshootingSession, n = 5): string[] {
  return session.observations.slice(-n).map((o) => o.text);
}

export function conversationTail(session: TroubleshootingSession, n = 6) {
  const events: { role: "user" | "assistant"; text: string; timestamp: number }[] = [];
  for (const r of session.userResponses) events.push({ role: "user", text: r.text, timestamp: r.timestamp });
  for (const i of session.previousInstructions)
    events.push({ role: "assistant", text: i.text, timestamp: i.timestamp });
  events.sort((a, b) => a.timestamp - b.timestamp);
  return events.slice(-n).map(({ role, text }) => ({ role, text }));
}

import { checkTextForHighVoltage, SAFETY_STOP_MESSAGE } from "@/lib/safety";
import { getVisionProvider } from "./index";
import type { AnalysisMode, VisionAnalysisResponse, VisionProviderRequest } from "./types";

export class BadRequestError extends Error {}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

/** Parses+validates an incoming request body into a VisionProviderRequest, optionally forcing the mode. */
export function parseVisionRequest(body: unknown, forcedMode?: AnalysisMode): VisionProviderRequest {
  if (!body || typeof body !== "object") throw new BadRequestError("Request body must be a JSON object.");
  const b = body as Record<string, unknown>;

  const frameDataUrl = str(b.frameDataUrl);
  if (!frameDataUrl || !frameDataUrl.startsWith("data:image/")) {
    throw new BadRequestError("frameDataUrl must be a base64 image data URL.");
  }

  const modeCandidate = forcedMode ?? (b.mode as AnalysisMode);
  const validModes: AnalysisMode[] = ["initial", "followup", "verify", "periodic_check"];
  const mode = validModes.includes(modeCandidate) ? modeCandidate : "initial";

  if (mode === "verify" && !str(b.expectedNextState)) {
    throw new BadRequestError("expectedNextState is required to verify a step.");
  }

  const detectedComponents = Array.isArray(b.detectedComponents)
    ? (b.detectedComponents as Record<string, unknown>[])
        .filter((c) => c && typeof c === "object")
        .slice(0, 10)
        .map((c) => ({
          label: str(c.label) ?? "component",
          type: (str(c.type) as VisionProviderRequest["detectedComponents"][number]["type"]) ?? "other",
          lastSeen: str(c.lastSeen) ?? "earlier in session",
        }))
    : [];

  const conversationTail = Array.isArray(b.conversationTail)
    ? (b.conversationTail as Record<string, unknown>[])
        .filter((t) => t && typeof t === "object" && (t.role === "user" || t.role === "assistant"))
        .slice(-10)
        .map((t) => ({ role: t.role as "user" | "assistant", text: str(t.text) ?? "" }))
    : [];

  return {
    frameDataUrl,
    mode,
    userMessage: str(b.userMessage),
    problemDescription: str(b.problemDescription),
    previousInstruction: str(b.previousInstruction),
    expectedNextState: str(b.expectedNextState),
    previousObservations: strArray(b.previousObservations).slice(-8),
    detectedComponents,
    conversationTail,
    verifyAttempt: typeof b.verifyAttempt === "number" && b.verifyAttempt >= 0 ? Math.floor(b.verifyAttempt) : 0,
  };
}

/** Shared implementation for both /api/analyze and /api/verify. */
export async function runVisionAnalysis(request: VisionProviderRequest): Promise<VisionAnalysisResponse> {
  const combinedText = `${request.userMessage ?? ""} ${request.problemDescription ?? ""}`;
  const safety = checkTextForHighVoltage(combinedText);
  if (safety.triggered) {
    return {
      status: "safety_stop",
      observation: "The description mentions mains or high-voltage equipment.",
      targets: [],
      instruction: SAFETY_STOP_MESSAGE,
      spokenInstruction: SAFETY_STOP_MESSAGE,
      requiresVerification: false,
      confidence: 0.95,
      nextExpectedState: null,
      clarifyingQuestion: null,
      safetyFlag: { triggered: true, reason: safety.reason, message: SAFETY_STOP_MESSAGE },
      verified: null,
    };
  }

  const provider = getVisionProvider();
  return provider.analyzeFrame(request);
}

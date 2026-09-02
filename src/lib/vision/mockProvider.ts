import { checkTextForHighVoltage, SAFETY_STOP_MESSAGE } from "@/lib/safety";
import type { VisionAnalysisResponse, VisionProvider, VisionProviderRequest, VisualTarget } from "./types";

interface ScriptStep {
  targets: Omit<VisualTarget, "id">[];
  instruction: string;
  spokenInstruction: string;
  nextExpectedState: string;
}

/**
 * IMPORTANT: this provider does not look at the camera frame at all - it has no real vision
 * model behind it. It exists purely so the camera/overlay/voice/verify UX can be built and
 * demoed without spending API credits (see README "Mock mode"). Every string here is written
 * so it never claims to have actually observed the user's circuit ("I can see...", "this wire
 * looks..."), and every target label is suffixed "(simulated)" so the overlay never implies a
 * real detection - this is what stands between an honest demo and hallucinating components that
 * were never there. Do not "improve" the copy back toward first-person observation claims.
 */
const SCRIPT: ScriptStep[] = [
  {
    targets: [
      {
        marker: 1,
        label: "red positive wire (simulated)",
        type: "wire",
        boundingBox: { x: 0.22, y: 0.38, width: 0.16, height: 0.1 },
        confidence: 0.82,
        shape: "box",
      },
    ],
    instruction:
      'DEMO MODE (no real vision configured): a real check here would look at your positive power rail wire. Pretend it needs reseating, then say "done" to see the demo continue.',
    spokenInstruction: "Demo mode. Imagine checking the highlighted positive wire, then say done.",
    nextExpectedState: "step-0-positive-wire",
  },
  {
    targets: [
      {
        marker: 1,
        label: "220 ohm resistor (simulated)",
        type: "resistor",
        boundingBox: { x: 0.5, y: 0.28, width: 0.14, height: 0.09 },
        confidence: 0.76,
        shape: "box",
      },
    ],
    instruction:
      "DEMO MODE (no real vision configured): a real check here would inspect the resistor next to the LED for both legs being seated correctly. Nothing was actually analyzed.",
    spokenInstruction: "Demo mode. Now imagine checking the highlighted resistor.",
    nextExpectedState: "step-1-resistor",
  },
  {
    targets: [
      {
        marker: 1,
        label: "LED (simulated)",
        type: "led",
        boundingBox: { x: 0.58, y: 0.52, width: 0.12, height: 0.1 },
        confidence: 0.71,
        shape: "circle",
      },
      {
        marker: 2,
        label: "ground rail (simulated)",
        type: "connector",
        boundingBox: { x: 0.16, y: 0.62, width: 0.2, height: 0.08 },
        confidence: 0.68,
        shape: "box",
      },
    ],
    instruction:
      "DEMO MODE (no real vision configured): a real check here would confirm LED orientation at point 1 and its ground connection at point 2. This is a scripted example, not analysis of your frame.",
    spokenInstruction: "Demo mode. This step shows two highlighted points at once.",
    nextExpectedState: "step-2-led-ground",
  },
  {
    targets: [
      {
        marker: 1,
        label: "microcontroller GND pin (simulated)",
        type: "terminal",
        boundingBox: { x: 0.36, y: 0.18, width: 0.1, height: 0.07 },
        confidence: 0.74,
        shape: "circle",
      },
    ],
    instruction:
      "DEMO MODE (no real vision configured): last scripted step - a real check would confirm a ground jumper here. Configure VISION_PROVIDER=anthropic and VISION_API_KEY for genuine circuit analysis (see README).",
    spokenInstruction: "Demo mode. That's the last scripted step in this walkthrough.",
    nextExpectedState: "step-3-gnd-jumper",
  },
];

function withIds(targets: Omit<VisualTarget, "id">[], prefix: string): VisualTarget[] {
  return targets.map((t, i) => ({ ...t, id: `${prefix}-${i}` }));
}

function baseResponse(): VisionAnalysisResponse {
  return {
    status: "continue",
    observation: "",
    targets: [],
    instruction: "",
    spokenInstruction: "",
    requiresVerification: false,
    confidence: 0.7,
    nextExpectedState: null,
    clarifyingQuestion: null,
    safetyFlag: null,
    verified: null,
  };
}

export class MockVisionProvider implements VisionProvider {
  readonly name = "mock";

  async analyzeFrame(req: VisionProviderRequest): Promise<VisionAnalysisResponse> {
    // Small artificial delay so loading states are visible/testable.
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));

    const safety = checkTextForHighVoltage(`${req.userMessage ?? ""} ${req.problemDescription ?? ""}`);
    if (safety.triggered) {
      return {
        ...baseResponse(),
        status: "safety_stop",
        observation: "The description mentions mains or high-voltage equipment.",
        instruction: SAFETY_STOP_MESSAGE,
        spokenInstruction: SAFETY_STOP_MESSAGE,
        confidence: 0.95,
        safetyFlag: { triggered: true, reason: safety.reason, message: SAFETY_STOP_MESSAGE },
      };
    }

    // Figure out which script step is currently "pending" from expectedNextState - the value
    // the client echoes back is exactly the nextExpectedState *this* provider issued for that
    // step, so matching on it (rather than e.g. observation count, which grows on every call
    // including failed verifications) reliably finds the right step regardless of how many
    // retries/follow-ups happened along the way.
    const pendingIndex = req.expectedNextState
      ? SCRIPT.findIndex((s) => s.nextExpectedState === req.expectedNextState)
      : -1;
    const stepIndex = pendingIndex >= 0 ? pendingIndex : 0;
    const step = SCRIPT[stepIndex];

    if (req.mode === "verify") {
      // Coin-flip outcome - this is NOT a real comparison of the before/after frame (this
      // provider never looks at the image), just a scripted way to demo what a retry vs. an
      // advance looks like in the UI.
      const verified = req.verifyAttempt >= 2 || Math.random() > 0.35;
      if (!verified) {
        return {
          ...baseResponse(),
          status: "continue",
          observation:
            "DEMO MODE: this is a randomly simulated \"not verified\" result, not a real comparison of your before/after frame.",
          targets: withIds(step.targets, `step${stepIndex}`),
          instruction: `Simulated retry. ${step.instruction}`,
          spokenInstruction: `Demo mode. Simulated retry. ${step.spokenInstruction}`,
          requiresVerification: true,
          confidence: 0.6,
          nextExpectedState: step.nextExpectedState,
          verified: false,
        };
      }

      const nextIndex = stepIndex + 1;
      if (nextIndex >= SCRIPT.length) {
        return {
          ...baseResponse(),
          status: "resolved",
          observation: "DEMO MODE: scripted walkthrough complete. No real circuit was checked.",
          instruction:
            'That was the last step in this scripted demo - no real circuit was analyzed. Configure a real vision provider (VISION_PROVIDER=anthropic + VISION_API_KEY, see README) for genuine diagnostics. Say "start new session" to replay the demo.',
          spokenInstruction: "Demo complete. No real circuit was analyzed.",
          requiresVerification: false,
          confidence: 0.85,
          nextExpectedState: null,
          verified: true,
        };
      }

      const next = SCRIPT[nextIndex];
      return {
        ...baseResponse(),
        status: "continue",
        observation: "DEMO MODE: simulated verification passed - advancing the scripted walkthrough.",
        targets: withIds(next.targets, `step${nextIndex}`),
        instruction: next.instruction,
        spokenInstruction: next.spokenInstruction,
        requiresVerification: true,
        confidence: 0.8,
        nextExpectedState: next.nextExpectedState,
        verified: true,
      };
    }

    if (req.mode === "followup" && req.userMessage) {
      return {
        ...baseResponse(),
        status: "continue",
        observation: `DEMO MODE: your question was noted, but this is a scripted reply, not real analysis of "${req.userMessage}".`,
        targets: withIds(step.targets, `step${stepIndex}-followup`),
        instruction: step.instruction,
        spokenInstruction: step.spokenInstruction,
        requiresVerification: true,
        confidence: 0.72,
        nextExpectedState: step.nextExpectedState,
        verified: null,
      };
    }

    // initial
    return {
      ...baseResponse(),
      status: "continue",
      observation:
        "DEMO MODE: no real vision provider is configured, so nothing about your actual camera feed has been analyzed. This is a scripted walkthrough of the app's UI/UX only.",
      targets: withIds(step.targets, `step${stepIndex}`),
      instruction: step.instruction,
      spokenInstruction: step.spokenInstruction,
      requiresVerification: true,
      confidence: 0.78,
      nextExpectedState: step.nextExpectedState,
      verified: null,
    };
  }
}

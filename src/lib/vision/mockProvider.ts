import { checkTextForHighVoltage, SAFETY_STOP_MESSAGE } from "@/lib/safety";
import type { VisionAnalysisResponse, VisionProvider, VisionProviderRequest, VisualTarget } from "./types";

interface ScriptStep {
  targets: Omit<VisualTarget, "id">[];
  instruction: string;
  spokenInstruction: string;
  nextExpectedState: string;
  confirmText: string;
}

/**
 * Deterministic script so the UI/UX can be built and demoed without spending API credits.
 * Coordinates are plausible-looking spots on a breadboard; they intentionally don't depend on
 * the actual frame content since there is no real vision model behind this provider.
 */
const SCRIPT: ScriptStep[] = [
  {
    targets: [
      {
        marker: 1,
        label: "red positive wire",
        type: "wire",
        boundingBox: { x: 0.22, y: 0.38, width: 0.16, height: 0.1 },
        confidence: 0.82,
        shape: "box",
      },
    ],
    instruction:
      "The red wire coming from the power rail doesn't look fully seated. Push it firmly into the positive rail hole, then say \"done\".",
    spokenInstruction: "Check this red wire. Connect it to the highlighted positive rail.",
    nextExpectedState: "The red wire should be firmly inserted into the positive power rail with no visible gap.",
    confirmText: "Good, that connection looks solid now.",
  },
  {
    targets: [
      {
        marker: 1,
        label: "220 ohm resistor",
        type: "resistor",
        boundingBox: { x: 0.5, y: 0.28, width: 0.14, height: 0.09 },
        confidence: 0.76,
        shape: "box",
      },
    ],
    instruction:
      "Now check the resistor next to the LED. Make sure both legs are pushed into the same row as the LED and the rail, not straddling a gap.",
    spokenInstruction: "Now check the highlighted resistor. Make sure both legs are seated properly.",
    nextExpectedState: "The resistor's legs should both be fully inserted in the correct breadboard rows.",
    confirmText: "That resistor placement looks correct.",
  },
  {
    targets: [
      {
        marker: 1,
        label: "LED",
        type: "led",
        boundingBox: { x: 0.58, y: 0.52, width: 0.12, height: 0.1 },
        confidence: 0.71,
        shape: "circle",
      },
      {
        marker: 2,
        label: "ground rail",
        type: "connector",
        boundingBox: { x: 0.16, y: 0.62, width: 0.2, height: 0.08 },
        confidence: 0.68,
        shape: "box",
      },
    ],
    instruction:
      "Check the LED orientation at point 1 - the longer leg (anode) should point toward the resistor, and the shorter leg should connect toward the ground rail at point 2.",
    spokenInstruction: "Check the LED at point 1 and the ground rail at point 2.",
    nextExpectedState: "The LED's short leg should connect toward the ground rail highlighted at point 2.",
    confirmText: "LED orientation and ground connection look right.",
  },
  {
    targets: [
      {
        marker: 1,
        label: "microcontroller GND pin",
        type: "terminal",
        boundingBox: { x: 0.36, y: 0.18, width: 0.1, height: 0.07 },
        confidence: 0.74,
        shape: "circle",
      },
    ],
    instruction:
      "Last check: confirm the board's GND pin has a jumper wire running to the breadboard's ground rail, highlighted at point 1.",
    spokenInstruction: "Confirm the ground pin has a jumper wire to the ground rail.",
    nextExpectedState: "A jumper wire should visibly run from the GND pin to the breadboard ground rail.",
    confirmText: "Ground connection confirmed. Your circuit should be complete now.",
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
      const verified = req.verifyAttempt >= 2 || Math.random() > 0.35;
      if (!verified) {
        return {
          ...baseResponse(),
          status: "continue",
          observation: "That doesn't look quite right yet - the change isn't clearly visible in this frame.",
          targets: withIds(step.targets, `step${stepIndex}`),
          instruction: `Not quite. ${step.instruction}`,
          spokenInstruction: `Not quite yet. ${step.spokenInstruction}`,
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
          observation: step.confirmText,
          instruction: `${step.confirmText} That was the last check - your circuit should be working now. Say "start new session" to troubleshoot something else.`,
          spokenInstruction: `${step.confirmText} That should be everything.`,
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
        observation: step.confirmText,
        targets: withIds(next.targets, `step${nextIndex}`),
        instruction: `${step.confirmText} ${next.instruction}`,
        spokenInstruction: `${step.confirmText} ${next.spokenInstruction}`,
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
        observation: `Regarding "${req.userMessage}": here's the area I mean.`,
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
        "I can see a breadboard with a microcontroller, a few jumper wires, an LED, and a resistor. Let's check the power path first.",
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

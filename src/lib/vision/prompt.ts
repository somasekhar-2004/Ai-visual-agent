import { SAFETY_STOP_MESSAGE } from "@/lib/safety";
import type { VisionProviderRequest } from "./types";

/**
 * System prompt shared by every real VisionProvider implementation.
 * Defines the assistant's persona, the JSON contract, and safety behavior.
 */
export const SYSTEM_PROMPT = `You are AI Visual Expert, a patient, expert low-voltage electronics technician who
is watching a live camera feed alongside the user. You behave like a real technician standing next to them:
you look at what the camera can actually see, you give ONE clear action at a time, and you watch for the
user to make the change before moving on.

SCOPE - strictly low-voltage hobby electronics: Arduino, ESP32, Raspberry Pi, breadboards, batteries (up to
roughly 12-24V small battery packs), sensors, LEDs, small DC motors/circuits, PCBs, connectors, hobby power
supplies (wall-wart DC adapters are fine, the AC side of them is not).

SAFETY - if the frame or the user's words show or describe mains electricity, a wall outlet/socket, exposed
110V/230V household wiring, a breaker/fuse panel, microwave internals, high-voltage capacitors, or any
dangerous power source: STOP giving step-by-step repair instructions immediately. Set status to
"safety_stop", set safetyFlag.triggered to true with a short reason, and use this exact message as
spokenInstruction and instruction: "${SAFETY_STOP_MESSAGE}"
Never assume something is safe just because you don't see obvious high voltage - if uncertain but there are
warning signs (a plug, an outlet, mains-rated cable), still flag it and ask the user to confirm it is a
low-voltage setup before continuing.

HOW TO WORK
1. Inspect the visible evidence in the frame first. Only describe components/wires/connections you can
   actually see. If you cannot clearly see something, say so - never invent a component or a location.
2. If the image is too blurry, too dark, poorly framed, or the relevant area is outside the frame, set
   status to "needs_clarification", explain briefly, and ask the user to adjust the camera (e.g. "move
   closer", "more light", "I can't see the whole board").
3. If you're missing information needed to diagnose (e.g. you don't know what "not working" means yet, or
   what the circuit is supposed to do), ask ONE short clarifying question via clarifyingQuestion and set
   status to "needs_clarification".
4. Otherwise give exactly one concrete next action via "instruction" (can be a couple sentences of detail)
   and a short natural "spokenInstruction" (max ~20 words, no technical jargon dump, sounds like a person
   talking, e.g. "Check this red wire. It may not be connected to the positive rail.").
5. When you want the user to physically point a probe or look at more than one spot, return multiple
   entries in "targets", each with a distinct small integer "marker" (1, 2, 3...) so the interface can
   refer to "point 1" / "point 2" without relying on color.
6. Reference targets naturally in the instruction text (e.g. "the highlighted resistor", "point 2").
6a. CONSISTENCY IS CRITICAL - a highlighted target that doesn't match what you're saying is actively
    unsafe (it tells the user to touch the wrong thing). Every entry in "targets" MUST be something you
    literally talk about in "instruction"/"spokenInstruction" (by its label, its component type, or
    "point N") - never include a target for an object you don't mention. Conversely, if you tell the user
    to look at or touch a specific highlighted component, it MUST have a matching entry in "targets" with
    the correct type/label for THAT object - never label a target as one component (e.g. an LED) while
    the instruction talks about a different one (e.g. a purple wire). Double-check this match before
    responding.
6b. DESTINATION TARGETS - when your instruction tells the user to physically move or connect something to
    a specific destination (a specific hole, pin, row, or terminal - e.g. "move this wire into pin 16"),
    return TWO targets for that step: one with role:"source" for the object to move (e.g. the wire itself,
    at its current location), and one with role:"destination" for the exact destination location, with the
    destination target's "linkedTargetId" set to the source target's "id". Name the specific destination
    (e.g. "pin 16", "row 12 positive rail") in the instruction text too, matching rule 6a. Only include a
    destination target if you can actually see and confidently locate that exact spot in the current frame
    - if you can't confidently pinpoint it, do not guess a point: say so and, if it blocks giving a precise
    next step, set status to "needs_clarification" and ask the user to adjust the camera or point at the
    destination area instead of showing an imprecise marker.
7. Every response needs bounding boxes ONLY for objects you can reasonably locate. Coordinates are
   normalized 0-1 (x/y = top-left corner, width/height = size, relative to the full frame). If you can
   name a component but can't confidently locate it, omit its boundingBox (set it to null) rather than
   guessing.
7a. For an elongated object like a wire or cable that bends or curves, prefer shape "path" over "box": set
    "path" to an ordered list of 2-6 normalized {x, y} points tracing its visible route from one end to
    the other, in addition to a boundingBox that loosely contains it. A tight rectangle around a curvy wire
    is misleading (it also covers whatever is under/around the bend) - a traced line is not. Use "box" for
    compact components (resistors, ICs, connectors), "circle" for round ones (LEDs, terminals), and "path"
    only for wires/cables where you can actually see the route, never a guessed straight line between
    endpoints you can't otherwise justify.
8. requiresVerification should be true whenever you asked the user to physically change something and you
   will need to look again before giving the next step. Set expectedNextState to a short description of
   what the frame should show once they've done it correctly, so a later verification pass knows what to
   look for.
9. When mode is "verify": you are being shown a NEW frame after the user claimed to complete the previous
   instruction. Compare what you see against expectedNextState. Set "verified" to true or false
   (never null) and explain briefly in observation/instruction. If verified, congratulate briefly ("Good,
   that's connected correctly.") and immediately continue with the NEXT instruction and new target(s) - do
   not stop after confirming. If not verified, explain what's still wrong and restate/refine the same
   instruction so the user can try again; do not fabricate progress.
10. Track what has already been checked (from previousObservations / conversation) so you don't repeat the
    exact same instruction. Work systematically (power -> ground -> connections -> specific component)
    rather than jumping around.
11. If the user interrupts with a question (mode "followup"), answer it directly and, if relevant, update
    targets/instruction to match their question (e.g. "which side should I measure?" -> highlight the two
    probe points).
12. Keep a technician's tone: calm, concise, confident, never alarmist, never a wall of text. Prefer "Check
    the highlighted wire." over "There may potentially be several possible causes related to the
    electrical connectivity of your circuit."
13. Report uncertainty honestly via the confidence field (0-1) rather than sounding falsely certain.
14. Stability over speed: if you're not genuinely confident where a target is, omit its boundingBox/path
    rather than placing an approximate marker (see rule 7) - a wrong or wobbly marker is worse than no
    marker. If low confidence in the target location undermines the instruction itself (the user needs a
    precise spot and you can't give one), set status to "needs_clarification" and ask for a better angle
    instead of giving a guessed instruction anyway.

You must respond with ONLY the structured tool call described - no prose outside of it.`;

export function buildUserContext(req: VisionProviderRequest): string {
  const lines: string[] = [];
  lines.push(`mode: ${req.mode}`);
  if (req.problemDescription) {
    lines.push(`Original problem reported by user: "${req.problemDescription}"`);
  }
  if (req.userMessage) {
    lines.push(`User just said: "${req.userMessage}"`);
  }
  if (req.previousInstruction) {
    lines.push(`Previous instruction given: "${req.previousInstruction}"`);
  }
  if (req.expectedNextState) {
    lines.push(`Expected state to verify against: "${req.expectedNextState}"`);
  }
  if (req.mode === "verify") {
    lines.push(
      `This is verification attempt #${req.verifyAttempt} for the current target. The attached frame was captured after the user said they made the change.`,
    );
  }
  if (req.previousObservations.length > 0) {
    lines.push("Recent observations (most recent last):");
    for (const obs of req.previousObservations.slice(-5)) {
      lines.push(`  - ${obs}`);
    }
  }
  if (req.detectedComponents.length > 0) {
    lines.push("Components identified earlier in this session:");
    for (const c of req.detectedComponents.slice(-8)) {
      lines.push(`  - ${c.label} (${c.type}), last seen: ${c.lastSeen}`);
    }
  }
  if (req.conversationTail.length > 0) {
    lines.push("Recent conversation:");
    for (const turn of req.conversationTail.slice(-6)) {
      lines.push(`  ${turn.role}: ${turn.text}`);
    }
  }
  lines.push("Analyze the attached camera frame now and respond with the structured tool call.");
  return lines.join("\n");
}

/** JSON schema for the forced tool-call response, shared by real providers. */
export const ANALYSIS_TOOL_SCHEMA = {
  name: "report_analysis",
  description: "Report the structured troubleshooting analysis of the current camera frame.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      status: {
        type: "string",
        enum: ["continue", "needs_clarification", "resolved", "safety_stop", "error"],
      },
      observation: { type: "string", description: "1-2 sentences describing what you see." },
      targets: {
        type: "array",
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            marker: { type: "integer", minimum: 1, maximum: 9 },
            label: { type: "string" },
            type: {
              type: "string",
              enum: [
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
              ],
            },
            boundingBox: {
              type: ["object", "null"],
              additionalProperties: false,
              properties: {
                x: { type: "number", minimum: 0, maximum: 1 },
                y: { type: "number", minimum: 0, maximum: 1 },
                width: { type: "number", minimum: 0, maximum: 1 },
                height: { type: "number", minimum: 0, maximum: 1 },
              },
              required: ["x", "y", "width", "height"],
            },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            shape: { type: "string", enum: ["box", "circle", "arrow", "point", "path"] },
            path: {
              type: ["array", "null"],
              description: "Only for shape=\"path\": 2-6 ordered {x,y} points tracing a wire's route.",
              minItems: 2,
              maxItems: 6,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  x: { type: "number", minimum: 0, maximum: 1 },
                  y: { type: "number", minimum: 0, maximum: 1 },
                },
                required: ["x", "y"],
              },
            },
            role: {
              type: "string",
              enum: ["source", "destination"],
              description: "'source' (default) = object to act on. 'destination' = where it should end up.",
            },
            linkedTargetId: {
              type: ["string", "null"],
              description: "For role='destination' only: the 'id' of the paired 'source' target.",
            },
          },
          required: ["id", "marker", "label", "type", "boundingBox", "confidence"],
        },
      },
      instruction: { type: "string" },
      spokenInstruction: { type: "string", description: "Max ~20 words, natural spoken language." },
      requiresVerification: { type: "boolean" },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      nextExpectedState: { type: ["string", "null"] },
      clarifyingQuestion: { type: ["string", "null"] },
      safetyFlag: {
        type: ["object", "null"],
        additionalProperties: false,
        properties: {
          triggered: { type: "boolean" },
          reason: { type: "string" },
          message: { type: "string" },
        },
        required: ["triggered", "reason", "message"],
      },
      verified: { type: ["boolean", "null"] },
    },
    required: [
      "status",
      "observation",
      "targets",
      "instruction",
      "spokenInstruction",
      "requiresVerification",
      "confidence",
      "nextExpectedState",
      "clarifyingQuestion",
      "safetyFlag",
      "verified",
    ],
  },
} as const;

/**
 * Structured-output schema for Gemini's `responseSchema` config, expressed in the Gemini/OpenAPI
 * subset dialect (uppercase type names, per-field "nullable" instead of JSON Schema's `type:
 * [x, "null"]` unions). Kept as a plain object here (no SDK import) so this file stays
 * vendor-agnostic like ANALYSIS_TOOL_SCHEMA above; geminiProvider.ts casts it to the SDK's
 * `Schema` type at the point of use. Field-for-field the same contract as ANALYSIS_TOOL_SCHEMA.
 */
export const GEMINI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    status: {
      type: "STRING",
      enum: ["continue", "needs_clarification", "resolved", "safety_stop", "error"],
    },
    observation: { type: "STRING", description: "1-2 sentences describing what you see." },
    targets: {
      type: "ARRAY",
      maxItems: "4",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          marker: { type: "INTEGER" },
          label: { type: "STRING" },
          type: {
            type: "STRING",
            enum: [
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
            ],
          },
          boundingBox: {
            type: "OBJECT",
            nullable: true,
            properties: {
              x: { type: "NUMBER" },
              y: { type: "NUMBER" },
              width: { type: "NUMBER" },
              height: { type: "NUMBER" },
            },
            required: ["x", "y", "width", "height"],
          },
          confidence: { type: "NUMBER" },
          shape: { type: "STRING", enum: ["box", "circle", "arrow", "point", "path"] },
          path: {
            type: "ARRAY",
            nullable: true,
            description: 'Only for shape="path": 2-6 ordered {x,y} points tracing a wire\'s route.',
            minItems: "2",
            maxItems: "6",
            items: {
              type: "OBJECT",
              properties: { x: { type: "NUMBER" }, y: { type: "NUMBER" } },
              required: ["x", "y"],
            },
          },
          role: {
            type: "STRING",
            enum: ["source", "destination"],
            description: "'source' (default) = object to act on. 'destination' = where it should end up.",
          },
          linkedTargetId: {
            type: "STRING",
            nullable: true,
            description: "For role='destination' only: the 'id' of the paired 'source' target.",
          },
        },
        required: ["id", "marker", "label", "type", "boundingBox", "confidence"],
      },
    },
    instruction: { type: "STRING" },
    spokenInstruction: { type: "STRING", description: "Max ~20 words, natural spoken language." },
    requiresVerification: { type: "BOOLEAN" },
    confidence: { type: "NUMBER" },
    nextExpectedState: { type: "STRING", nullable: true },
    clarifyingQuestion: { type: "STRING", nullable: true },
    safetyFlag: {
      type: "OBJECT",
      nullable: true,
      properties: {
        triggered: { type: "BOOLEAN" },
        reason: { type: "STRING" },
        message: { type: "STRING" },
      },
      required: ["triggered", "reason", "message"],
    },
    verified: { type: "BOOLEAN", nullable: true },
  },
  required: [
    "status",
    "observation",
    "targets",
    "instruction",
    "spokenInstruction",
    "requiresVerification",
    "confidence",
    "nextExpectedState",
    "clarifyingQuestion",
    "safetyFlag",
    "verified",
  ],
} as const;

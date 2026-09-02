import Anthropic from "@anthropic-ai/sdk";
import { ANALYSIS_TOOL_SCHEMA, SYSTEM_PROMPT, buildUserContext } from "./prompt";
import type {
  ComponentType,
  NormalizedBoundingBox,
  SafetyFlag,
  VisionAnalysisResponse,
  VisionProvider,
  VisionProviderRequest,
  VisualTarget,
} from "./types";

const DEFAULT_MODEL = "claude-sonnet-5";

function parseDataUrl(dataUrl: string): { mediaType: string; base64: string } {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error("frameDataUrl must be a base64 image data URL (data:image/...;base64,...)");
  }
  return { mediaType: match[1], base64: match[2] };
}

function clamp01(n: unknown, fallback = 0): number {
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

function sanitizeTargets(raw: unknown): VisualTarget[] {
  if (!Array.isArray(raw)) return [];
  const out: VisualTarget[] = [];
  raw.slice(0, 4).forEach((item, i) => {
    if (!item || typeof item !== "object") return;
    const t = item as Record<string, unknown>;
    const type = VALID_TYPES.includes(t.type as ComponentType) ? (t.type as ComponentType) : "other";
    out.push({
      id: typeof t.id === "string" && t.id ? t.id : `target-${i}`,
      marker: typeof t.marker === "number" && t.marker > 0 ? Math.round(t.marker) : i + 1,
      label: typeof t.label === "string" && t.label ? t.label : "component",
      type,
      boundingBox: sanitizeBoundingBox(t.boundingBox),
      confidence: clamp01(t.confidence, 0.5),
      shape: t.shape === "circle" || t.shape === "arrow" || t.shape === "point" ? t.shape : "box",
    });
  });
  return out;
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

/** Coerces/validates a raw tool-call payload into our strict VisionAnalysisResponse shape. */
export function sanitizeAnalysisResponse(raw: unknown): VisionAnalysisResponse {
  const r = (raw ?? {}) as Record<string, unknown>;
  const validStatuses = ["continue", "needs_clarification", "resolved", "safety_stop", "error"];
  const status = validStatuses.includes(r.status as string)
    ? (r.status as VisionAnalysisResponse["status"])
    : "error";

  return {
    status,
    observation: typeof r.observation === "string" ? r.observation : "",
    targets: sanitizeTargets(r.targets),
    instruction: typeof r.instruction === "string" ? r.instruction : "",
    spokenInstruction: typeof r.spokenInstruction === "string" ? r.spokenInstruction : "",
    requiresVerification: Boolean(r.requiresVerification),
    confidence: clamp01(r.confidence, 0.5),
    nextExpectedState: typeof r.nextExpectedState === "string" ? r.nextExpectedState : null,
    clarifyingQuestion: typeof r.clarifyingQuestion === "string" ? r.clarifyingQuestion : null,
    safetyFlag: sanitizeSafetyFlag(r.safetyFlag),
    verified: typeof r.verified === "boolean" ? r.verified : null,
  };
}

export class AnthropicVisionProvider implements VisionProvider {
  readonly name = "anthropic";
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model || DEFAULT_MODEL;
  }

  async analyzeFrame(req: VisionProviderRequest): Promise<VisionAnalysisResponse> {
    const { mediaType, base64 } = parseDataUrl(req.frameDataUrl);
    const contextText = buildUserContext(req);

    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [ANALYSIS_TOOL_SCHEMA as unknown as Anthropic.Tool],
      tool_choice: { type: "tool", name: ANALYSIS_TOOL_SCHEMA.name },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64,
              },
            },
            { type: "text", text: contextText },
          ],
        },
      ],
    });

    const toolUse = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    if (!toolUse) {
      throw new Error("Vision model did not return a structured tool_use response.");
    }
    return sanitizeAnalysisResponse(toolUse.input);
  }
}

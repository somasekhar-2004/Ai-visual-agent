import Anthropic from "@anthropic-ai/sdk";
import { parseDataUrl } from "./dataUrl";
import { ANALYSIS_TOOL_SCHEMA, SYSTEM_PROMPT, buildUserContext } from "./prompt";
import { sanitizeAnalysisResponse } from "./sanitize";
import type { VisionAnalysisResponse, VisionProvider, VisionProviderRequest } from "./types";

const DEFAULT_MODEL = "claude-sonnet-5";

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

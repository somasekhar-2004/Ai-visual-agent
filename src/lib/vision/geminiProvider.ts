import { GoogleGenAI } from "@google/genai";
import type { Schema } from "@google/genai";
import { parseDataUrl } from "./dataUrl";
import { GEMINI_RESPONSE_SCHEMA, SYSTEM_PROMPT, buildUserContext } from "./prompt";
import { sanitizeAnalysisResponse } from "./sanitize";
import type { VisionAnalysisResponse, VisionProvider, VisionProviderRequest } from "./types";

const DEFAULT_MODEL = "gemini-2.5-flash";

export class GeminiVisionProvider implements VisionProvider {
  readonly name = "gemini";
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model || DEFAULT_MODEL;
  }

  async analyzeFrame(req: VisionProviderRequest): Promise<VisionAnalysisResponse> {
    const { mediaType, base64 } = parseDataUrl(req.frameDataUrl);
    const contextText = buildUserContext(req);

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: [{ inlineData: { mimeType: mediaType, data: base64 } }, { text: contextText }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: GEMINI_RESPONSE_SCHEMA as unknown as Schema,
        // Circuit troubleshooting wants the model's best single read of the frame, not a
        // creative one - keep sampling tight so bounding boxes/instructions stay consistent.
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Vision model did not return a response body.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Vision model returned a response that was not valid JSON.");
    }

    return sanitizeAnalysisResponse(parsed);
  }
}

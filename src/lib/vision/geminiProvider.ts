import { GoogleGenAI } from "@google/genai";
import type { Schema } from "@google/genai";
import { parseDataUrl } from "./dataUrl";
import { GEMINI_RESPONSE_SCHEMA, SYSTEM_PROMPT, buildUserContext } from "./prompt";
import { sanitizeAnalysisResponse } from "./sanitize";
import type { VisionAnalysisResponse, VisionProvider, VisionProviderRequest } from "./types";

// "gemini-flash-lite-latest" is Google's self-updating alias for their lightest current flash
// model (resolves to gemini-3.5-flash-lite as of 2026-09-02) - pinning to a dated snapshot like
// "gemini-2.5-flash" risks it being retired for new API keys later, as already observed while
// building this integration. The non-"lite" "gemini-flash-latest" alias was measured under heavy
// load/queueing (503s, 100+ second latency) at build time; -lite responded in ~1-2s with
// accurate results in the same conditions - much closer to what a live, watching technician
// needs. Override via VISION_MODEL for a specific pinned version or higher-accuracy model.
const DEFAULT_MODEL = "gemini-flash-lite-latest";

// Live testing (9 real calls against this exact endpoint) measured 1.9-4.6s consistently, and
// none of `usageMetadata`'s `thoughtsTokenCount` ever appeared in the response - meaning thinking
// was already 0 on every one of those calls, so it isn't the explanation for the 14-20s outliers
// reported from production. Tried explicitly disabling it via `thinkingConfig: { thinkingBudget:
// 0 }` anyway as a belt-and-suspenders lever - but a live isolated test proved this model
// (gemini-flash-lite-latest) rejects that outright with HTTP 400 INVALID_ARGUMENT, so it's
// deliberately NOT set here. The lever that both live-tested clean and actually bounds a
// pathologically slow call is the timeout+retry below - worst case ~20s instead of unbounded.
const PRIMARY_MAX_OUTPUT_TOKENS = 1024;
const RETRY_MAX_OUTPUT_TOKENS = 512;
const PRIMARY_TIMEOUT_MS = 10_000;
const RETRY_TIMEOUT_MS = 10_000;

export class GeminiVisionProvider implements VisionProvider {
  readonly name = "gemini";
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model?: string) {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model || DEFAULT_MODEL;
  }

  private async callOnce(
    mediaType: string,
    base64: string,
    contextText: string,
    opts: { timeoutMs: number; maxOutputTokens: number },
  ) {
    return this.client.models.generateContent({
      model: this.model,
      contents: [{ inlineData: { mimeType: mediaType, data: base64 } }, { text: contextText }],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: GEMINI_RESPONSE_SCHEMA as unknown as Schema,
        // Circuit troubleshooting wants the model's best single read of the frame, not a
        // creative one - keep sampling tight so bounding boxes/instructions stay consistent.
        temperature: 0.2,
        maxOutputTokens: opts.maxOutputTokens,
        httpOptions: { timeout: opts.timeoutMs },
      },
    });
  }

  async analyzeFrame(req: VisionProviderRequest): Promise<VisionAnalysisResponse> {
    const { mediaType, base64 } = parseDataUrl(req.frameDataUrl);
    const contextText = buildUserContext(req);

    // A pathologically slow call (API-side queueing/variance, per the model comment above) used
    // to be able to hang the whole request for 100+ seconds with nothing bounding it. Now: a 10s
    // timeout on the first attempt, and if that fails (timeout OR any other transient error -
    // network blip, 5xx) exactly one retry with a tighter output budget, itself bounded by
    // another 10s timeout - worst case ~20s instead of unbounded, and the common case is
    // unaffected since real calls finish in a few seconds. Live-verified against the real API:
    // a forced-timeout primary attempt correctly aborts, and the retry attempt then succeeds.
    let response;
    try {
      response = await this.callOnce(mediaType, base64, contextText, {
        timeoutMs: PRIMARY_TIMEOUT_MS,
        maxOutputTokens: PRIMARY_MAX_OUTPUT_TOKENS,
      });
    } catch {
      try {
        response = await this.callOnce(mediaType, base64, contextText, {
          timeoutMs: RETRY_TIMEOUT_MS,
          maxOutputTokens: RETRY_MAX_OUTPUT_TOKENS,
        });
      } catch {
        throw new Error("The vision model timed out or failed twice in a row. Please try again.");
      }
    }

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

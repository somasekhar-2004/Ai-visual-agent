import { AnthropicVisionProvider } from "./anthropicProvider";
import { GeminiVisionProvider } from "./geminiProvider";
import { MockVisionProvider } from "./mockProvider";
import type { VisionProvider } from "./types";

export * from "./types";

let cachedProvider: VisionProvider | null = null;

/**
 * Central place that decides which VisionProvider implementation to use.
 * Controlled entirely by server-side env vars - never exposed to the client.
 *
 * VISION_PROVIDER: "mock" | "gemini" | "anthropic" - explicit choice, always wins when set.
 *   Left unset, the app auto-detects from whichever API key is present (GEMINI_API_KEY first,
 *   then VISION_API_KEY), falling back to the mock provider if neither is configured - so the
 *   app always has *something* to run on, real analysis whenever a key is available.
 * GEMINI_API_KEY:  Google AI Studio API key, used only by the "gemini" provider.
 * VISION_API_KEY:  provider API key for the "anthropic" provider.
 * VISION_MODEL:    provider-specific model id (optional, each provider has its own default).
 */
export function getVisionProvider(): VisionProvider {
  if (cachedProvider) return cachedProvider;

  const requested = (process.env.VISION_PROVIDER || "").toLowerCase();
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.VISION_API_KEY;

  const useGemini = requested === "gemini" || (!requested && !!geminiKey);
  const useAnthropic = requested === "anthropic" || (!requested && !geminiKey && !!anthropicKey);

  if (useGemini) {
    if (!geminiKey) {
      throw new Error("GEMINI_API_KEY is required when VISION_PROVIDER=gemini.");
    }
    cachedProvider = new GeminiVisionProvider(geminiKey, process.env.VISION_MODEL);
    return cachedProvider;
  }

  if (useAnthropic) {
    if (!anthropicKey) {
      throw new Error("VISION_API_KEY is required when VISION_PROVIDER=anthropic.");
    }
    cachedProvider = new AnthropicVisionProvider(anthropicKey, process.env.VISION_MODEL);
    return cachedProvider;
  }

  cachedProvider = new MockVisionProvider();
  return cachedProvider;
}

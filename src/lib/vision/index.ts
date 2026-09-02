import { AnthropicVisionProvider } from "./anthropicProvider";
import { MockVisionProvider } from "./mockProvider";
import type { VisionProvider } from "./types";

export * from "./types";

let cachedProvider: VisionProvider | null = null;

/**
 * Central place that decides which VisionProvider implementation to use.
 * Controlled entirely by server-side env vars - never exposed to the client.
 *
 * VISION_PROVIDER: "mock" | "anthropic" (defaults to "mock" if no key is configured)
 * VISION_API_KEY:  provider API key
 * VISION_MODEL:    provider-specific model id (optional, provider has its own default)
 */
export function getVisionProvider(): VisionProvider {
  if (cachedProvider) return cachedProvider;

  const requested = (process.env.VISION_PROVIDER || "").toLowerCase();
  const apiKey = process.env.VISION_API_KEY;

  if (requested === "anthropic" || (!requested && apiKey)) {
    if (!apiKey) {
      throw new Error("VISION_API_KEY is required when VISION_PROVIDER=anthropic.");
    }
    cachedProvider = new AnthropicVisionProvider(apiKey, process.env.VISION_MODEL);
    return cachedProvider;
  }

  cachedProvider = new MockVisionProvider();
  return cachedProvider;
}

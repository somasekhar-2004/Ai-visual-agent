import { NextResponse } from "next/server";
import { getVisionProvider } from "@/lib/vision";

export const runtime = "nodejs";

/**
 * Lets the client know which VisionProvider is actually active, without exposing the API key
 * or any other server-only config. Used to drive the "Vision: MOCK / REAL" diagnostic and the
 * persistent demo-mode banner - the client must never guess this from response content alone,
 * since that's exactly the kind of assumption that leads to treating mock output as real.
 */
export async function GET() {
  // Also reported here (not just visionProvider) so the client knows upfront whether the
  // /api/tts server-side voice fallback is even worth attempting, instead of discovering it via
  // a failed fetch every time.
  const ttsAvailable = Boolean(process.env.GEMINI_API_KEY);

  try {
    const provider = getVisionProvider();
    return NextResponse.json({
      visionProvider: provider.name,
      isMock: provider.name === "mock",
      ttsAvailable,
    });
  } catch (err) {
    // Misconfiguration (e.g. VISION_PROVIDER=gemini with no GEMINI_API_KEY) - report it
    // instead of a bare 500, so the diagnostics UI can show something meaningful rather than
    // just a failed fetch.
    console.error("[/api/diagnostics] failed:", err);
    return NextResponse.json(
      {
        visionProvider: null,
        isMock: false,
        ttsAvailable,
        error: err instanceof Error ? err.message : "Vision provider is misconfigured.",
      },
      { status: 500 },
    );
  }
}

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
  const provider = getVisionProvider();
  return NextResponse.json({
    visionProvider: provider.name,
    isMock: provider.name === "mock",
  });
}

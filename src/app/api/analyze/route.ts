import { NextResponse } from "next/server";
import { BadRequestError, parseVisionRequest, runVisionAnalysis } from "@/lib/vision/handleAnalysis";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const parsed = parseVisionRequest(body);
    const result = await runVisionAnalysis(parsed);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BadRequestError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[/api/analyze] failed:", err);
    return NextResponse.json(
      { error: "The vision service failed to analyze this frame. Please try again." },
      { status: 502 },
    );
  }
}

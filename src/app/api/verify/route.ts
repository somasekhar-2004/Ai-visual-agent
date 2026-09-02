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
    const parsed = parseVisionRequest(body, "verify");
    const result = await runVisionAnalysis(parsed);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BadRequestError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[/api/verify] failed:", err);
    return NextResponse.json(
      { error: "The vision service failed to verify this step. Please try again." },
      { status: 502 },
    );
  }
}

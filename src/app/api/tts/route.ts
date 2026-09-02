import { NextResponse } from "next/server";
import { synthesizeSpeechWav, TtsUnavailableError } from "@/lib/tts/geminiTts";

export const runtime = "nodejs";

/**
 * Server-rendered TTS fallback for when the client-side Web Speech API is unreliable (see
 * useSpeechSynthesis.ts and src/lib/tts/geminiTts.ts for why). Takes plain text, returns
 * playable audio/wav bytes. The Gemini API key never reaches the client - this route is the
 * only place it's used for speech synthesis.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = (body as { text?: unknown })?.text;
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "A non-empty 'text' field is required." }, { status: 400 });
  }

  try {
    const wav = await synthesizeSpeechWav(text);
    return new NextResponse(new Uint8Array(wav), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof TtsUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("[/api/tts] failed:", err);
    return NextResponse.json({ error: "Server voice synthesis failed. Please try again." }, { status: 502 });
  }
}

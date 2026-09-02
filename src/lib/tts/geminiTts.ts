import { GoogleGenAI } from "@google/genai";
import { parseSampleRate, pcm16ToWav } from "./wav";

const DEFAULT_TTS_MODEL = "gemini-2.5-flash-preview-tts";
const DEFAULT_VOICE = "Kore";
const MAX_TEXT_LENGTH = 600;

export class TtsUnavailableError extends Error {}

/**
 * Server-side TTS fallback for browsers where the Web Speech API is unreliable (most notably
 * iOS Safari, where speechSynthesis plays through the "ambient" audio session category and is
 * silenced by the hardware mute switch with no way for a web page to detect or override that -
 * see useSpeechSynthesis.ts). Audio played through a real <audio> element instead uses the
 * "playback" category, which is not affected by the mute switch, so this is the standard,
 * reliable workaround used by production voice-assistant web apps.
 *
 * Reuses GEMINI_API_KEY (the same key already used for vision) so no extra configuration is
 * needed - the key never leaves this server module.
 */
export async function synthesizeSpeechWav(text: string): Promise<Buffer> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new TtsUnavailableError("GEMINI_API_KEY is not configured, so server-side voice output is unavailable.");
  }
  const trimmed = text.trim().slice(0, MAX_TEXT_LENGTH);
  if (!trimmed) {
    throw new Error("No text provided to synthesize.");
  }

  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model: process.env.TTS_MODEL || DEFAULT_TTS_MODEL,
    contents: [{ text: trimmed }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: process.env.TTS_VOICE || DEFAULT_VOICE } },
      },
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  const inline = part?.inlineData;
  if (!inline?.data) {
    throw new Error("TTS model did not return audio data.");
  }

  const pcm = Buffer.from(inline.data, "base64");
  const sampleRate = parseSampleRate(inline.mimeType || "", 24000);
  return pcm16ToWav(pcm, sampleRate);
}

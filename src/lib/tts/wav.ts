/**
 * Gemini's TTS models return raw headerless 16-bit PCM (see the mimeType string on the
 * response part, e.g. "audio/L16;codec=pcm;rate=24000") - browsers can't play that directly via
 * an <audio> element, so this wraps it in a minimal 44-byte WAV/RIFF header before it ever
 * leaves the server.
 */
export function pcm16ToWav(pcm: Buffer, sampleRate: number, channels = 1): Buffer {
  const bitsPerSample = 16;
  const blockAlign = channels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]);
}

/** Parses the sample rate out of a Gemini audio mimeType string like "audio/L16;codec=pcm;rate=24000". */
export function parseSampleRate(mimeType: string, fallback = 24000): number {
  const match = /rate=(\d+)/.exec(mimeType);
  return match ? Number(match[1]) : fallback;
}

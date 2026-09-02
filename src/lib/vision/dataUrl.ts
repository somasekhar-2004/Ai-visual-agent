/** Shared by every real VisionProvider that needs to send a captured frame to an image API. */
export function parseDataUrl(dataUrl: string): { mediaType: string; base64: string } {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error("frameDataUrl must be a base64 image data URL (data:image/...;base64,...)");
  }
  return { mediaType: match[1], base64: match[2] };
}

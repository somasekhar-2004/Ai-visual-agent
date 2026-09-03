import { API_BASE_URL } from "./config";
import type { VisionAnalysisResponse, VisionProviderRequest } from "./types";

/**
 * React Native's fetch is not subject to browser CORS restrictions (CORS is a browser-only
 * mechanism), so the Next.js backend needs no CORS headers for this client - unlike the web app,
 * which is same-origin with its own backend anyway.
 */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function postJson(path: string, body: VisionProviderRequest): Promise<VisionAnalysisResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError(
      `Could not reach the backend at ${API_BASE_URL}. Check that it's running and that your phone ` +
        `is on the same network as ${API_BASE_URL}. (${err instanceof Error ? err.message : String(err)})`,
      0,
    );
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("Received an invalid response from the server.", res.status);
  }

  if (!res.ok) {
    const message = (json as { error?: string })?.error || `Request failed (${res.status}).`;
    throw new ApiError(message, res.status);
  }

  return json as VisionAnalysisResponse;
}

export function callAnalyze(body: VisionProviderRequest): Promise<VisionAnalysisResponse> {
  return postJson("/api/analyze", body);
}

export function callVerify(body: VisionProviderRequest): Promise<VisionAnalysisResponse> {
  return postJson("/api/verify", body);
}

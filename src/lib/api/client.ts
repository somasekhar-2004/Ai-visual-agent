import type { VisionAnalysisResponse, VisionProviderRequest } from "@/lib/vision/types";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function postJson(
  url: string,
  body: VisionProviderRequest,
  signal?: AbortSignal,
): Promise<VisionAnalysisResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

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

export function callAnalyze(body: VisionProviderRequest, signal?: AbortSignal): Promise<VisionAnalysisResponse> {
  return postJson("/api/analyze", body, signal);
}

export function callVerify(body: VisionProviderRequest, signal?: AbortSignal): Promise<VisionAnalysisResponse> {
  return postJson("/api/verify", body, signal);
}

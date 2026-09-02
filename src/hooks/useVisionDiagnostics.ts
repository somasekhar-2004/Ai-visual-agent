"use client";

import { useEffect, useState } from "react";

export type VisionProviderName = "mock" | "gemini" | "anthropic" | null;

const KNOWN_PROVIDERS: readonly VisionProviderName[] = ["mock", "gemini", "anthropic"];

export interface VisionDiagnostics {
  visionProvider: VisionProviderName;
  /** Whether /api/tts (the server-side Gemini voice fallback) is configured at all. */
  ttsAvailable: boolean;
}

/**
 * Fetches which VisionProvider the server is actually running (never guessed client-side -
 * the API key that decides this never reaches the browser) so the UI can show an honest
 * "Vision: MOCK / REAL" indicator and a persistent demo-mode banner instead of letting a
 * scripted mock reply read as a real diagnosis. Also reports whether server-side TTS is
 * available, so the voice output hook knows upfront whether it has a fallback engine to use.
 */
export function useVisionDiagnostics(): VisionDiagnostics {
  const [state, setState] = useState<VisionDiagnostics>({ visionProvider: null, ttsAvailable: false });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/diagnostics")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { visionProvider?: string; ttsAvailable?: boolean } | null) => {
        if (cancelled || !data?.visionProvider) return;
        // Any real provider not in this known list still renders correctly (DiagnosticsBar
        // treats "not mock" as REAL regardless of the exact name), it just falls back to
        // "anthropic" here for typing purposes rather than silently mislabeling a new provider.
        const name = data.visionProvider as VisionProviderName;
        setState({
          visionProvider: KNOWN_PROVIDERS.includes(name) ? name : "anthropic",
          ttsAvailable: Boolean(data.ttsAvailable),
        });
      })
      .catch(() => {
        /* Diagnostics are best-effort - leave state at its default ("…") on failure. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

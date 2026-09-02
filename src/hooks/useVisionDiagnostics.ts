"use client";

import { useEffect, useState } from "react";

export type VisionProviderName = "mock" | "gemini" | "anthropic" | null;

const KNOWN_PROVIDERS: readonly VisionProviderName[] = ["mock", "gemini", "anthropic"];

/**
 * Fetches which VisionProvider the server is actually running (never guessed client-side -
 * the API key that decides this never reaches the browser) so the UI can show an honest
 * "Vision: MOCK / REAL" indicator and a persistent demo-mode banner instead of letting a
 * scripted mock reply read as a real diagnosis.
 */
export function useVisionDiagnostics(): VisionProviderName {
  const [provider, setProvider] = useState<VisionProviderName>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/diagnostics")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { visionProvider?: string } | null) => {
        if (cancelled || !data?.visionProvider) return;
        // Any real provider not in this known list still renders correctly (DiagnosticsBar
        // treats "not mock" as REAL regardless of the exact name), it just falls back to
        // "anthropic" here for typing purposes rather than silently mislabeling a new provider.
        const name = data.visionProvider as VisionProviderName;
        setProvider(KNOWN_PROVIDERS.includes(name) ? name : "anthropic");
      })
      .catch(() => {
        /* Diagnostics are best-effort - leave provider as null (shown as "…") on failure. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return provider;
}

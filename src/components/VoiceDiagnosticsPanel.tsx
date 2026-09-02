"use client";

import type { SpeechEngine, TestVoiceState, VoiceEngineStatus } from "@/hooks/useSpeechSynthesis";

interface VoiceDiagnosticsPanelProps {
  speechSupported: boolean;
  voiceStatus: VoiceEngineStatus;
  testVoice: () => void;
  testVoiceState: TestVoiceState;
  testVoiceError: string | null;
  selectedVoiceName: string | null;
  confirmVoiceHeard: (heard: boolean) => void;
  engine: SpeechEngine;
  setEngine: (engine: SpeechEngine) => void;
  serverTtsAvailable: boolean;
}

const STATUS_LABEL: Record<VoiceEngineStatus, string> = {
  pending: "NOT TESTED",
  unconfirmed: "UNCONFIRMED",
  ready: "READY (confirmed)",
  failed: "FAILED",
};

const STATUS_CLASS: Record<VoiceEngineStatus, string> = {
  pending: "text-neutral-400",
  unconfirmed: "text-amber-400",
  ready: "text-emerald-400",
  failed: "text-red-400",
};

/**
 * The honest voice-output check requested after real iPhone testing: "no error thrown" is never
 * proof that anything was heard (see useSpeechSynthesis's module doc comment for why, on iOS
 * specifically), so this always shows the raw facts - whether onstart actually fired, which
 * voice was selected, the exact error text - and requires the user to personally confirm they
 * heard the test phrase before anything is ever labeled READY.
 */
export function VoiceDiagnosticsPanel({
  speechSupported,
  voiceStatus,
  testVoice,
  testVoiceState,
  testVoiceError,
  selectedVoiceName,
  confirmVoiceHeard,
  engine,
  setEngine,
  serverTtsAvailable,
}: VoiceDiagnosticsPanelProps) {
  const canTest = engine === "server" ? serverTtsAvailable : speechSupported;
  const startedLabel =
    testVoiceState === "testing"
      ? "Waiting…"
      : testVoiceState === "awaiting-confirmation" || testVoiceState === "confirmed" || testVoiceState === "declined"
        ? "Yes (onstart fired)"
        : testVoiceState === "error"
          ? "No"
          : "Not tested yet";

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 text-sm shadow-xl backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Voice output check</p>
          <p className="mt-1 text-xs text-neutral-400">
            &quot;No error&quot; isn&apos;t proof of sound — confirm you actually heard it.
          </p>
        </div>
        <button
          type="button"
          onClick={testVoice}
          disabled={!canTest}
          className="shrink-0 rounded-full bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 transition hover:bg-cyan-400 disabled:opacity-40"
        >
          Test Voice
        </button>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
        <dt className="text-neutral-500">Engine</dt>
        <dd className="text-neutral-200">{engine === "server" ? "Server (Gemini)" : "Browser (Web Speech)"}</dd>
        <dt className="text-neutral-500">Selected voice</dt>
        <dd className="text-neutral-200">{selectedVoiceName ?? "—"}</dd>
        <dt className="text-neutral-500">Playback started</dt>
        <dd className="text-neutral-200">{startedLabel}</dd>
        <dt className="text-neutral-500">Status</dt>
        <dd className={STATUS_CLASS[voiceStatus]}>{STATUS_LABEL[voiceStatus]}</dd>
      </dl>

      {testVoiceState === "awaiting-confirmation" && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 p-2.5">
          <p className="flex-1 text-xs text-amber-200">Did you actually hear &quot;Voice test successful&quot;?</p>
          <button
            type="button"
            onClick={() => confirmVoiceHeard(true)}
            className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-neutral-950"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => confirmVoiceHeard(false)}
            className="rounded-full bg-red-500 px-3 py-1 text-[11px] font-semibold text-neutral-950"
          >
            No
          </button>
        </div>
      )}

      {testVoiceError && (
        <p className="mt-3 flex items-start gap-1.5 text-[11px] font-medium text-red-400">
          <span aria-hidden>⚠</span>
          <span>{testVoiceError}</span>
        </p>
      )}

      {serverTtsAvailable && (
        <div className="mt-3 flex items-center gap-2 border-t border-neutral-800 pt-3 text-[11px] text-neutral-400">
          <span>Voice engine:</span>
          <button
            type="button"
            onClick={() => setEngine("webspeech")}
            className={`rounded-full border px-2.5 py-1 transition ${
              engine === "webspeech" ? "border-cyan-400 text-cyan-300" : "border-neutral-700 text-neutral-400"
            }`}
          >
            Browser
          </button>
          <button
            type="button"
            onClick={() => setEngine("server")}
            className={`rounded-full border px-2.5 py-1 transition ${
              engine === "server" ? "border-cyan-400 text-cyan-300" : "border-neutral-700 text-neutral-400"
            }`}
          >
            Server
          </button>
        </div>
      )}
    </div>
  );
}

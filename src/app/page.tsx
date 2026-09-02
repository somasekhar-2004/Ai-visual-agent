"use client";

import { useEffect } from "react";
import { CameraOverlay } from "@/components/CameraOverlay";
import { InstructionPanel } from "@/components/InstructionPanel";
import { LiveCamera } from "@/components/LiveCamera";
import { SafetyBanner } from "@/components/SafetyBanner";
import { SessionHistory } from "@/components/SessionHistory";
import { StatusIndicator } from "@/components/StatusIndicator";
import { VoiceInput } from "@/components/VoiceInput";
import { useCamera } from "@/hooks/useCamera";
import { useTroubleshootingSession } from "@/hooks/useTroubleshootingSession";

function PauseIcon({ paused }: { paused: boolean }) {
  return paused ? (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M8 5v14l11-7Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M7 5h4v14H7Zm6 0h4v14h-4Z" />
    </svg>
  );
}

function SwitchCameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path
        d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"
        strokeLinejoin="round"
      />
      <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
      <path d="M15 4v3M9 4v3" strokeLinecap="round" />
    </svg>
  );
}

export default function Home() {
  const camera = useCamera();
  const cameraActive = camera.status === "streaming";
  const troubleshooting = useTroubleshootingSession(camera.videoRef, cameraActive);

  useEffect(() => {
    void camera.start();
    // Auto-request camera permission once on load; user can retry via the on-screen button
    // if it's denied or the device has none.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastInstruction = troubleshooting.session.previousInstructions.at(-1) ?? null;
  const isSafetyStopped = troubleshooting.session.status === "safety_stop";
  const inputDisabled = troubleshooting.isBusy || !cameraActive;

  return (
    <div className="flex min-h-dvh flex-col bg-neutral-950">
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="#022c33" strokeWidth={2.2} className="h-4.5 w-4.5">
              <path d="M4 8V6a2 2 0 0 1 2-2h2M20 8V6a2 2 0 0 0-2-2h-2M4 16v2a2 2 0 0 0 2 2h2M20 16v2a2 2 0 0 1-2 2h-2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight tracking-tight text-neutral-50">AI Visual Expert</h1>
            <p className="text-[10px] leading-tight text-neutral-500">Live electronics technician</p>
          </div>
        </div>
        <button
          onClick={troubleshooting.startNewSession}
          className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:border-neutral-500 hover:text-neutral-100"
        >
          New session
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-3 pb-4">
        <div className="relative h-[52vh] min-h-[300px] w-full overflow-hidden rounded-2xl border border-neutral-800 shadow-2xl sm:h-[60vh]">
          <LiveCamera videoRef={camera.videoRef} status={camera.status} error={camera.error} onRetry={camera.start}>
            <CameraOverlay
              videoRef={camera.videoRef}
              targets={troubleshooting.session.currentTargets}
              active={cameraActive && !isSafetyStopped}
            />
          </LiveCamera>

          <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between">
            <div className="pointer-events-auto">
              <StatusIndicator phase={troubleshooting.phase} />
            </div>
            <div className="pointer-events-auto flex gap-2">
              {camera.canSwitch && (
                <button
                  onClick={() => void camera.switchCamera()}
                  aria-label="Switch camera"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-neutral-100 backdrop-blur-sm transition hover:bg-black/80"
                >
                  <SwitchCameraIcon />
                </button>
              )}
              {cameraActive || camera.status === "paused" ? (
                <button
                  onClick={() => (camera.status === "paused" ? camera.resume() : camera.pause())}
                  aria-label={camera.status === "paused" ? "Resume camera" : "Pause camera"}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-neutral-100 backdrop-blur-sm transition hover:bg-black/80"
                >
                  <PauseIcon paused={camera.status === "paused"} />
                </button>
              ) : null}
            </div>
          </div>

          {troubleshooting.session.currentTargets.length > 1 && cameraActive && (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center">
              <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] text-neutral-300 backdrop-blur-sm">
                Multiple points highlighted — check markers{" "}
                {troubleshooting.session.currentTargets.map((t) => t.marker).join(" & ")}
              </span>
            </div>
          )}
        </div>

        {isSafetyStopped && (
          <SafetyBanner message={lastInstruction?.text ?? "This looks like it may involve high-voltage equipment."} />
        )}

        <InstructionPanel
          instruction={lastInstruction}
          clarifyingQuestion={
            troubleshooting.session.status === "needs_clarification" ? (lastInstruction?.text ?? null) : null
          }
          errorMessage={troubleshooting.errorMessage}
          speaking={troubleshooting.speaking}
          speechSupported={troubleshooting.speechSupported}
          speechEnabled={troubleshooting.speechEnabled}
          onToggleSpeech={() => troubleshooting.setSpeechEnabled(!troubleshooting.speechEnabled)}
          onReplay={troubleshooting.replayInstruction}
          speechRate={troubleshooting.speechRate}
          onRateChange={troubleshooting.setSpeechRate}
        />

        <VoiceInput
          voiceSupported={troubleshooting.voiceSupported}
          voiceState={troubleshooting.voiceState}
          interimTranscript={troubleshooting.interimTranscript}
          disabled={inputDisabled}
          onStartListening={troubleshooting.startListening}
          onStopListening={troubleshooting.stopListening}
          onSubmitText={troubleshooting.submitMessage}
        />

        <SessionHistory session={troubleshooting.session} />
      </main>
    </div>
  );
}

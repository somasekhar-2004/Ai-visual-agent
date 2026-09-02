import type { Instruction } from "@/lib/session/types";

interface InstructionPanelProps {
  instruction: Instruction | null;
  clarifyingQuestion: string | null;
  errorMessage: string | null;
  speaking: boolean;
  speechSupported: boolean;
  speechEnabled: boolean;
  onToggleSpeech: () => void;
  onReplay: () => void;
  speechRate: number;
  onRateChange: (rate: number) => void;
  /** Exact reason the last voice-output attempt failed, if any - shown as-is, never hidden
   * behind a generic "Speaking…" label. */
  voiceError: string | null;
}

export function InstructionPanel({
  instruction,
  clarifyingQuestion,
  errorMessage,
  speaking,
  speechSupported,
  speechEnabled,
  onToggleSpeech,
  onReplay,
  speechRate,
  onRateChange,
  voiceError,
}: InstructionPanelProps) {
  const bodyText = errorMessage ?? clarifyingQuestion ?? instruction?.text;

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-xl backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
            {errorMessage ? "Attention" : clarifyingQuestion ? "Quick question" : "Current step"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-neutral-100">
            {bodyText ?? "Point the camera at your circuit and tell me what's going on."}
          </p>
          {instruction?.requiresVerification && !errorMessage && !clarifyingQuestion && (
            <p className="mt-2 text-xs text-neutral-400">
              Make the change, then say <span className="font-medium text-neutral-200">&quot;done&quot;</span> or hold
              it steady in front of the camera.
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <button
            aria-label={speechEnabled ? "Mute voice output" : "Unmute voice output"}
            onClick={onToggleSpeech}
            disabled={!speechSupported}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              speechEnabled
                ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300"
                : "border-neutral-700 text-neutral-500"
            } disabled:opacity-30`}
          >
            {speechEnabled ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M4 9v6h4l5 5V4L8 9H4Zm11.5 3a4.5 4.5 0 0 0-2.5-4.03v8.06A4.5 4.5 0 0 0 15.5 12Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M4 9v6h4l5 5V4L8 9H4Zm14.59 3 2.7-2.71-1.41-1.41L17.18 10.6l-2.7-2.7-1.42 1.41 2.71 2.7-2.71 2.71 1.42 1.41 2.7-2.7 2.7 2.7 1.41-1.41L18.59 12Z" />
              </svg>
            )}
          </button>
          <button
            aria-label="Replay instruction"
            onClick={onReplay}
            disabled={!speechSupported || !instruction}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 text-neutral-300 transition hover:border-neutral-500 disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path d="M4 4v6h6M4 10a8 8 0 1 1 2.34 5.66" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {speaking && <p className="mt-2 text-[11px] font-medium text-emerald-400">Speaking…</p>}

      {!speaking && voiceError && (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] font-medium text-red-400">
          <span aria-hidden>⚠</span>
          <span>Voice error: {voiceError}</span>
        </p>
      )}

      {speechSupported && (
        <div className="mt-3 flex items-center gap-2 border-t border-neutral-800 pt-3">
          <label htmlFor="rate" className="text-[11px] text-neutral-500">
            Speech rate
          </label>
          <input
            id="rate"
            type="range"
            min={0.6}
            max={1.6}
            step={0.1}
            value={speechRate}
            onChange={(e) => onRateChange(Number(e.target.value))}
            className="h-1 flex-1 accent-cyan-400"
          />
          <span className="w-8 text-right text-[11px] text-neutral-500">{speechRate.toFixed(1)}x</span>
        </div>
      )}
    </div>
  );
}

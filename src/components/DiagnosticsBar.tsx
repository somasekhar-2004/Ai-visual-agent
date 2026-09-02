import type { MicPermissionStatus } from "@/hooks/useSpeechRecognition";
import type { VoiceEngineStatus } from "@/hooks/useSpeechSynthesis";
import type { VisionProviderName } from "@/hooks/useVisionDiagnostics";

interface DiagnosticsBarProps {
  visionProvider: VisionProviderName;
  voiceSupported: boolean;
  voiceStatus: VoiceEngineStatus;
  micSupported: boolean;
  micStatus: MicPermissionStatus;
  onOpenVoiceSettings?: () => void;
}

type BadgeTone = "neutral" | "good" | "bad" | "pending";

const DOT_CLASS: Record<BadgeTone, string> = {
  neutral: "bg-neutral-500",
  good: "bg-emerald-400",
  bad: "bg-red-400",
  pending: "bg-amber-400",
};

function Badge({ label, value, tone, title }: { label: string; value: string; tone: BadgeTone; title?: string }) {
  return (
    <span
      title={title}
      className="flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/70 px-2.5 py-1 text-[10px] font-medium tracking-wide text-neutral-300"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_CLASS[tone]}`} aria-hidden />
      {label}: <span className="text-neutral-100">{value}</span>
    </span>
  );
}

/**
 * Small, always-visible diagnostic strip so it's never ambiguous whether the app is running
 * real AI or a scripted demo, and whether voice/mic actually work on this device - rather than
 * the user having to infer it from silently-wrong behavior.
 */
export function DiagnosticsBar({
  visionProvider,
  voiceSupported,
  voiceStatus,
  micSupported,
  micStatus,
  onOpenVoiceSettings,
}: DiagnosticsBarProps) {
  const voiceTone: BadgeTone = !voiceSupported || voiceStatus === "failed" ? "bad" : voiceStatus === "ready" ? "good" : "pending";
  const voiceLabel = !voiceSupported
    ? "FAILED"
    : voiceStatus === "ready"
      ? "READY"
      : voiceStatus === "failed"
        ? "FAILED"
        : voiceStatus === "unconfirmed"
          ? "UNCONFIRMED"
          : "…";

  const micTone: BadgeTone = !micSupported || micStatus === "blocked" ? "bad" : micStatus === "ready" ? "good" : "pending";
  const micLabel = !micSupported ? "BLOCKED" : micStatus === "ready" ? "READY" : micStatus === "blocked" ? "BLOCKED" : "…";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge
        label="Vision"
        value={visionProvider === null ? "…" : visionProvider === "mock" ? "MOCK" : "REAL"}
        tone={visionProvider === null ? "pending" : visionProvider === "mock" ? "pending" : "good"}
        title={
          visionProvider === "mock"
            ? "No real vision provider configured - responses are a scripted demo, not analysis of your camera."
            : visionProvider === "gemini" || visionProvider === "anthropic"
              ? `Connected to a real vision model (${visionProvider}).`
              : undefined
        }
      />
      <button
        type="button"
        onClick={onOpenVoiceSettings}
        disabled={!onOpenVoiceSettings}
        className="disabled:cursor-default"
        aria-label="Open voice settings"
      >
        <Badge
          label="Voice"
          value={voiceLabel}
          tone={voiceTone}
          title={
            !voiceSupported
              ? "Speech synthesis is not supported in this browser."
              : voiceStatus === "unconfirmed"
                ? "Playback started but hasn't been confirmed heard yet - tap to run Test Voice."
                : voiceStatus !== "ready"
                  ? "Tap to run Test Voice and confirm voice output actually works."
                  : undefined
          }
        />
      </button>
      <Badge
        label="Mic"
        value={micLabel}
        tone={micTone}
        title={!micSupported ? "Speech recognition is not supported in this browser - use the text input instead." : undefined}
      />
    </div>
  );
}

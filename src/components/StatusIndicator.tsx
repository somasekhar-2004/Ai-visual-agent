import type { AppPhase } from "@/lib/session/types";

const PHASE_LABEL: Record<AppPhase, string> = {
  idle: "Ready — point the camera and ask a question",
  watching: "Watching…",
  listening: "Listening…",
  analyzing: "Analyzing circuit…",
  checking: "Checking your change…",
  speaking: "Speaking…",
  error: "Something went wrong",
};

const PHASE_DOT: Record<AppPhase, string> = {
  idle: "bg-neutral-400",
  watching: "bg-cyan-400",
  listening: "bg-fuchsia-400",
  analyzing: "bg-amber-400",
  checking: "bg-amber-400",
  speaking: "bg-emerald-400",
  error: "bg-red-500",
};

const ANIMATED_PHASES: AppPhase[] = ["watching", "listening", "analyzing", "checking", "speaking"];

export function StatusIndicator({ phase }: { phase: AppPhase }) {
  const animated = ANIMATED_PHASES.includes(phase);
  return (
    <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        {animated && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${PHASE_DOT[phase]}`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${PHASE_DOT[phase]}`} />
      </span>
      <span className="text-xs font-medium tracking-wide text-neutral-100">{PHASE_LABEL[phase]}</span>
    </div>
  );
}

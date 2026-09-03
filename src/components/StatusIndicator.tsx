"use client";

import { useEffect, useState } from "react";
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

// Phases where we're actually waiting on the vision API - a 2-4s wait is normal, but with no
// feedback at all it reads as frozen. Below this a static label is enough; past it, an elapsed
// counter proves the request is still alive; past ELAPSED_SLOW_MS it says so explicitly rather
// than leaving the user to guess whether a stuck-looking wait is actually still in progress.
const BUSY_PHASES: AppPhase[] = ["analyzing", "checking"];
const ELAPSED_VISIBLE_MS = 1500;
const ELAPSED_SLOW_MS = 8000;

/**
 * Renders the label for a busy (analyzing/checking) phase, ticking up an elapsed-time readout.
 * Mounted fresh (via `key={phase}` from the parent) every time the phase changes, so its timer
 * always starts at 0 for a new request without needing an explicit reset - React's hooks-purity
 * lint here disallows both synchronous setState in an effect body and reading Date.now()/refs
 * during render, so the elapsed value is real state, set only from the interval's own callback.
 */
function BusyLabel({ phase }: { phase: AppPhase }) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const id = window.setInterval(() => setElapsedMs(Date.now() - startedAt), 200);
    return () => window.clearInterval(id);
  }, []);

  if (elapsedMs >= ELAPSED_SLOW_MS) {
    return <>Still working — this is taking longer than usual ({Math.round(elapsedMs / 1000)}s)</>;
  }
  if (elapsedMs >= ELAPSED_VISIBLE_MS) {
    return (
      <>
        {PHASE_LABEL[phase]} ({Math.round(elapsedMs / 1000)}s)
      </>
    );
  }
  return <>{PHASE_LABEL[phase]}</>;
}

export function StatusIndicator({ phase }: { phase: AppPhase }) {
  const busy = BUSY_PHASES.includes(phase);
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
      <span className="text-xs font-medium tracking-wide text-neutral-100">
        {busy ? <BusyLabel key={phase} phase={phase} /> : PHASE_LABEL[phase]}
      </span>
    </div>
  );
}

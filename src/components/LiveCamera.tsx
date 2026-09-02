"use client";

import type { RefObject } from "react";
import type { CameraError, CameraStatus } from "@/hooks/useCamera";

interface LiveCameraProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  error: CameraError | null;
  onRetry: () => void;
  children?: React.ReactNode;
}

export function LiveCamera({ videoRef, status, error, onRetry, children }: LiveCameraProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="h-full w-full object-cover"
        style={{ visibility: status === "streaming" || status === "paused" ? "visible" : "hidden" }}
      />

      {children}

      {status === "starting" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950 text-neutral-300">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="text-sm">Starting camera…</p>
        </div>
      )}

      {status === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-neutral-950 px-6 text-center text-neutral-300">
          <p className="max-w-xs text-sm">
            Point your camera at the circuit, breadboard, or PCB you need help with.
          </p>
          <button
            onClick={onRetry}
            className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-medium text-neutral-950 transition hover:bg-cyan-400"
          >
            Enable camera
          </button>
        </div>
      )}

      {status === "error" && error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-neutral-950 px-6 text-center">
          <p className="max-w-xs text-sm text-red-300">{error.message}</p>
          <button
            onClick={onRetry}
            className="rounded-full border border-red-400/50 px-5 py-2 text-sm font-medium text-red-200 transition hover:bg-red-400/10"
          >
            Try again
          </button>
        </div>
      )}

      {status === "paused" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="rounded-full bg-black/70 px-4 py-1.5 text-sm font-medium text-neutral-200">
            Camera paused
          </span>
        </div>
      )}
    </div>
  );
}

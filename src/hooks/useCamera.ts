"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraFacing = "user" | "environment";
export type CameraStatus = "idle" | "starting" | "streaming" | "paused" | "error";
export type CameraErrorKind = "permission-denied" | "not-found" | "insecure-context" | "unsupported" | "other";

export interface CameraError {
  kind: CameraErrorKind;
  message: string;
}

function isMobileUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function describeError(err: unknown): CameraError {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError" || err.name === "SecurityError") {
      return {
        kind: "permission-denied",
        message: "Camera access was denied. Please allow camera permission in your browser settings and try again.",
      };
    }
    if (err.name === "NotFoundError" || err.name === "OverconstrainedError") {
      return { kind: "not-found", message: "No usable camera was found on this device." };
    }
  }
  return { kind: "other", message: err instanceof Error ? err.message : "Could not access the camera." };
}

export interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
  error: CameraError | null;
  facing: CameraFacing;
  canSwitch: boolean;
  start: () => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  switchCamera: () => Promise<void>;
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<CameraError | null>(null);
  const [facing, setFacing] = useState<CameraFacing>(isMobileUserAgent() ? "environment" : "user");
  const [canSwitch, setCanSwitch] = useState(false);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const checkMultipleCameras = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCanSwitch(devices.filter((d) => d.kind === "videoinput").length > 1);
    } catch {
      // Non-fatal; leave canSwitch as-is.
    }
  }, []);

  const start = useCallback(
    async (requestedFacing?: CameraFacing) => {
      if (typeof window === "undefined") return;
      if (!window.isSecureContext) {
        setStatus("error");
        setError({
          kind: "insecure-context",
          message: "Camera access requires HTTPS (or localhost). Please open this app over a secure connection.",
        });
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("error");
        setError({ kind: "unsupported", message: "This browser does not support camera access." });
        return;
      }

      setStatus("starting");
      setError(null);
      stopTracks();

      const facingToUse = requestedFacing ?? facing;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingToUse },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {
            /* autoplay can reject until user gesture on some browsers; ignore */
          });
        }
        setFacing(facingToUse);
        setStatus("streaming");
        void checkMultipleCameras();
      } catch (err) {
        setStatus("error");
        setError(describeError(err));
      }
    },
    [facing, stopTracks, checkMultipleCameras],
  );

  const stop = useCallback(() => {
    stopTracks();
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus("idle");
  }, [stopTracks]);

  const pause = useCallback(() => {
    if (!streamRef.current) return;
    streamRef.current.getVideoTracks().forEach((t) => (t.enabled = false));
    videoRef.current?.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (!streamRef.current) return;
    streamRef.current.getVideoTracks().forEach((t) => (t.enabled = true));
    void videoRef.current?.play().catch(() => {});
    setStatus("streaming");
  }, []);

  const switchCamera = useCallback(async () => {
    const next: CameraFacing = facing === "environment" ? "user" : "environment";
    await start(next);
  }, [facing, start]);

  useEffect(() => {
    return () => {
      stopTracks();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    videoRef,
    status,
    error,
    facing,
    canSwitch,
    start: () => start(),
    stop,
    pause,
    resume,
    switchCamera,
  };
}

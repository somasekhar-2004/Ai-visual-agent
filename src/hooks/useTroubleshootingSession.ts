"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

import { ApiError, callAnalyze, callVerify } from "@/lib/api/client";
import { captureFrame } from "@/lib/frameCapture";
import { watchForChange } from "@/lib/changeDetection";
import {
  addUserResponse,
  applyAnalysisResponse,
  conversationTail,
  createSession,
  recentObservationTexts,
  setUserProblem,
} from "@/lib/session/sessionManager";
import type { AppPhase, TroubleshootingSession } from "@/lib/session/types";
import type { AnalysisMode, VisionProviderRequest } from "@/lib/vision/types";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import { useSpeechRecognition } from "./useSpeechRecognition";

export interface TroubleshootingConfig {
  /** How often to sample locally for change detection, in ms. */
  changeSampleIntervalMs: number;
  /** 0-1 normalized diff score above which we consider it "significant movement". */
  changeThreshold: number;
  /** Minimum time between AI calls, to avoid flooding the API. */
  minCooldownMs: number;
  /** Automatically call /api/verify when the scene settles after a pending instruction. */
  autoVerifyOnChange: boolean;
}

export const DEFAULT_CONFIG: TroubleshootingConfig = {
  changeSampleIntervalMs: 700,
  changeThreshold: 0.035,
  minCooldownMs: 3500,
  autoVerifyOnChange: true,
};

const DONE_PATTERN = /\b(done|finished|completed|ok(ay)? i did it|that's it)\b/i;

function relativeLastSeen(timestamp: number): string {
  const deltaSec = (Date.now() - timestamp) / 1000;
  if (deltaSec < 20) return "just now";
  if (deltaSec < 90) return "a moment ago";
  return "earlier in this session";
}

export interface UseTroubleshootingSessionResult {
  session: TroubleshootingSession;
  phase: AppPhase;
  errorMessage: string | null;
  currentInstruction: string | null;
  currentSpokenInstruction: string | null;
  isBusy: boolean;
  // voice
  voiceSupported: boolean;
  voiceState: "idle" | "listening" | "processing";
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  // speech output
  speechSupported: boolean;
  speechEnabled: boolean;
  setSpeechEnabled: (v: boolean) => void;
  speechRate: number;
  setSpeechRate: (v: number) => void;
  speaking: boolean;
  replayInstruction: () => void;
  // actions
  submitMessage: (text: string, source?: "voice" | "text") => void;
  startNewSession: () => void;
}

export function useTroubleshootingSession(
  videoRef: RefObject<HTMLVideoElement | null>,
  cameraActive: boolean,
  config: TroubleshootingConfig = DEFAULT_CONFIG,
): UseTroubleshootingSessionResult {
  const [session, setSession] = useState<TroubleshootingSession>(() => createSession());
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sessionRef = useRef(session);
  const phaseRef = useRef(phase);
  const inFlightRef = useRef(false);
  const lastAnalyzedAtRef = useRef<number>(0);
  const safetyStoppedRef = useRef(false);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const speechOut = useSpeechSynthesis();

  const runAnalysis = useCallback(
    async (mode: AnalysisMode, userMessage: string | null) => {
      if (inFlightRef.current) return;
      const video = videoRef.current;
      if (!video || !cameraActive) {
        setErrorMessage("Camera isn't active. Please enable the camera first.");
        setPhase("error");
        return;
      }

      const frame = captureFrame(video);
      if (!frame) {
        setErrorMessage("I can't see anything yet. Point the camera at your circuit and hold steady.");
        setPhase("error");
        return;
      }

      inFlightRef.current = true;
      setErrorMessage(null);
      setPhase(mode === "verify" ? "checking" : "analyzing");

      const s = sessionRef.current;
      const lastInstruction = s.previousInstructions.at(-1)?.text ?? null;
      const payload: VisionProviderRequest = {
        frameDataUrl: frame.dataUrl,
        mode,
        userMessage,
        problemDescription: s.userProblem,
        previousInstruction: lastInstruction,
        expectedNextState: s.expectedNextState,
        previousObservations: recentObservationTexts(s),
        detectedComponents: s.detectedComponents.map((c) => ({
          label: c.label,
          type: c.type,
          lastSeen: relativeLastSeen(c.lastSeenAt),
        })),
        conversationTail: conversationTail(s),
        verifyAttempt: s.verifyAttempt,
      };

      try {
        const response = mode === "verify" ? await callVerify(payload) : await callAnalyze(payload);
        lastAnalyzedAtRef.current = Date.now();

        setSession((prev) => applyAnalysisResponse(prev, response));

        if (response.status === "safety_stop") {
          safetyStoppedRef.current = true;
        }

        setPhase("speaking");
        speechOut.speak(response.spokenInstruction || response.instruction);
        // If voice output is off/unsupported, speak() is a no-op and "speaking" will never
        // flip true->false to drive the transition below, so fall back to "watching" now.
        if (!speechOut.supported || !speechOut.enabled) {
          setPhase("watching");
        }
      } catch (err) {
        lastAnalyzedAtRef.current = Date.now();
        const message =
          err instanceof ApiError
            ? err.message
            : "Lost connection to the AI service. Check your network and try again.";
        setErrorMessage(message);
        setPhase("error");
      } finally {
        inFlightRef.current = false;
      }
    },
    // Depend on `speechOut.speak` (which is itself memoized and only changes when
    // enabled/supported change) rather than the whole `speechOut` object, which is a fresh
    // literal every render - keeping this callback stable so effects that depend on it
    // (the change-detection watcher below) don't get torn down and rebuilt constantly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoRef, cameraActive, speechOut.speak],
  );

  // Once speaking finishes, fall back to "watching" (unless a new call already changed phase).
  useEffect(() => {
    if (!speechOut.speaking && phaseRef.current === "speaking") {
      setPhase("watching");
    }
  }, [speechOut.speaking]);

  const submitMessage = useCallback(
    (rawText: string, source: "voice" | "text" = "text") => {
      const text = rawText.trim();
      if (!text || inFlightRef.current) return;

      setSession((prev) => addUserResponse(prev, text, source));

      const s = sessionRef.current;
      const isDone = DONE_PATTERN.test(text);

      if (isDone && s.expectedNextState) {
        void runAnalysis("verify", text);
        return;
      }

      if (!s.userProblem) {
        setSession((prev) => setUserProblem(prev, text));
        void runAnalysis("initial", text);
        return;
      }

      void runAnalysis("followup", text);
    },
    [runAnalysis],
  );

  const speechRecognition = useSpeechRecognition({
    onFinalResult: (finalText) => submitMessage(finalText, "voice"),
    // Driven directly from the browser SpeechRecognition events (not a React effect
    // reacting to state), so the status pill flips to "Listening…" / back the instant the
    // mic actually starts/stops rather than on a follow-up render.
    onListeningStart: () => setPhase("listening"),
    onListeningEnd: () => {
      if (phaseRef.current === "listening") setPhase("watching");
    },
  });

  // Continuous background watcher: samples the live frame and, once the scene settles after
  // movement while a verification is pending, automatically captures + verifies - this is what
  // lets the app "watch the change" instead of requiring the user to re-upload a photo.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !cameraActive) return;

    const stopWatching = watchForChange(video, {
      intervalMs: config.changeSampleIntervalMs,
      threshold: config.changeThreshold,
      onStable: () => {
        if (!config.autoVerifyOnChange) return;
        if (safetyStoppedRef.current) return;
        if (inFlightRef.current) return;
        const s = sessionRef.current;
        if (!s.expectedNextState) return;
        if (Date.now() - lastAnalyzedAtRef.current < config.minCooldownMs) return;
        void runAnalysis("verify", null);
      },
    });

    return stopWatching;
  }, [videoRef, cameraActive, config, runAnalysis]);

  const startNewSession = useCallback(() => {
    speechOut.stop();
    speechRecognition.stop();
    safetyStoppedRef.current = false;
    inFlightRef.current = false;
    lastAnalyzedAtRef.current = 0;
    setErrorMessage(null);
    setSession(createSession());
    setPhase("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastInstruction = session.previousInstructions.at(-1) ?? null;

  return {
    session,
    phase,
    errorMessage,
    currentInstruction: lastInstruction?.text ?? null,
    currentSpokenInstruction: lastInstruction?.spokenText ?? null,
    isBusy: phase === "analyzing" || phase === "checking",

    voiceSupported: speechRecognition.supported,
    voiceState: speechRecognition.state,
    interimTranscript: speechRecognition.interimTranscript,
    startListening: speechRecognition.start,
    stopListening: speechRecognition.stop,

    speechSupported: speechOut.supported,
    speechEnabled: speechOut.enabled,
    setSpeechEnabled: speechOut.setEnabled,
    speechRate: speechOut.rate,
    setSpeechRate: speechOut.setRate,
    speaking: speechOut.speaking,
    replayInstruction: speechOut.replay,

    submitMessage,
    startNewSession,
  };
}

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
import {
  useSpeechSynthesis,
  type SpeechEngine,
  type TestVoiceState,
  type VoiceEngineStatus,
} from "./useSpeechSynthesis";
import {
  useSpeechRecognition,
  type ListeningEndReason,
  type MicPermissionStatus,
} from "./useSpeechRecognition";

export interface TroubleshootingConfig {
  changeSampleIntervalMs: number;
  changeThreshold: number;
  minCooldownMs: number;
  autoVerifyOnChange: boolean;
}

export const DEFAULT_CONFIG: TroubleshootingConfig = {
  changeSampleIntervalMs: 700,
  changeThreshold: 0.035,
  minCooldownMs: 3500,
  autoVerifyOnChange: true,
};

const DONE_PATTERN = /\b(done|finished|completed|ok(ay)? i did it|that's it)\b/i;

// Hands-free restart timing, per the requested "wait ~300-700ms after speech ends, then restart
// listening" behavior.
const RESTART_AFTER_SPEECH_MS = 500;
const RESTART_AFTER_NO_SPEECH_MS = 400;
const RESTART_AFTER_ERROR_MS = 800;
// Safety net against a pathological restart loop (e.g. a device whose mic errors instantly every
// time) - if recognition restarts this many times within this window, voice mode auto-disables
// itself with an explanation instead of spinning forever.
const RAPID_RESTART_WINDOW_MS = 10000;
const RAPID_RESTART_MAX = 6;

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
  voiceSupported: boolean;
  voiceState: "idle" | "listening" | "processing";
  interimTranscript: string;
  micStatus: MicPermissionStatus;
  startListening: () => void;
  stopListening: () => void;
  /** Hands-free "conversational" mode: once on, the mic automatically restarts after every AI
   * response instead of requiring a tap for every turn. See toggleVoiceMode. */
  voiceModeEnabled: boolean;
  toggleVoiceMode: () => void;
  /** Set when voice mode auto-disables itself (blocked mic permission, or a runaway restart
   * loop) - shown so the user knows *why* hands-free mode turned off rather than just noticing
   * it silently stopped working. */
  voiceModeError: string | null;
  speechSupported: boolean;
  speechEnabled: boolean;
  setSpeechEnabled: (v: boolean) => void;
  speechRate: number;
  setSpeechRate: (v: number) => void;
  speaking: boolean;
  voiceStatus: VoiceEngineStatus;
  voiceError: string | null;
  engine: SpeechEngine;
  setEngine: (engine: SpeechEngine) => void;
  serverTtsAvailable: boolean;
  testVoice: () => void;
  testVoiceState: TestVoiceState;
  testVoiceError: string | null;
  selectedVoiceName: string | null;
  confirmVoiceHeard: (heard: boolean) => void;
  replayInstruction: () => void;
  unlockVoice: () => void;
  submitMessage: (text: string, source?: "voice" | "text") => void;
  startNewSession: () => void;
}

export function useTroubleshootingSession(
  videoRef: RefObject<HTMLVideoElement | null>,
  cameraActive: boolean,
  config: TroubleshootingConfig = DEFAULT_CONFIG,
  serverTtsAvailable = false,
): UseTroubleshootingSessionResult {
  const [session, setSession] = useState<TroubleshootingSession>(() => createSession());
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [voiceModeError, setVoiceModeError] = useState<string | null>(null);

  const sessionRef = useRef(session);
  const phaseRef = useRef(phase);
  const inFlightRef = useRef(false);
  const lastAnalyzedAtRef = useRef<number>(0);
  const safetyStoppedRef = useRef(false);
  const voiceModeEnabledRef = useRef(false);
  const restartTimerRef = useRef<number | null>(null);
  const restartTimestampsRef = useRef<number[]>([]);
  // Mirrors the live speechRecognition object so callbacks that must stay referentially stable
  // (handleListeningEnd, toggleVoiceMode, ...) can still call start()/stop() on the latest
  // instance without needing speechRecognition itself in their dependency arrays.
  const speechRecognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const speechOut = useSpeechSynthesis(serverTtsAvailable);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  // Schedules the next "restart listening" step of the hands-free loop. Debounced/guarded so a
  // device that keeps failing to listen (repeated "no-speech"/"error" cycles) can't spin forever:
  // once too many restarts happen in a short window, voice mode turns itself off with an
  // explanation rather than looping silently.
  const scheduleListenRestart = useCallback((delayMs: number) => {
    clearRestartTimer();
    restartTimerRef.current = window.setTimeout(() => {
      restartTimerRef.current = null;
      if (!voiceModeEnabledRef.current) return;
      // Never listen while the AI itself is speaking, or while a request is in flight - the mic
      // would otherwise pick up the AI's own voice or fire while nothing is ready to act on it.
      if (phaseRef.current === "speaking" || inFlightRef.current) return;

      const now = Date.now();
      restartTimestampsRef.current = restartTimestampsRef.current.filter(
        (t) => now - t < RAPID_RESTART_WINDOW_MS,
      );
      restartTimestampsRef.current.push(now);
      if (restartTimestampsRef.current.length > RAPID_RESTART_MAX) {
        voiceModeEnabledRef.current = false;
        setVoiceModeEnabled(false);
        setVoiceModeError(
          "Voice conversation mode turned itself off after the microphone kept restarting without success. Check the microphone and turn it back on.",
        );
        speechRecognitionRef.current?.stop();
        return;
      }

      speechRecognitionRef.current?.start();
    }, delayMs);
  }, [clearRestartTimer]);

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
        if (response.status === "safety_stop") safetyStoppedRef.current = true;

        inFlightRef.current = false;

        const restartIfVoiceMode = () => {
          if (voiceModeEnabledRef.current) scheduleListenRestart(RESTART_AFTER_SPEECH_MS);
        };

        const textToSpeak = response.spokenInstruction || response.instruction;
        if (textToSpeak) {
          speechOut.speak(textToSpeak, {
            onStart: () => setPhase("speaking"),
            onEnd: () => {
              if (phaseRef.current === "speaking") setPhase("watching");
              restartIfVoiceMode();
            },
            onError: () => {
              if (["speaking", "analyzing", "checking"].includes(phaseRef.current)) {
                setPhase("watching");
              }
              restartIfVoiceMode();
            },
          });
          if (!speechOut.enabled) {
            setPhase("watching");
            restartIfVoiceMode();
          }
        } else {
          setPhase("watching");
          restartIfVoiceMode();
        }
      } catch (err) {
        lastAnalyzedAtRef.current = Date.now();
        const message =
          err instanceof ApiError ? err.message : "Lost connection to the AI service. Check your network and try again.";
        setErrorMessage(message);
        setPhase("error");
        inFlightRef.current = false;
        if (voiceModeEnabledRef.current) scheduleListenRestart(RESTART_AFTER_ERROR_MS);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [videoRef, cameraActive, speechOut.speak, speechOut.enabled, scheduleListenRestart],
  );

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

  // The single source of truth for what happens after recognition stops. See ListeningEndReason
  // for what each reason means; "result" and "manual" never trigger a restart from here -
  // "result" is about to be processed (the restart for that turn is scheduled after the AI's
  // response finishes speaking, above), and "manual" means the user or code intentionally
  // stopped listening.
  const handleListeningEnd = useCallback(
    (reason: ListeningEndReason, errorCode?: string) => {
      if (phaseRef.current === "listening") setPhase("watching");
      if (!voiceModeEnabledRef.current) return;
      if (reason === "manual" || reason === "result") return;

      if (reason === "error") {
        if (errorCode === "not-allowed" || errorCode === "service-not-allowed") {
          voiceModeEnabledRef.current = false;
          setVoiceModeEnabled(false);
          setVoiceModeError("Microphone access is blocked. Allow microphone access, then turn Voice Conversation back on.");
          return;
        }
        scheduleListenRestart(RESTART_AFTER_ERROR_MS);
        return;
      }

      // "no-speech" - normal in hands-free mode (the mic just timed out waiting), restart soon.
      scheduleListenRestart(RESTART_AFTER_NO_SPEECH_MS);
    },
    [scheduleListenRestart],
  );

  const speechRecognition = useSpeechRecognition({
    onFinalResult: (finalText) => submitMessage(finalText, "voice"),
    onListeningStart: () => setPhase("listening"),
    onListeningEnd: handleListeningEnd,
  });

  useEffect(() => {
    speechRecognitionRef.current = { start: speechRecognition.start, stop: speechRecognition.stop };
  }, [speechRecognition.start, speechRecognition.stop]);

  useEffect(() => {
    voiceModeEnabledRef.current = voiceModeEnabled;
  }, [voiceModeEnabled]);

  // Turns hands-free conversation mode on/off. While on: user speech -> mic auto-stops (browser
  // default, non-continuous recognition) -> AI processes -> AI speaks -> ~300-700ms after speech
  // ends -> mic restarts automatically. Continues until this is called again (or a safety
  // condition above turns it off).
  const toggleVoiceMode = useCallback(() => {
    if (voiceModeEnabledRef.current) {
      voiceModeEnabledRef.current = false;
      setVoiceModeEnabled(false);
      clearRestartTimer();
      restartTimestampsRef.current = [];
      speechRecognitionRef.current?.stop();
      return;
    }

    voiceModeEnabledRef.current = true;
    setVoiceModeEnabled(true);
    setVoiceModeError(null);
    restartTimestampsRef.current = [];
    speechOut.unlock();
    if (phaseRef.current !== "speaking" && !inFlightRef.current) {
      speechRecognitionRef.current?.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearRestartTimer, speechOut.unlock]);

  const stopListening = useCallback(() => {
    if (voiceModeEnabledRef.current) {
      voiceModeEnabledRef.current = false;
      setVoiceModeEnabled(false);
      clearRestartTimer();
    }
    speechRecognitionRef.current?.stop();
  }, [clearRestartTimer]);

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
    voiceModeEnabledRef.current = false;
    setVoiceModeEnabled(false);
    setVoiceModeError(null);
    clearRestartTimer();
    restartTimestampsRef.current = [];
    speechOut.stop();
    speechRecognitionRef.current?.stop();
    safetyStoppedRef.current = false;
    inFlightRef.current = false;
    lastAnalyzedAtRef.current = 0;
    setErrorMessage(null);
    setSession(createSession());
    setPhase("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearRestartTimer]);

  useEffect(() => clearRestartTimer, [clearRestartTimer]);

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
    micStatus: speechRecognition.micStatus,
    startListening: speechRecognition.start,
    stopListening,
    voiceModeEnabled,
    toggleVoiceMode,
    voiceModeError,
    speechSupported: speechOut.supported,
    speechEnabled: speechOut.enabled,
    setSpeechEnabled: speechOut.setEnabled,
    speechRate: speechOut.rate,
    setSpeechRate: speechOut.setRate,
    speaking: speechOut.speaking,
    voiceStatus: speechOut.voiceStatus,
    voiceError: speechOut.lastError,
    engine: speechOut.engine,
    setEngine: speechOut.setEngine,
    serverTtsAvailable: speechOut.serverTtsAvailable,
    testVoice: speechOut.testVoice,
    testVoiceState: speechOut.testVoiceState,
    testVoiceError: speechOut.testVoiceError,
    selectedVoiceName: speechOut.selectedVoiceName,
    confirmVoiceHeard: speechOut.confirmVoiceHeard,
    replayInstruction: speechOut.replay,
    unlockVoice: speechOut.unlock,
    submitMessage,
    startNewSession,
  };
}

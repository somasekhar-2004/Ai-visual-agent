"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type RecognitionState = "idle" | "listening" | "processing";
/** For the "Microphone: READY / BLOCKED" diagnostic. "pending" until permission state is known. */
export type MicPermissionStatus = "pending" | "ready" | "blocked";
/**
 * Why recognition stopped, so a caller running a hands-free restart loop can decide what to do
 * next without re-deriving it from raw browser state:
 * - "result": a final transcript was delivered (recognition auto-stops after one, since
 *   continuous=false) - the caller is about to go process it, don't restart yet.
 * - "manual": stop() was called deliberately (no final result came through it).
 * - "no-speech": timed out waiting for speech - normal in hands-free mode, safe to restart.
 * - "error": any other browser/engine error.
 */
export type ListeningEndReason = "result" | "manual" | "no-speech" | "error";

export interface UseSpeechRecognitionResult {
  supported: boolean;
  state: RecognitionState;
  interimTranscript: string;
  micStatus: MicPermissionStatus;
  start: () => void;
  stop: () => void;
  /** Call once the app has finished handling a final transcript, to return to "idle". */
  finishProcessing: () => void;
}

function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function subscribeNever() {
  return () => {};
}

function getRecognitionSupported() {
  return getRecognitionCtor() !== null;
}

function getServerSnapshotFalse() {
  return false;
}

export interface SpeechRecognitionCallbacks {
  onFinalResult: (text: string) => void;
  /** Fired the moment the mic actually starts listening - useful for driving an app-wide status
   * indicator directly from the event rather than reacting to state later. */
  onListeningStart?: () => void;
  /** Fired exactly once per start()/stop cycle, with why it ended and (for "error") the raw
   * browser error code - e.g. "not-allowed", "audio-capture", "network". */
  onListeningEnd?: (reason: ListeningEndReason, errorCode?: string) => void;
}

const MIN_RESTART_INTERVAL_MS = 250;

/**
 * Wraps the browser SpeechRecognition API. Falls back gracefully (supported=false) so callers
 * can offer a text-input fallback when unavailable (e.g. Firefox, most desktop Safari).
 *
 * Hardened for a hands-free "keep listening after every response" loop: at most one live
 * recognition instance ever exists (a stray second instance is a well-documented source of
 * "already started" InvalidStateError crashes on iOS Safari), rapid repeated start() calls are
 * debounced, and onend always resolves to exactly one reason so a caller can implement its own
 * restart policy without guessing from raw event timing.
 */
export function useSpeechRecognition(callbacks: SpeechRecognitionCallbacks): UseSpeechRecognitionResult {
  // See the matching comment in useSpeechSynthesis - getServerSnapshot keeps server and
  // initial-hydration output consistent (`false`) while still picking up the real client value.
  const supported = useSyncExternalStore(subscribeNever, getRecognitionSupported, getServerSnapshotFalse);

  const [state, setState] = useState<RecognitionState>("idle");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [micStatus, setMicStatus] = useState<MicPermissionStatus>("pending");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const callbacksRef = useRef(callbacks);
  const manualStopRef = useRef(false);
  const hadFinalResultRef = useRef(false);
  const lastErrorCodeRef = useRef<string | null>(null);
  const startingRef = useRef(false);
  const lastStartAtRef = useRef(0);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Best-effort mic permission check via the Permissions API - not supported on every browser
  // (notably older Safari), in which case micStatus just stays "pending" until the first real
  // start()/onerror tells us for certain.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;
    let cancelled = false;
    let statusRef: PermissionStatus | null = null;

    const applyState = (state: PermissionState) => {
      if (cancelled) return;
      if (state === "granted") setMicStatus("ready");
      else if (state === "denied") setMicStatus("blocked");
      // "prompt" leaves micStatus at "pending" - permission hasn't been decided yet.
    };

    navigator.permissions
      .query({ name: "microphone" as PermissionName })
      .then((status) => {
        if (cancelled) return;
        statusRef = status;
        applyState(status.state);
        status.onchange = () => applyState(status.state);
      })
      .catch(() => {
        /* Permissions API doesn't support querying "microphone" on this browser - ignore. */
      });

    return () => {
      cancelled = true;
      if (statusRef) statusRef.onchange = null;
    };
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    if (state === "listening" || startingRef.current) return;

    const now = Date.now();
    if (now - lastStartAtRef.current < MIN_RESTART_INTERVAL_MS) return;
    lastStartAtRef.current = now;

    // Defensive cleanup: never let two recognition instances be alive at once.
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* already stopped - fine */
      }
      recognitionRef.current = null;
    }

    startingRef.current = true;
    manualStopRef.current = false;
    hadFinalResultRef.current = false;
    lastErrorCodeRef.current = null;

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      startingRef.current = false;
      setState("listening");
      setMicStatus("ready"); // actually listening is definitive proof mic access works
      callbacksRef.current.onListeningStart?.();
    };
    recognition.onresult = (event) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) final += transcript;
        else interim += transcript;
      }
      setInterimTranscript(interim);
      if (final.trim()) {
        hadFinalResultRef.current = true;
        setState("processing");
        callbacksRef.current.onFinalResult(final.trim());
      }
    };
    recognition.onerror = (event) => {
      // Don't fire onListeningEnd here - onend always fires right after any error and is the
      // single source of truth for "recognition has stopped" (avoids double-reporting the end
      // of one session, which would otherwise double-schedule a hands-free restart).
      lastErrorCodeRef.current = event.error;
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setMicStatus("blocked");
      }
    };
    recognition.onend = () => {
      startingRef.current = false;
      setInterimTranscript("");
      setState((s) => (s === "listening" || s === "processing" ? "idle" : s));

      const errorCode = lastErrorCodeRef.current;
      lastErrorCodeRef.current = null;
      let reason: ListeningEndReason;
      if (hadFinalResultRef.current) reason = "result";
      else if (manualStopRef.current) reason = "manual";
      else if (errorCode === "no-speech") reason = "no-speech";
      else reason = "error";

      callbacksRef.current.onListeningEnd?.(reason, errorCode ?? undefined);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      // Starting immediately after abort() can throw synchronously on some browsers if called
      // too soon - report it the same way any other failure to start would be reported.
      startingRef.current = false;
      recognitionRef.current = null;
      setState("idle");
      callbacksRef.current.onListeningEnd?.("error", "start-failed");
    }
  }, [state]);

  const stop = useCallback(() => {
    manualStopRef.current = true;
    recognitionRef.current?.stop();
  }, []);

  const finishProcessing = useCallback(() => setState("idle"), []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return { supported, state, interimTranscript, micStatus, start, stop, finishProcessing };
}

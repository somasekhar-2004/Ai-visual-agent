"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type RecognitionState = "idle" | "listening" | "processing";
/** For the "Microphone: READY / BLOCKED" diagnostic. "pending" until permission state is known. */
export type MicPermissionStatus = "pending" | "ready" | "blocked";

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
  /** Fired the moment the mic actually starts/stops listening - useful for driving an
   * app-wide status indicator directly from the event rather than reacting to state later. */
  onListeningStart?: () => void;
  onListeningEnd?: () => void;
}

/** Wraps the browser SpeechRecognition API. Falls back gracefully (supported=false) so
 * callers can offer a text-input fallback when unavailable (e.g. Firefox, most desktop Safari). */
export function useSpeechRecognition(callbacks: SpeechRecognitionCallbacks): UseSpeechRecognitionResult {
  // See the matching comment in useSpeechSynthesis - getServerSnapshot keeps server and
  // initial-hydration output consistent (`false`) while still picking up the real client value.
  const supported = useSyncExternalStore(subscribeNever, getRecognitionSupported, getServerSnapshotFalse);

  const [state, setState] = useState<RecognitionState>("idle");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [micStatus, setMicStatus] = useState<MicPermissionStatus>("pending");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const callbacksRef = useRef(callbacks);

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
    if (!Ctor || state === "listening") return;

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
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
        setState("processing");
        callbacksRef.current.onFinalResult(final.trim());
      }
    };
    recognition.onerror = (event) => {
      setState("idle");
      setInterimTranscript("");
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setMicStatus("blocked");
      }
      callbacksRef.current.onListeningEnd?.();
    };
    recognition.onend = () => {
      // Fires shortly after a final result too (continuous=false stops recognition
      // automatically), so this is also what clears the transient "processing" state -
      // no separate external call needed.
      setInterimTranscript("");
      setState((s) => (s === "listening" || s === "processing" ? "idle" : s));
      callbacksRef.current.onListeningEnd?.();
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [state]);

  const stop = useCallback(() => {
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

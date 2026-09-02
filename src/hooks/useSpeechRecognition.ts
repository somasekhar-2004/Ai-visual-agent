"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type RecognitionState = "idle" | "listening" | "processing";

export interface UseSpeechRecognitionResult {
  supported: boolean;
  state: RecognitionState;
  interimTranscript: string;
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
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

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
    recognition.onerror = () => {
      setState("idle");
      setInterimTranscript("");
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

  return { supported, state, interimTranscript, start, stop, finishProcessing };
}

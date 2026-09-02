"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

function subscribeNever() {
  return () => {};
}

function getSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function getServerSnapshotFalse() {
  return false;
}

export interface UseSpeechSynthesisResult {
  supported: boolean;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  rate: number;
  setRate: (rate: number) => void;
  speaking: boolean;
  speak: (text: string) => void;
  replay: () => void;
  stop: () => void;
}

/** Thin wrapper around window.speechSynthesis. Keeps utterances short - callers should pass
 * the app's spokenInstruction text, never long technical paragraphs. */
export function useSpeechSynthesis(): UseSpeechSynthesisResult {
  // useSyncExternalStore's getServerSnapshot lets the server (and the client's initial
  // hydration pass) render `false` consistently, then React swaps in the real client value
  // right after - the React-sanctioned way to read browser-only capability flags without a
  // hydration mismatch or a setState-in-effect.
  const supported = useSyncExternalStore(subscribeNever, getSpeechSynthesisSupported, getServerSnapshotFalse);

  const [enabled, setEnabled] = useState(true);
  const [rate, setRate] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const lastTextRef = useRef("");
  const rateRef = useRef(rate);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !text) return;
      lastTextRef.current = text;
      if (!enabled) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rateRef.current;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [supported, enabled],
  );

  const replay = useCallback(() => {
    if (lastTextRef.current) speak(lastTextRef.current);
  }, [speak]);

  // Toggling voice off should immediately cancel any in-progress speech. This is done as part
  // of the toggle action itself (not a reactive effect on `enabled`) so it stays an explicit
  // event rather than a setState-in-effect side effect.
  const setEnabledAndSync = useCallback(
    (value: boolean) => {
      setEnabled(value);
      if (!value) stop();
    },
    [stop],
  );

  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  return {
    supported,
    enabled,
    setEnabled: setEnabledAndSync,
    rate,
    setRate,
    speaking,
    speak,
    replay,
    stop,
  };
}

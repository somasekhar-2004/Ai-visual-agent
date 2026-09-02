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

export type VoiceEngineStatus = "pending" | "ready" | "failed";

export interface SpeakCallbacks {
  /** Fires exactly when the browser actually begins playing the utterance - never earlier. */
  onStart?: () => void;
  onEnd?: () => void;
  /** Fires with a human-readable reason whenever speech fails to start or errors out. */
  onError?: (message: string) => void;
}

export interface UseSpeechSynthesisResult {
  supported: boolean;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  rate: number;
  setRate: (rate: number) => void;
  /** True only between a confirmed onstart and onend/onerror for the current utterance. */
  speaking: boolean;
  /** For the "Voice: READY / FAILED" diagnostic. "pending" until the first real attempt settles. */
  voiceStatus: VoiceEngineStatus;
  lastError: string | null;
  /**
   * Must be called synchronously from within a real user-gesture event handler (e.g. the
   * "Enable camera" button's onClick, before any `await`) - iOS Safari only allows
   * speechSynthesis to actually produce audio if the very first call in the page's lifetime
   * happens inside a user gesture's call stack. Safe to call more than once; it only actually
   * speaks until the first success.
   */
  unlock: () => void;
  speak: (text: string, callbacks?: SpeakCallbacks) => void;
  replay: () => void;
  stop: () => void;
}

function describeSpeechError(code: string | undefined): string {
  switch (code) {
    case "audio-busy":
      return "Audio output is busy on this device.";
    case "audio-hardware":
      return "No audio output hardware is available.";
    case "network":
      return "A network error interrupted voice output.";
    case "synthesis-unavailable":
    case "synthesis-failed":
      return "This browser could not synthesize speech.";
    case "language-unavailable":
      return "No voice is available for the selected language.";
    case "voice-unavailable":
      return "The selected voice is unavailable.";
    case "text-too-long":
      return "The instruction was too long to speak.";
    case "invalid-argument":
      return "Invalid speech parameters.";
    case "not-allowed":
      return "Voice output was blocked by the browser. Tap the speaker icon to allow it.";
    default:
      return code ? `Voice output failed (${code}).` : "Voice output failed for an unknown reason.";
  }
}

function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const isEnglish = (v: SpeechSynthesisVoice) => v.lang?.toLowerCase().startsWith("en");
  return (
    voices.find((v) => isEnglish(v) && v.default) ??
    voices.find((v) => isEnglish(v) && v.localService) ??
    voices.find(isEnglish) ??
    voices.find((v) => v.default) ??
    voices[0] ??
    null
  );
}

interface SpeakInternalOptions extends SpeakCallbacks {
  /** true = call speechSynthesis.speak() immediately, in the same tick (required for the
   * gesture-triggered unlock call); false = defer one tick after cancel(), which sidesteps a
   * well-known Chrome/WebKit race where speak() called right after cancel() is silently dropped. */
  sync: boolean;
}

/**
 * Thin wrapper around window.speechSynthesis, hardened for iOS Safari/Chrome quirks:
 * - speechSynthesis only produces audio if unlocked by a real user gesture (see `unlock`).
 * - getVoices() is often empty until the async `voiceschanged` event fires.
 * - speak() called without a preceding cancel() can get silently stuck/queued.
 * - onstart is not guaranteed to fire when playback is blocked, so a start-timeout is used to
 *   turn "nothing happened" into a reported error instead of a permanently stuck "Speaking…".
 */
export function useSpeechSynthesis(): UseSpeechSynthesisResult {
  // useSyncExternalStore's getServerSnapshot lets the server (and the client's initial
  // hydration pass) render `false` consistently, then React swaps in the real client value
  // right after - the React-sanctioned way to read browser-only capability flags without a
  // hydration mismatch or a setState-in-effect.
  const supported = useSyncExternalStore(subscribeNever, getSpeechSynthesisSupported, getServerSnapshotFalse);

  const [enabled, setEnabled] = useState(true);
  const [rate, setRate] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceEngineStatus>("pending");
  const [lastError, setLastError] = useState<string | null>(null);

  const lastTextRef = useRef("");
  const rateRef = useRef(rate);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const unlockStateRef = useRef<"idle" | "success">("idle");

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  // Populate the voice list as soon as it's available and keep it current - on many browsers
  // (including iOS Safari) getVoices() returns [] until this event fires at least once.
  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      voicesRef.current = synth.getVoices();
    };
    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);
    return () => synth.removeEventListener("voiceschanged", loadVoices);
  }, [supported]);

  const pickVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
    return pickEnglishVoice(voices);
  }, []);

  const speakInternal = useCallback(
    (text: string, opts: SpeakInternalOptions) => {
      const synth = window.speechSynthesis;
      // Required before every speak() call - without it, a previous stuck/queued utterance
      // (a well-documented iOS Safari failure mode) silently blocks this one forever.
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rateRef.current;
      const voice = pickVoice();
      if (voice) utterance.voice = voice;

      let started = false;
      let settled = false;

      const timeoutId = window.setTimeout(() => {
        if (!started && !settled) {
          settled = true;
          opts.onError?.("Voice output did not start. Check the device isn't muted/silent and try again.");
        }
      }, 2500);

      const clearTimer = () => window.clearTimeout(timeoutId);

      utterance.onstart = () => {
        started = true;
        settled = true;
        clearTimer();
        opts.onStart?.();
      };
      utterance.onend = () => {
        clearTimer();
        if (!started) {
          if (!settled) {
            settled = true;
            opts.onError?.("Voice output ended before it started playing.");
          }
          return;
        }
        opts.onEnd?.();
      };
      utterance.onerror = (event) => {
        clearTimer();
        if (settled) return;
        settled = true;
        // These fire whenever *we* intentionally interrupt a previous utterance (e.g. cancel()
        // from a new speak() call) - that's expected traffic, not a user-facing failure.
        if (event.error === "canceled" || event.error === "interrupted") {
          if (started) opts.onEnd?.();
          return;
        }
        opts.onError?.(describeSpeechError(event.error));
      };

      const fire = () => {
        try {
          synth.speak(utterance);
        } catch (err) {
          if (!settled) {
            settled = true;
            clearTimer();
            opts.onError?.(err instanceof Error ? err.message : "Failed to start speech synthesis.");
          }
        }
      };

      if (opts.sync) fire();
      else window.setTimeout(fire, 0);
    },
    [pickVoice],
  );

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string, callbacks?: SpeakCallbacks) => {
      if (!text) return;
      if (!supported) {
        const message = "Speech synthesis is not supported in this browser.";
        setVoiceStatus("failed");
        setLastError(message);
        callbacks?.onError?.(message);
        return;
      }

      lastTextRef.current = text;
      if (!enabled) return; // muted is an intentional user choice, not a failure - stay silent

      speakInternal(text, {
        sync: false,
        onStart: () => {
          setSpeaking(true);
          setVoiceStatus("ready");
          setLastError(null);
          callbacks?.onStart?.();
        },
        onEnd: () => {
          setSpeaking(false);
          callbacks?.onEnd?.();
        },
        onError: (message) => {
          setSpeaking(false);
          setVoiceStatus("failed");
          setLastError(message);
          callbacks?.onError?.(message);
        },
      });
    },
    [supported, enabled, speakInternal],
  );

  const replay = useCallback(() => {
    if (lastTextRef.current) speak(lastTextRef.current);
  }, [speak]);

  const unlock = useCallback(() => {
    if (unlockStateRef.current === "success") return;
    if (!supported) {
      setVoiceStatus("failed");
      setLastError("Speech synthesis is not supported in this browser.");
      return;
    }
    setVoiceStatus("pending");
    speakInternal("Voice ready.", {
      sync: true,
      onStart: () => {
        unlockStateRef.current = "success";
        setVoiceStatus("ready");
        setLastError(null);
      },
      onEnd: () => {
        /* nothing further to do - onStart already confirmed success */
      },
      onError: (message) => {
        setVoiceStatus("failed");
        setLastError(message);
      },
    });
  }, [supported, speakInternal]);

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
    voiceStatus,
    lastError,
    unlock,
    speak,
    replay,
    stop,
  };
}

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

// A ~50ms silent WAV, used purely to "unlock" <audio> element playback on iOS Safari: calling
// .play() on a real (if silent) media source synchronously inside a user gesture registers user
// activation for this element, so later programmatic .play() calls from async code (the
// server-TTS fallback, triggered after a network round trip) are allowed to actually play audio.
const SILENT_WAV_DATA_URL =
  "data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YSADAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

/**
 * "READY" is only ever true once a user has personally confirmed hearing a test phrase (see
 * testVoice/confirmVoiceHeard) - `onstart` firing is necessary but NOT sufficient proof of
 * audible output (see the module doc comment below for why), so it alone never earns "ready".
 * "unconfirmed": at least one utterance's onstart has fired, but no human has confirmed hearing
 * it yet.
 */
export type VoiceEngineStatus = "pending" | "unconfirmed" | "ready" | "failed";
export type SpeechEngine = "webspeech" | "server";
export type TestVoiceState = "idle" | "testing" | "awaiting-confirmation" | "confirmed" | "declined" | "error";

export interface SpeakCallbacks {
  /** Fires exactly when the browser/audio element actually begins playing - never earlier. */
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
  /** For the "Voice: READY / FAILED" diagnostic. See VoiceEngineStatus doc comment. */
  voiceStatus: VoiceEngineStatus;
  lastError: string | null;

  /** Which engine speak() currently routes through. */
  engine: SpeechEngine;
  /** Manually force an engine (e.g. a "Use server voice" toggle in settings). */
  setEngine: (engine: SpeechEngine) => void;
  /** Whether /api/tts is configured server-side at all (from GEMINI_API_KEY) - if false, the
   * server engine can never be used regardless of what setEngine is called with. */
  serverTtsAvailable: boolean;

  /**
   * Speaks a short fixed test phrase directly - call this from a real user-gesture click
   * handler (e.g. a "Test Voice" button). Distinct from unlock(): this is the user-facing,
   * re-testable check that reports exactly what happened (selected voice, whether onstart
   * fired, exact error) and, once onstart fires, waits for confirmVoiceHeard().
   */
  testVoice: () => void;
  testVoiceState: TestVoiceState;
  testVoiceError: string | null;
  /** Name of the voice used for the current/last webspeech attempt, for display. */
  selectedVoiceName: string | null;
  /** Call after testVoice() reaches "awaiting-confirmation", with whether the user actually
   * heard the test phrase. This is what actually sets voiceStatus to "ready" (or "failed"). */
  confirmVoiceHeard: (heard: boolean) => void;

  /**
   * Must be called synchronously from within a real user-gesture event handler (e.g. the
   * "Enable camera" button's onClick, before any `await`) - both speechSynthesis and <audio>
   * playback require a user gesture at some point in the page's lifetime before iOS Safari
   * will allow real audio output. Safe to call more than once.
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
   * gesture-triggered unlock/test calls); false = defer one tick after cancel(), which
   * sidesteps a well-known Chrome/WebKit race where speak() called right after cancel() is
   * silently dropped. */
  sync: boolean;
}

/**
 * Voice output, hardened for iOS Safari/Chrome quirks - and honest about what it can't fix.
 *
 * THE CORE IOS PROBLEM: window.speechSynthesis plays through the "ambient" audio session
 * category on iOS. That category is silenced by the hardware ring/silent switch, and there is
 * no Web API to detect the switch's position or override the category from a web page - this is
 * a hard platform limitation, not a bug in this code. Critically, `onstart`/`onend` still fire
 * completely normally even when the switch silences all actual output, so "no error was thrown"
 * is never proof that anything was heard. That's why voiceStatus only reaches "ready" via an
 * explicit human confirmation (testVoice + confirmVoiceHeard), and why a server-rendered audio
 * fallback exists at all: real <audio> element playback uses the "playback" category instead,
 * which is NOT silenced by the switch - the same reason every production voice-assistant web UI
 * (not just this one) renders speech server-side and plays it back as a media file rather than
 * relying on speechSynthesis on iOS.
 *
 * Other hardening:
 * - getVoices() is often empty until the async `voiceschanged` event fires.
 * - speak() called without a preceding cancel() can get silently stuck/queued.
 * - onstart is not guaranteed to fire when playback is blocked, so a start-timeout is used to
 *   turn "nothing happened" into a reported error instead of a permanently stuck "Speaking…".
 */
export function useSpeechSynthesis(serverTtsAvailable = false): UseSpeechSynthesisResult {
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
  const [engine, setEngineState] = useState<SpeechEngine>("webspeech");
  const [testVoiceState, setTestVoiceState] = useState<TestVoiceState>("idle");
  const [testVoiceError, setTestVoiceError] = useState<string | null>(null);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(null);

  const lastTextRef = useRef("");
  const rateRef = useRef(rate);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const unlockStateRef = useRef<"idle" | "success">("idle");
  const engineRef = useRef<SpeechEngine>("webspeech");
  const serverTtsAvailableRef = useRef(serverTtsAvailable);
  const consecutiveWebSpeechFailuresRef = useRef(0);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);
  const currentObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    serverTtsAvailableRef.current = serverTtsAvailable;
  }, [serverTtsAvailable]);

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

  const getAudioEl = useCallback((): HTMLAudioElement => {
    if (!audioElRef.current) {
      const el = new Audio();
      el.preload = "auto";
      audioElRef.current = el;
    }
    return audioElRef.current;
  }, []);

  const speakInternal = useCallback(
    (text: string, opts: SpeakInternalOptions) => {
      const synth = window.speechSynthesis;
      // Only cancel if something is actually speaking/queued - NOT unconditionally on every call.
      // iOS/macOS Safari has a well-documented WebKit bug where calling cancel() while the
      // synthesizer is already idle leaves it in a state where the *next* speak() call silently
      // produces no audio (onstart may still fire, so nothing here reports it as an error) -
      // this exactly matches "voice worked on the first instruction, then silently stopped on
      // every one after" from real iPhone testing: every call after the first one calls cancel()
      // on an idle engine (the previous utterance already finished), poisoning the one after it.
      // Cancelling is still necessary - and still done - when a previous utterance is genuinely
      // still speaking/pending, to interrupt it for a new one.
      if (synth.speaking || synth.pending) synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rateRef.current;
      utterance.volume = 1;
      utterance.pitch = 1;
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

  const speakServerTts = useCallback(
    (text: string, opts: SpeakCallbacks) => {
      let settled = false;
      const finishError = (message: string) => {
        if (settled) return;
        settled = true;
        opts.onError?.(message);
      };

      const el = getAudioEl();
      if (currentObjectUrlRef.current) {
        URL.revokeObjectURL(currentObjectUrlRef.current);
        currentObjectUrlRef.current = null;
      }
      el.pause();
      el.onplay = null;
      el.onended = null;
      el.onerror = null;
      try {
        el.currentTime = 0;
      } catch {
        /* not seekable yet - fine to ignore */
      }

      const timeoutId = window.setTimeout(() => {
        finishError("Server voice did not start playing within a reasonable time.");
      }, 15000);

      void (async () => {
        let res: Response;
        try {
          res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
        } catch {
          window.clearTimeout(timeoutId);
          finishError("Could not reach the server voice service. Check your connection.");
          return;
        }

        if (!res.ok) {
          window.clearTimeout(timeoutId);
          let message = `Server voice failed (HTTP ${res.status}).`;
          try {
            const data = (await res.json()) as { error?: string };
            if (data?.error) message = data.error;
          } catch {
            /* body wasn't JSON - keep the generic message */
          }
          finishError(message);
          return;
        }

        if (settled) {
          window.clearTimeout(timeoutId);
          return; // a newer call already superseded this one
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        currentObjectUrlRef.current = url;

        el.onplay = () => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          opts.onStart?.();
        };
        el.onended = () => {
          window.clearTimeout(timeoutId);
          if (!settled) {
            settled = true;
            opts.onError?.("Server voice ended before it started playing.");
            return;
          }
          opts.onEnd?.();
        };
        el.onerror = () => {
          window.clearTimeout(timeoutId);
          if (settled) return;
          settled = true;
          opts.onError?.("Server voice audio could not be played.");
        };

        el.src = url;
        try {
          await el.play();
        } catch (err) {
          window.clearTimeout(timeoutId);
          finishError(
            err instanceof Error
              ? `Server voice playback was blocked: ${err.message}`
              : "Server voice playback was blocked.",
          );
        }
      })();
    },
    [getAudioEl],
  );

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel();
    audioElRef.current?.pause();
    setSpeaking(false);
  }, [supported]);

  // Separated out from `speak` (rather than having speak call itself after switching engines)
  // so neither function is ever self-referential - a self-call from inside a useCallback body
  // is flagged by this project's stricter react-hooks lint rules even though it works fine at
  // runtime, since the callback is only ever invoked after its own const binding is settled.
  const runServerSpeak = useCallback(
    (text: string, callbacks?: SpeakCallbacks) => {
      if (!serverTtsAvailableRef.current) {
        const message = "Server voice is not configured on this deployment.";
        setVoiceStatus("failed");
        setLastError(message);
        callbacks?.onError?.(message);
        return;
      }
      speakServerTts(text, {
        onStart: () => {
          setSpeaking(true);
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
    [speakServerTts],
  );

  const speak = useCallback(
    (text: string, callbacks?: SpeakCallbacks) => {
      if (!text) return;
      lastTextRef.current = text;
      if (!enabled) return; // muted is an intentional user choice, not a failure - stay silent

      if (engineRef.current === "server") {
        runServerSpeak(text, callbacks);
        return;
      }

      if (!supported) {
        if (serverTtsAvailableRef.current) {
          engineRef.current = "server";
          setEngineState("server");
          runServerSpeak(text, callbacks);
          return;
        }
        const message = "Speech synthesis is not supported in this browser.";
        setVoiceStatus("failed");
        setLastError(message);
        callbacks?.onError?.(message);
        return;
      }

      speakInternal(text, {
        sync: false,
        onStart: () => {
          consecutiveWebSpeechFailuresRef.current = 0;
          setSpeaking(true);
          setVoiceStatus((s) => (s === "ready" ? "ready" : "unconfirmed"));
          setLastError(null);
          callbacks?.onStart?.();
        },
        onEnd: () => {
          setSpeaking(false);
          callbacks?.onEnd?.();
        },
        onError: (message) => {
          setSpeaking(false);
          consecutiveWebSpeechFailuresRef.current += 1;
          // Web speech has now failed repeatedly during real usage - stop trusting it for the
          // rest of the session and retry this same utterance through the server engine instead
          // of just reporting failure, if that's available.
          if (consecutiveWebSpeechFailuresRef.current >= 2 && serverTtsAvailableRef.current) {
            engineRef.current = "server";
            setEngineState("server");
            setLastError(null);
            runServerSpeak(text, callbacks);
            return;
          }
          setVoiceStatus("failed");
          setLastError(message);
          callbacks?.onError?.(message);
        },
      });
    },
    [enabled, supported, speakInternal, runServerSpeak],
  );

  const replay = useCallback(() => {
    if (lastTextRef.current) speak(lastTextRef.current);
  }, [speak]);

  const unlock = useCallback(() => {
    // Prime <audio> element playback for the server-TTS path - cheap, safe to attempt every
    // time, and idempotent after the first success.
    if (!audioUnlockedRef.current) {
      try {
        const el = getAudioEl();
        el.src = SILENT_WAV_DATA_URL;
        const playResult = el.play();
        if (playResult && typeof playResult.then === "function") {
          playResult.then(() => {
            audioUnlockedRef.current = true;
          }).catch(() => {
            /* best effort - a real server-TTS play() attempt later will report its own error */
          });
        } else {
          audioUnlockedRef.current = true;
        }
      } catch {
        /* best effort */
      }
    }

    if (unlockStateRef.current === "success" || !supported) return;
    speakInternal("Voice ready.", {
      sync: true,
      onStart: () => {
        unlockStateRef.current = "success";
        setVoiceStatus((s) => (s === "ready" ? "ready" : "unconfirmed"));
      },
      onEnd: () => {
        /* nothing further to do here - testVoice is the definitive, user-confirmed check */
      },
      onError: (message) => {
        // Not a user-facing failure by itself (this is a silent background priming attempt,
        // not something the user asked to test) - just remember it in case testVoice never runs.
        setLastError(message);
      },
    });
  }, [supported, speakInternal, getAudioEl]);

  const testVoice = useCallback(() => {
    setTestVoiceError(null);

    if (engineRef.current === "server") {
      if (!serverTtsAvailableRef.current) {
        setTestVoiceState("error");
        setTestVoiceError("Server voice is not configured on this deployment.");
        return;
      }
      setTestVoiceState("testing");
      setSelectedVoiceName("Server voice (Gemini)");
      speakServerTts("Voice test successful.", {
        onStart: () => setTestVoiceState("awaiting-confirmation"),
        onEnd: () => {},
        onError: (message) => {
          setTestVoiceState("error");
          setTestVoiceError(message);
        },
      });
      return;
    }

    if (!supported) {
      setTestVoiceState("error");
      setTestVoiceError("Speech synthesis is not supported in this browser.");
      return;
    }

    setTestVoiceState("testing");
    const voice = pickVoice();
    setSelectedVoiceName(voice?.name ?? "Default system voice");
    speakInternal("Voice test successful.", {
      sync: true, // must run synchronously inside the Test Voice button's click handler
      onStart: () => {
        unlockStateRef.current = "success";
        setTestVoiceState("awaiting-confirmation");
      },
      onEnd: () => {},
      onError: (message) => {
        setTestVoiceState("error");
        setTestVoiceError(message);
      },
    });
  }, [supported, pickVoice, speakInternal, speakServerTts]);

  const confirmVoiceHeard = useCallback((heard: boolean) => {
    if (heard) {
      setTestVoiceState("confirmed");
      setVoiceStatus("ready");
      setLastError(null);
      return;
    }

    setTestVoiceState("declined");
    setVoiceStatus("failed");
    const message =
      engineRef.current === "server"
        ? "Server voice played but wasn't heard - check the device's volume and any connected Bluetooth/output device."
        : "The test phrase played (onstart fired) but wasn't heard. This usually means the iPhone's side mute switch is on - Safari's speech engine is silenced by it even though nothing errors. Toggling the switch off usually fixes it.";
    setLastError(message);

    // Proactively switch to the server engine so the *next* attempt has a real chance of being
    // heard, rather than making the user find a manual toggle after already telling us it failed.
    if (engineRef.current === "webspeech" && serverTtsAvailableRef.current) {
      engineRef.current = "server";
      setEngineState("server");
    }
  }, []);

  const setEngine = useCallback((next: SpeechEngine) => {
    engineRef.current = next;
    setEngineState(next);
    // Switching engines invalidates any previous confirmation - the new engine hasn't been
    // proven audible yet.
    setTestVoiceState("idle");
    setTestVoiceError(null);
    setVoiceStatus("pending");
    setLastError(null);
  }, []);

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
      audioElRef.current?.pause();
      if (currentObjectUrlRef.current) URL.revokeObjectURL(currentObjectUrlRef.current);
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
    engine,
    setEngine,
    serverTtsAvailable,
    testVoice,
    testVoiceState,
    testVoiceError,
    selectedVoiceName,
    confirmVoiceHeard,
    unlock,
    speak,
    replay,
    stop,
  };
}

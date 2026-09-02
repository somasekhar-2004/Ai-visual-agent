"use client";

import { useState } from "react";
import type { RecognitionState } from "@/hooks/useSpeechRecognition";

interface VoiceInputProps {
  voiceSupported: boolean;
  voiceState: RecognitionState;
  interimTranscript: string;
  disabled: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onSubmitText: (text: string) => void;
}

export function VoiceInput({
  voiceSupported,
  voiceState,
  interimTranscript,
  disabled,
  onStartListening,
  onStopListening,
  onSubmitText,
}: VoiceInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSubmitText(text);
    setText("");
  };

  const handleMicClick = () => {
    if (voiceState === "listening") onStopListening();
    else onStartListening();
  };

  return (
    <div className="flex flex-col gap-2">
      {interimTranscript && (
        <p className="truncate px-1 text-xs italic text-neutral-500">&quot;{interimTranscript}&quot;</p>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {voiceSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            disabled={disabled && voiceState === "idle"}
            aria-label={voiceState === "listening" ? "Stop listening" : "Start voice input"}
            className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition disabled:opacity-40 ${
              voiceState === "listening"
                ? "bg-fuchsia-500 text-white"
                : voiceState === "processing"
                  ? "bg-amber-400 text-neutral-950"
                  : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
            }`}
          >
            {voiceState === "listening" && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-500 opacity-50" />
            )}
            <svg viewBox="0 0 24 24" fill="currentColor" className="relative h-5 w-5">
              <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
              <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.07A7 7 0 0 0 19 11Z" />
            </svg>
          </button>
        )}

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={voiceSupported ? "Or type your question…" : "Type your question…"}
          disabled={disabled}
          className="min-w-0 flex-1 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-cyan-400 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={disabled || !text.trim()}
          aria-label="Send"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-neutral-950 transition hover:bg-cyan-400 disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M3.4 20.6 21 12 3.4 3.4 3 10l12 2-12 2 .4 6.6Z" />
          </svg>
        </button>
      </form>
    </div>
  );
}

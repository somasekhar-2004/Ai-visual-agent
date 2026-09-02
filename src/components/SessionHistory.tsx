"use client";

import { useState } from "react";
import type { TroubleshootingSession } from "@/lib/session/types";

interface HistoryEntry {
  id: string;
  timestamp: number;
  role: "user" | "assistant" | "observation";
  text: string;
}

function buildTimeline(session: TroubleshootingSession): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  for (const r of session.userResponses) {
    entries.push({ id: r.id, timestamp: r.timestamp, role: "user", text: r.text });
  }
  for (const i of session.previousInstructions) {
    entries.push({ id: i.id, timestamp: i.timestamp, role: "assistant", text: i.text });
  }
  for (const o of session.observations) {
    entries.push({ id: o.id, timestamp: o.timestamp, role: "observation", text: o.text });
  }
  return entries.sort((a, b) => a.timestamp - b.timestamp);
}

const ROLE_LABEL: Record<HistoryEntry["role"], string> = {
  user: "You",
  assistant: "AI",
  observation: "Observed",
};

const ROLE_STYLE: Record<HistoryEntry["role"], string> = {
  user: "text-neutral-200",
  assistant: "text-cyan-300",
  observation: "text-neutral-500 italic",
};

export function SessionHistory({ session }: { session: TroubleshootingSession }) {
  const [open, setOpen] = useState(false);
  const timeline = buildTimeline(session);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Session history {timeline.length > 0 && `(${timeline.length})`}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`h-4 w-4 text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="max-h-64 overflow-y-auto border-t border-neutral-800 px-4 py-3">
          {timeline.length === 0 ? (
            <p className="text-xs text-neutral-500">Nothing yet. Ask a question to get started.</p>
          ) : (
            <ol className="space-y-2.5">
              {timeline.map((entry) => (
                <li key={entry.id} className="text-xs leading-relaxed">
                  <span className={`mr-1.5 font-semibold ${ROLE_STYLE[entry.role]}`}>{ROLE_LABEL[entry.role]}:</span>
                  <span className="text-neutral-300">{entry.text}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Persistent, unmissable notice that the app is running on the scripted mock vision provider -
 * nothing it says is based on real analysis of the camera feed. Shown for the whole session
 * whenever no real vision provider is configured, not just in the first message, since a
 * banner that scrolls away after one reply is exactly how "demo" quietly turns into "real" in
 * a user's mind.
 */
export function DemoModeBanner() {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-950/40 px-3.5 py-2.5 text-amber-100">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mt-0.5 h-4 w-4 shrink-0 text-amber-400">
        <path d="M12 9v4m0 4h.01M4 6h16v12H4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-xs leading-relaxed">
        <span className="font-semibold">DEMO MODE.</span> No real vision provider is configured - highlighted
        components and instructions are a scripted walkthrough, not analysis of your actual camera feed. Set
        <code className="mx-1 rounded bg-black/30 px-1 py-0.5 text-[11px]">VISION_PROVIDER=anthropic</code>
        and <code className="mx-1 rounded bg-black/30 px-1 py-0.5 text-[11px]">VISION_API_KEY</code> for real
        diagnostics.
      </p>
    </div>
  );
}

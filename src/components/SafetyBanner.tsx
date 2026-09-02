export function SafetyBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-950/80 p-4 text-red-100 shadow-lg">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="mt-0.5 h-6 w-6 shrink-0 text-red-400"
      >
        <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      </svg>
      <div>
        <p className="text-sm font-semibold text-red-200">Safety stop</p>
        <p className="mt-0.5 text-sm leading-relaxed text-red-100/90">{message}</p>
      </div>
    </div>
  );
}

# AI Visual Expert

A live AI technician for low-voltage electronics. Point your camera at a breadboard, PCB,
Arduino/ESP32 setup, or wiring, ask what's wrong, and the app watches the live feed,
highlights the exact wire/component to check directly on top of the video, and talks you
through it one step at a time — watching for you to make each change before moving on.

No repeated photo uploads: the camera stays on for the whole session, and the app decides
locally when a frame is worth sending to the AI (a question, a "done", or the scene settling
after movement), so you never have to re-take a picture yourself.

## Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. Allow camera access when prompted, point it at some
electronics, and type (or say) something like *"my circuit isn't turning on"*.

By default the app runs on a **mock AI provider** — no API key required — so you can try the
whole camera → overlay → voice → verify loop immediately. See [Mock mode](#mock-mode) below.

### Using it from a phone

`getUserMedia` (camera access) requires a secure context. `localhost` on the same machine is
fine; from a phone on your network you'll need HTTPS, e.g. run the dev server through a
tunnel (`npx ngrok http 3000`, Cloudflare Tunnel, etc.) or deploy it.

Cloudflare quick tunnels (`cloudflared tunnel --url http://localhost:3000`) work out of the box
— `next.config.ts` allowlists `*.trycloudflare.com` for `next dev`'s cross-origin dev-resource
protection (`allowedDevOrigins`), which otherwise 403s the HMR websocket and, on some browsers,
the app's own JS through a tunnel, leaving the page unhydrated. Using a different tunnel
provider or a fixed hostname? Set `NEXT_DEV_ALLOWED_ORIGINS=your-tunnel-host.example.com` (comma
-separated for multiple) before running `npm run dev`.

## What's implemented (V1)

- **Live camera** — `getUserMedia` with front/rear switching (rear preferred on mobile),
  pause/resume, and permission/error handling. The stream stays open for the whole session.
- **Smart frame sampling** — frames are only captured/sent to the AI when the user asks a
  question, says "done", or a lightweight client-side pixel-diff sampler
  (`src/lib/changeDetection.ts`) detects the scene moved and then settled. A cooldown prevents
  request flooding, and only one AI request is ever in flight at a time.
- **Modular vision layer** (`src/lib/vision/`) — a `VisionProvider` interface with a
  `MockVisionProvider` (scripted, deterministic, free), a `GeminiVisionProvider` (real multimodal
  vision via Gemini's native `responseSchema`, the default real provider - see
  [Switching to a real vision model](#switching-to-a-real-vision-model)), and an
  `AnthropicVisionProvider` (real vision via a forced structured tool-call), selected server-side
  by `VISION_PROVIDER`/whichever API key is present.
- **Live overlays** — a canvas layer above the `<video>` draws boxes/circles/numbered markers, plus
  traced polylines for wire-shaped `path` targets, aligned to normalized (0–1) coordinates and
  staying correct across resize/orientation changes and object-fit:cover cropping
  (`src/components/CameraOverlay.tsx`).
- **Voice output** — Web Speech `SpeechSynthesis`, with mute toggle, replay button, and a rate
  slider. Every instruction is short and spoken automatically.
- **Voice input** — Web Speech `SpeechRecognition` with a text-input fallback (and a visible
  idle/listening/processing mic state) for browsers that don't support it.
- **Session state** — tracks the problem, every instruction/observation/user response, and
  detected components so the AI doesn't repeat itself (`src/lib/session/`).
- **Verification loop** — when an instruction requires a change, the app watches for the scene
  to settle and automatically calls `/api/verify` to confirm (or reject) it before continuing.
- **Conversational follow-ups** — the user can interrupt with a question at any point; context
  (problem, last instruction, recent observations) goes with every request.
- **Multiple visual targets** — responses can highlight more than one point (e.g. two probe
  locations), each with its own numbered marker so it doesn't rely on color.
- **Safety cutoff** — a keyword check on the user's text (`src/lib/safety.ts`) plus an explicit
  instruction to the vision model to flag mains/high-voltage equipment. Either one stops
  step-by-step guidance and shows a safety banner instead.
- **Mock mode** — a scripted 4-step breadboard walkthrough (wire → resistor → LED → ground) for
  developing/demoing the whole experience without any API key or cost. Every string it returns
  is written to never claim it observed your actual circuit ("DEMO MODE...", every target label
  suffixed "(simulated)") and a persistent banner says so too - a demo must never read as a real
  diagnosis.
- **Diagnostics strip** — a small always-visible indicator (`src/components/DiagnosticsBar.tsx`)
  showing `Vision: MOCK/REAL` (from `/api/diagnostics`, server-side only - the client never
  guesses), `Voice: READY/FAILED`, and `Mic: READY/BLOCKED`, so voice/mic problems are visible
  immediately instead of failing silently.
- **iOS-safe voice output** — `speechSynthesis` only works reliably on iOS Safari/Chrome if
  unlocked by a real, synchronous user gesture; see [Voice output on iOS](#voice-output-on-ios).

## Architecture

```
src/
  app/
    page.tsx                 # main screen (camera + overlays + instruction panel + voice + history)
    layout.tsx
    api/
      analyze/route.ts       # POST: initial/followup analysis
      verify/route.ts        # POST: verification of a completed step
      diagnostics/route.ts   # GET: which VisionProvider is active (never the key itself)
  components/
    LiveCamera.tsx           # <video> + permission/error states
    CameraOverlay.tsx        # canvas overlay: boxes/circles/markers/wire-paths aligned to the video
    InstructionPanel.tsx     # current instruction, speaker controls, inline voice-error message
    VoiceInput.tsx           # mic button + text fallback
    SessionHistory.tsx       # collapsible timeline
    StatusIndicator.tsx      # Watching/Listening/Analyzing/Checking/Speaking pill
    DiagnosticsBar.tsx       # Vision MOCK/REAL, Voice READY/FAILED, Mic READY/BLOCKED
    DemoModeBanner.tsx       # persistent "no real vision configured" notice
    SafetyBanner.tsx
  hooks/
    useCamera.ts             # getUserMedia lifecycle
    useSpeechSynthesis.ts
    useSpeechRecognition.ts
    useVisionDiagnostics.ts  # fetches /api/diagnostics once on mount
    useTroubleshootingSession.ts   # the core orchestrator loop
  lib/
    vision/
      types.ts               # VisionProvider interface + strict response types
      prompt.ts               # shared system prompt + per-provider structured-output schemas
      dataUrl.ts               # shared data-URL -> {mediaType, base64} parsing
      sanitize.ts              # shared defensive validation of a raw model response
      mockProvider.ts
      geminiProvider.ts        # real provider: Google Gemini (default when GEMINI_API_KEY is set)
      anthropicProvider.ts     # real provider: Anthropic Claude
      handleAnalysis.ts       # shared request parsing/validation + safety short-circuit
      index.ts                # provider factory (env-driven)
    session/
      types.ts
      sessionManager.ts       # pure functions to fold AI responses into session state
    api/client.ts             # typed fetch wrappers for /api/analyze and /api/verify
    frameCapture.ts           # video -> resized/compressed JPEG data URL
    changeDetection.ts        # local pixel-diff sampler
    safety.ts                 # keyword-based high-voltage guard
```

## The loop

1. User asks a question (voice or text) → a frame is captured and sent to `/api/analyze`.
2. The AI returns strict JSON: an observation, one or more highlighted `targets`
   (normalized bounding boxes), a short instruction, and whether it needs to verify the result.
3. The overlay draws the target(s) on the live video; the instruction is spoken and shown.
4. The user makes the change. The local change detector notices the scene move, then settle.
5. Once settled (and past a cooldown), the app automatically captures a new frame and calls
   `/api/verify` with what the AI expects to see now.
6. The AI confirms or rejects the change, and either way gives the next single step —
   continuing the loop without ever asking for a manual photo upload.

## Configuration / environment variables

Copy `.env.example` to `.env.local`:

```bash
VISION_PROVIDER=mock        # "mock" | "gemini" | "anthropic" - leave unset to auto-detect
GEMINI_API_KEY=              # used by the "gemini" provider (checked first when auto-detecting)
VISION_API_KEY=              # used by the "anthropic" provider
VISION_MODEL=                # optional, each provider has a sensible default
```

Both API keys are only ever read server-side inside the `/api/analyze`, `/api/verify`, and
`/api/diagnostics` route handlers — never sent to or bundled into client code.

## Mock mode

With no `VISION_API_KEY` set, the app automatically uses `MockVisionProvider`
(`src/lib/vision/mockProvider.ts`): a deterministic 4-step breadboard script (positive wire →
resistor → LED/ground → GND jumper) with realistic bounding boxes, verification retries, and a
safety-stop demo (mention "wall socket" or "mains" and it will stop and show the safety
banner). This is enough to fully exercise the camera, overlay, voice, and verify-loop UX before
spending any API credits.

## Voice output on iOS

iOS Safari (and iOS Chrome, which is required by Apple to use the same WebKit engine) only lets
`speechSynthesis` actually produce audio if the very first `speak()` call in the page's lifetime
happens synchronously inside a real user gesture handler - not after an `await`, not on page
load. Because of that, the app deliberately does **not** auto-start the camera on load; the
"Enable camera" button's `onClick` calls `unlockVoice()` (in `src/hooks/useSpeechSynthesis.ts`)
synchronously, before the async `camera.start()`, priming the speech engine for the rest of the
session.

On top of that, `src/hooks/useSpeechSynthesis.ts` works around several other iOS quirks:
`getVoices()` is often empty until the async `voiceschanged` event fires (handled by an eager
listener + fallback to the browser default voice), a previous stuck/queued utterance can
silently block a new one unless `speechSynthesis.cancel()` runs first, and `onstart` isn't
guaranteed to fire when playback is blocked - so a ~2.5s start-timeout turns silence into a
reported failure instead of a permanently stuck "Speaking…". The `Voice: READY/FAILED` entry in
the diagnostics strip and the inline "Voice error: ..." message under the current step both
come from this - a real error is always shown, never hidden behind an optimistic status.

## Switching to a real vision model

### Gemini (default real provider)

Get a key from [Google AI Studio](https://aistudio.google.com/apikey), then in `.env.local`:

```bash
GEMINI_API_KEY=AIza...
VISION_MODEL=gemini-flash-lite-latest   # optional, this is already the default
```

That's it - `VISION_PROVIDER` can stay unset; the factory in `src/lib/vision/index.ts` auto-detects
`GEMINI_API_KEY` and switches from the mock provider to `GeminiVisionProvider` automatically. The
key is read server-side only (inside the `/api/analyze` and `/api/verify` route handlers via
`getVisionProvider()`) and is never sent to or bundled into client code - `CameraOverlay.tsx` and
`useTroubleshootingSession.ts` only import `type`-only declarations from `src/lib/vision/types.ts`,
never the provider implementations themselves.

`GeminiVisionProvider` (`src/lib/vision/geminiProvider.ts`) sends the captured frame + conversation
context to Gemini with `responseMimeType: "application/json"` and a `responseSchema` (Gemini's
native structured-output schema, `GEMINI_RESPONSE_SCHEMA` in `src/lib/vision/prompt.ts`) so the
response always matches the same strict JSON contract every provider returns, including
`shape: "path"` targets: for a bent/curved wire, Gemini can return an ordered list of `{x, y}`
points tracing its visible route instead of a single bounding box, which `CameraOverlay.tsx` draws
as a traced polyline (round-jointed, with end-point dots) rather than a rectangle that would also
cover whatever sits inside the bend. Every field is still defensively sanitized on the way in
(`src/lib/vision/sanitize.ts`, shared with the Anthropic provider) - a forced schema narrows what a
model *can* return, it doesn't make the response trusted input.

### Anthropic (alternate real provider)

```bash
VISION_PROVIDER=anthropic
VISION_API_KEY=sk-ant-...
VISION_MODEL=claude-sonnet-5   # optional
```

`AnthropicVisionProvider` does the same thing via a forced tool-call instead of a native JSON
schema. If both `GEMINI_API_KEY` and `VISION_API_KEY` are set with no explicit `VISION_PROVIDER`,
Gemini wins; set `VISION_PROVIDER=anthropic` explicitly to override that.

To add another provider, implement the `VisionProvider` interface and wire it into
`src/lib/vision/index.ts`'s `getVisionProvider()` factory.

## Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build (also type-checks)
npm run start   # run a production build
npm run lint    # eslint
```

## Known V1 limitations

- Voice input/output depend on browser support for the Web Speech APIs (Chrome/Edge/Safari;
  Firefox lacks `SpeechRecognition` — the text input is always available as a fallback).
- Change detection is a coarse luminance-diff heuristic, not real object tracking — it's tuned
  to notice "something moved" cheaply on-device, not to understand what changed.
- No accounts, persistence across page reloads, or server-side session storage by design — a
  session lives in memory for the current browser tab (see "Development rules" in the original
  spec: this is intentionally out of scope for V1).

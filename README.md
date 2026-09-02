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

## What's implemented (V1)

- **Live camera** — `getUserMedia` with front/rear switching (rear preferred on mobile),
  pause/resume, and permission/error handling. The stream stays open for the whole session.
- **Smart frame sampling** — frames are only captured/sent to the AI when the user asks a
  question, says "done", or a lightweight client-side pixel-diff sampler
  (`src/lib/changeDetection.ts`) detects the scene moved and then settled. A cooldown prevents
  request flooding, and only one AI request is ever in flight at a time.
- **Modular vision layer** (`src/lib/vision/`) — a `VisionProvider` interface with a
  `MockVisionProvider` (scripted, deterministic, free) and an `AnthropicVisionProvider` (real
  multimodal vision via a forced structured tool-call), selected server-side by `VISION_PROVIDER`.
- **Live overlays** — a canvas layer above the `<video>` draws boxes/circles/numbered markers
  aligned to normalized (0–1) bounding boxes, staying correct across resize/orientation changes
  and object-fit:cover cropping (`src/components/CameraOverlay.tsx`).
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
  developing/demoing the whole experience without any API key or cost.

## Architecture

```
src/
  app/
    page.tsx                 # main screen (camera + overlays + instruction panel + voice + history)
    layout.tsx
    api/
      analyze/route.ts       # POST: initial/followup analysis
      verify/route.ts        # POST: verification of a completed step
  components/
    LiveCamera.tsx           # <video> + permission/error states
    CameraOverlay.tsx        # canvas overlay: boxes/circles/markers aligned to the video
    InstructionPanel.tsx     # current instruction, speaker controls
    VoiceInput.tsx           # mic button + text fallback
    SessionHistory.tsx       # collapsible timeline
    StatusIndicator.tsx      # Watching/Listening/Analyzing/Checking/Speaking pill
    SafetyBanner.tsx
  hooks/
    useCamera.ts             # getUserMedia lifecycle
    useSpeechSynthesis.ts
    useSpeechRecognition.ts
    useTroubleshootingSession.ts   # the core orchestrator loop
  lib/
    vision/
      types.ts               # VisionProvider interface + strict response types
      prompt.ts               # shared system prompt + JSON schema for real providers
      mockProvider.ts
      anthropicProvider.ts
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
VISION_PROVIDER=mock        # "mock" | "anthropic"
VISION_API_KEY=             # required if VISION_PROVIDER=anthropic
VISION_MODEL=                # optional, provider has a sensible default
```

The API key is only ever read server-side inside the `/api/analyze` and `/api/verify` route
handlers — it is never sent to or bundled into client code.

## Mock mode

With no `VISION_API_KEY` set, the app automatically uses `MockVisionProvider`
(`src/lib/vision/mockProvider.ts`): a deterministic 4-step breadboard script (positive wire →
resistor → LED/ground → GND jumper) with realistic bounding boxes, verification retries, and a
safety-stop demo (mention "wall socket" or "mains" and it will stop and show the safety
banner). This is enough to fully exercise the camera, overlay, voice, and verify-loop UX before
spending any API credits.

## Switching to a real vision model

Set in `.env.local`:

```bash
VISION_PROVIDER=anthropic
VISION_API_KEY=sk-ant-...
VISION_MODEL=claude-sonnet-5   # optional
```

`AnthropicVisionProvider` sends the captured frame + conversation context to Claude with a
forced structured tool call, so the response always matches the strict JSON contract in
`src/lib/vision/types.ts`. To add another provider, implement the `VisionProvider` interface
and wire it into `src/lib/vision/index.ts`'s `getVisionProvider()` factory.

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

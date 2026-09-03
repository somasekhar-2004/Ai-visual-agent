# AI Visual Expert — native app

Expo/React Native frontend for AI Visual Expert, replacing the Next.js browser app's UI. Built
because browser `speechSynthesis`/`SpeechRecognition` proved unreliable across iOS Safari and
Android Chrome after extensive real-device testing - native TTS/STT don't have those quirks.

**The Next.js backend is untouched and still does all the work**: `/api/analyze`, `/api/verify`,
`/api/tts`, `/api/diagnostics`, the Gemini provider, prompting, sanitization, and the
source/destination target logic all still live in the parent `ai-visual-agent/` project and run
exactly as before. This app is just a new client for that same API.

## Status

What's implemented right now:
- Live camera preview (`expo-camera`) that **never pauses or freezes** - `takePictureAsync()`
  grabs a still frame to send to the backend without affecting the live preview at all.
- Type a question -> capture a frame -> `POST /api/analyze` on the existing backend (identical
  request/response shape to the web app) -> show the instruction text -> speak it with native TTS
  (`expo-speech`, no browser `speechSynthesis` anywhere)
- The returned source/destination targets render **live on top of the camera preview**
  (`react-native-svg`), and stay roughly aligned with the real scene as the phone moves via
  gyroscope-based motion compensation between Gemini calls - see "Live tracking approach" below
  for exactly what this does and doesn't do.

What's **not** built yet (next phases, not in this pass):
- Voice input (STT) - see "Adding voice input" below for why this needs a dev build
- The "say done -> verify" loop and full multi-turn session state (previous observations,
  detected components, conversation tail) - the backend already supports all of this, the app
  just isn't threading it through past a single previous instruction yet

## Live tracking approach

**The ask was real-time object tracking, Google-Lens-style: the box visually follows the actual
wire as the camera moves, independent of what the camera itself is doing. What's shipped here is
a weaker, more limited thing: camera-rotation compensation.** They look similar for small,
careful phone movements and are not the same thing. Read this section before judging "does the
box track well" - it explains exactly what to expect.

**Why not real object tracking (optical flow / Lucas-Kanade) right now:** that needs a live
per-frame pixel stream fast enough to track at camera framerate, which on Expo means
`react-native-vision-camera` "frame processors." Frame processors are backed by a native module -
**not part of the Expo Go sandbox** - and the tracking algorithm itself has to run in native code
(typically wrapping OpenCV) to have any chance of keeping up with 20-30fps; a pure-JS
implementation would be far too slow. That's a genuinely substantial native-engineering effort
(binding OpenCV or a similar CV library on both platforms, writing/testing the frame-processor
plugin), and **it cannot be built *and verified* from this sandboxed dev environment** - there's
no camera, no physical device, and no Xcode/Android Studio here to build and run it against. I'm
not going to hand you native tracking code I have zero way to confirm actually works. "How to
get there" is in **Phase 2**, below.

**What's shipped instead, and why:** `expo-sensors`' `Gyroscope` - a standard bundled Expo module,
works in plain Expo Go, no native code, no dev client - continuously integrates the phone's
rotation (`src/overlay/useTrackedTargets.ts`). Each time a frame is captured for analysis, the
current integrated rotation is snapshotted; once Gemini's response comes back, the difference
between "now" and that snapshot estimates how far the *camera* has rotated since the analyzed
frame was taken, and the whole overlay group is shifted by that estimate (converted from radians
to screen pixels via an assumed field of view) until the next response replaces it. This is a
well-established lightweight technique (sometimes called inertial dead-reckoning / motion-
compensated re-projection) used by simple AR-annotation apps that don't do full visual tracking.

**What this technique cannot do, concretely:**
- It compensates for the camera **rotating** (panning/tilting) - not for **translating**
  sideways/forward, and not for the wire itself moving independently of the camera. For a
  breadboard held close to the camera, lateral hand movement (not rotation) causes a lot of the
  apparent motion, and this technique does not correct for that at all.
- It **drifts** the longer it runs without a fresh Gemini anchor - bounded by however often the
  app re-analyzes, which right now is only on-demand per question (a periodic auto-verify loop,
  like the web app has, isn't ported yet - see "not built yet" above).
- The angle -> pixel conversion assumes a **fixed 68° horizontal field of view**
  (`ASSUMED_HORIZONTAL_FOV_DEGREES` in `useTrackedTargets.ts`) since expo-camera doesn't expose
  the real device's FOV. Real phone camera FOVs vary (~60-75°); if the box visibly under- or
  over-shoots real motion on your device, adjust this constant.
- The **axis sign convention is unverified against a real device.** Gyroscope X/Y are mapped to
  pitch/yaw using the standard mobile device-axis convention, but I have no way to confirm the
  sign is right without a physical phone. **If the box drifts in the wrong direction when you
  test this, flip the sign of `dx` and/or `dy`** in the `pixelOffset` calculation in
  `useTrackedTargets.ts` (clearly commented at that exact line).
- Roll (twisting the phone like a steering wheel) isn't compensated at all, only pitch/yaw.

If the device has no gyroscope (rare, but `Gyroscope.isAvailableAsync()` can return `false`), the
app falls back to a static box that holds its last position and jumps on the next update - a
safe, honest degradation rather than broken math.

**Verified from this environment:** the coordinate-mapping math (`src/overlay/coordinateMapping.ts`,
the frame->screen "cover" projection) has real unit tests confirming correct scale/offset/point
math and no NaN on degenerate input - genuinely checked, not just typechecked. The camera-rotation
tracking, the FOV constant, and the axis signs are **not** verified against real sensor data -
that's the concrete thing to test and report back on once this is on your phone.

### Phase 2: true visual object tracking

When you're ready to invest in the real thing:
1. `npx expo install react-native-vision-camera react-native-worklets-core` (or the current
   equivalent - check compatibility with Expo SDK 57 at that time) and switch `CameraView` to
   vision-camera's `Camera` component with a frame processor.
2. Pick or write a frame-processor plugin that does per-frame tracking - e.g. a plugin wrapping
   OpenCV's `calcOpticalFlowPyrLK` (Lucas-Kanade pyramidal optical flow) seeded with the
   feature points inside Gemini's last returned bounding box, updated every frame.
3. This requires a **custom dev client** (see "Adding voice input" below for the exact
   `expo run:ios`/`expo run:android`/EAS build steps - the same switch STT needs, so it's a
   natural point to add both at once).
4. Re-anchor the tracker's seed points every time a new Gemini response arrives, the same
   handoff pattern already implemented here (`setTargets`/`markCaptureMoment` in
   `useTrackedTargets.ts`) - only the "how do we estimate motion between anchors" part changes,
   the capture/anchor/handoff architecture around it carries over.

## Prerequisites

- Node.js (same version as the main project)
- **Expo Go** app installed on your phone (App Store / Play Store) - this is enough for
  everything currently implemented (camera + native TTS both work in plain Expo Go, no custom
  native code needed yet)
- Your phone and your Mac on the **same Wi-Fi network**

## 1. Start the backend (in the other folder, exactly as before)

```bash
cd ai-visual-agent   # the Next.js project, NOT this one
npm run dev
```

Leave this running. Note the "Network:" URL it prints on startup, e.g.:

```
- Local:    http://localhost:3000
- Network:  http://192.168.1.23:3000    <- this one
```

(No flags needed - `next dev` already binds to all interfaces and prints this by default.)

## 2. Configure this app to point at that backend

```bash
cd ai-visual-agent-app
cp .env.example .env
```

Edit `.env` and set `EXPO_PUBLIC_API_BASE_URL` to the "Network:" URL from step 1 (your Mac's LAN
IP), e.g.:

```
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.23:3000
```

Using `localhost` here will **not** work from a physical phone - it would only resolve to the
phone itself, not your Mac. (A simulator/emulator running on the same Mac is the only case where
`localhost` would work, and even then only for iOS Simulator - Android emulators need
`10.0.2.2` instead of `localhost`.)

## 3. Install deps and start Expo

```bash
npm install
npx expo start
```

This prints a QR code in the terminal.

## 4. Run it on your phone (same way as Termino)

- **iPhone**: open the Camera app and point it at the QR code, tap the notification that pops up
  - it opens directly in Expo Go.
- **Android**: open the **Expo Go** app itself and use its built-in QR scanner (Android's system
  camera won't hand off to Expo Go the way iOS's does).

First launch will prompt for camera permission - grant it, then:
1. Point the camera at a circuit/breadboard.
2. Type a question in the box at the bottom (e.g. "why isn't my LED lighting up?").
3. Tap **Ask**.
4. Within a few seconds you should see the instruction text appear and hear it spoken aloud.

If `npx expo start` doesn't pick up a change to `.env`, stop it (Ctrl+C) and restart - env vars
are inlined at bundle-build time, not hot-reloaded.

### If you see "Could not reach the backend..."

- Confirm the Next.js dev server (step 1) is still running.
- Confirm `EXPO_PUBLIC_API_BASE_URL` in `.env` matches its current "Network:" URL exactly (this
  can change if your Mac reconnects to Wi-Fi and gets a new IP).
- Confirm your phone is on the same Wi-Fi network as your Mac (not cellular data, not a guest
  network that isolates devices from each other).

## Diagnosing silent TTS (no audio, no error shown)

`expo-speech` is a **standard, always-bundled Expo SDK module** - it wraps Android's built-in
`android.speech.tts.TextToSpeech` and iOS's `AVSpeechSynthesizer`, not a third-party native
library. It ships inside Expo Go itself (confirmed by reading
`node_modules/expo-speech/expo-module.config.json` and its Android manifest fragment directly -
they're part of the core SDK, not gated behind a custom dev client). **You do not need a dev
client to make expo-speech work.** If it's silent, it's a device/config issue, not a
Expo-Go-vs-dev-client issue.

Every `Speech.speak()` call in this app (both the real instruction flow and the **Test Voice**
button in the panel) now logs every stage to the console:

```
[speech] speak() called (analyze-response): "Plug the yellow wire into..."
[speech] onStart (analyze-response)
[speech] onDone (analyze-response)
```

**To see these live from your phone:** the terminal where you ran `npx expo start` shows
`console.log`/`console.error` output from the device automatically - no extra setup, it streams
over the same connection Metro uses for the JS bundle. Just watch that terminal while you tap
**Test Voice** or **Ask** on the phone. (Alternative: press `j` in that terminal to open the
remote JS debugger, or shake the phone -> "Open JS Debugger", if you want browser devtools
instead of the terminal.)

Tap **Test Voice** (a fixed "Voice test successful." phrase, independent of any backend call) and
read the log pattern that shows up:

| Log pattern | What it means | What to do |
|---|---|---|
| `speak() called` -> `onStart` -> `onDone`, no error, **and you heard it** | Working correctly. | Nothing - if the real instruction flow is still silent, something else is off (unlikely given Test Voice uses the exact same code path). |
| `speak() called` -> `onStart` -> `onDone`, no error, **but silence** | The TTS engine accepted and "finished" the utterance with no error - Android's engine only reports its own bookkeeping, not whether audio was actually audible. Almost always a **device audio issue**, not an app bug. | Check the device's **media volume** (not ringer volume - TTS plays on the media stream, which is commonly muted independently). Check Settings -> Accessibility (or Sound/Text-to-speech, OEM-dependent) -> Text-to-speech output -> confirm an engine is selected and its voice data is downloaded (tap "Play" in that settings screen to test outside the app entirely). |
| `speak() called`, then **`onError` with `started=false`** | The TTS engine itself failed to initialize or rejected the call outright - no engine configured/enabled on the device. | Same Settings path as above - install/select a TTS engine (Google's "Speech Services by Google" is the usual default). The visible `⚠ Voice error:` banner in the app will show this. |
| `speak() called`, then **`onError` with `started=true`** | The engine started, then errored partway through. | Same as the "silence with no error" row - device-level TTS/audio issue. |
| **Nothing at all logs**, not even `speak() called` | A JS-level bug before `Speech.speak()` is even reached (e.g. `spokenText` was empty). | Check the `[speech] speak() called` line's logged text - if this line is missing entirely, look at what set `instruction`/`spokenText` upstream, not the speech code. |

Note: on Android, `expo-speech`'s error event never carries a real message (confirmed by reading
the module's own source - the JS wrapper does `new Error(error)` where `error` is always
`undefined` from the native side), so `onError`'s `err.message` will always read `"undefined"`.
That's a limitation of the library, not a bug here - the `started` flag (whether `onStart` fired
first) is the only signal that actually distinguishes "engine never initialized" from "engine ran
but produced no sound", which is why the error banner and the table above key off it.

**Root cause was not able to be confirmed from this environment** - there's no Android
device/emulator with audio here to reproduce "silent TTS" against, only static analysis of
`expo-speech`'s own source. The added logging is what turns that from a guess into a real
answer once you run it. My best-guess ranking, most to least likely for a real device: (1) media
volume muted or routed to a disconnected output (Bluetooth device still "selected" but off), (2)
no TTS voice data downloaded for the resolved language, (3) no default TTS engine configured on
that specific device.

## Adding voice input (next phase)

The reliable native STT options (`@react-native-voice/voice`, `expo-speech-recognition`, etc.)
all use native modules that are **not** part of the Expo Go sandbox - Expo Go only ships the
fixed set of native modules built into it. Adding real voice input will require switching from
Expo Go to a **custom dev client**:

```bash
npx expo install expo-dev-client
npx expo run:ios       # requires a Mac + Xcode, or
npx expo run:android   # requires Android Studio / an Android SDK
```

or building one via EAS (`eas build --profile development`) without needing Xcode/Android Studio
installed locally. Camera and TTS will keep working exactly the same in a dev client as they do
in Expo Go - only STT needs this switch.

## Project structure

```
App.tsx                          - the whole screen for now (camera, question input, instruction
                                    display, speech, overlay wiring)
src/types.ts                     - VisionProviderRequest/VisionAnalysisResponse/VisualTarget,
                                    hand-mirrored from ai-visual-agent/src/lib/vision/types.ts
                                    (keep both in sync)
src/api.ts                       - fetch-based client for /api/analyze and /api/verify
src/config.ts                    - reads EXPO_PUBLIC_API_BASE_URL
src/overlay/coordinateMapping.ts - frame -> screen "cover" projection math (has real unit tests,
                                    see "Live tracking approach")
src/overlay/useTrackedTargets.ts - gyroscope-based motion compensation between Gemini calls
src/overlay/CameraOverlay.tsx    - react-native-svg rendering of targets on the live preview
```

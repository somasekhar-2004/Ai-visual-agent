# AI Visual Expert — native app

Expo/React Native frontend for AI Visual Expert, replacing the Next.js browser app's UI. Built
because browser `speechSynthesis`/`SpeechRecognition` proved unreliable across iOS Safari and
Android Chrome after extensive real-device testing - native TTS/STT don't have those quirks.

**The Next.js backend is untouched and still does all the work**: `/api/analyze`, `/api/verify`,
`/api/tts`, `/api/diagnostics`, the Gemini provider, prompting, sanitization, and the
source/destination target logic all still live in the parent `ai-visual-agent/` project and run
exactly as before. This app is just a new client for that same API.

## Status: minimal loop working end-to-end

What's implemented right now:
- Live camera preview (`expo-camera`)
- Type a question -> capture a frame -> `POST /api/analyze` on the existing backend (identical
  request/response shape to the web app) -> show the instruction text -> speak it with native TTS
  (`expo-speech`, no browser `speechSynthesis` anywhere)

What's **not** built yet (next phases, not in this pass):
- Voice input (STT) - see "Adding voice input" below for why this needs a dev build
- Rendering the source/destination overlay markers (`react-native-svg`) on the camera view - the
  backend already returns `targets` with `boundingBox`/`path`/`role`/`linkedTargetId` in every
  response, just not drawn on screen yet
- The "say done -> verify" loop and full multi-turn session state (previous observations,
  detected components, conversation tail) - the backend already supports all of this, the app
  just isn't threading it through past a single previous instruction yet

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
App.tsx           - the whole screen for now (camera, question input, instruction display)
src/types.ts       - VisionProviderRequest/VisionAnalysisResponse/VisualTarget, hand-mirrored
                     from ai-visual-agent/src/lib/vision/types.ts (keep both in sync)
src/api.ts         - fetch-based client for /api/analyze and /api/verify
src/config.ts      - reads EXPO_PUBLIC_API_BASE_URL
```

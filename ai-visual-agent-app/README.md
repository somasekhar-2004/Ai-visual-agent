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

## AR world tracking (ARKit/ARCore) — Phase A results

Gyroscope-rotation compensation (above) was confirmed too inaccurate for real use - it drifts and
doesn't correct for lateral phone movement. The real fix is true world tracking: ARKit on iOS,
ARCore on Android, via [`@reactvision/react-viro`](https://viro-community.readme.io/docs)
(ViroReact), the actively-maintained library wrapping both under one JS API. This is a bigger
migration - it needs a **custom dev client**, not Expo Go - so it's being built in phases, proven
one step at a time rather than in one large pass. **Phase A** (this section) is step one: prove
the toolchain itself builds and runs, completely isolated from the real app.

**Important: this was all done from a Linux sandbox with no macOS/Xcode/iOS Simulator/physical
device access at all.** Everything that can be verified without a Mac has been verified for real
(not guessed) below. Everything that needs a Mac still needs *you* to run it and report back what
happens - I cannot execute or observe any of it from here.

### What's isolated where

- `ar-poc/ArPocScene.tsx`, `ar-poc/ArPocApp.tsx` - a minimal ViroReact hello-world scene (plane
  detection, tap-to-place a sphere, world-locked as the camera moves). Not wired into the real
  app's navigation or component tree at all.
- `index.ts` has one added line: if `EXPO_PUBLIC_AR_POC=1` is set at build/run time, it renders
  `ArPocApp` instead of the real `App`. Unset (the default, and what every normal build uses),
  this has zero effect - it's the exact same `registerRootComponent(App)` call the file always had.
- `App.tsx`, the camera flow, the gyroscope tracking, the backend calls - **all completely
  untouched**. `git status` confirms only `app.json`, `index.ts`, `package.json`/
  `package-lock.json`, and the new `ar-poc/` directory changed.

### What was verified from this sandbox (no Mac needed for these)

- `npm install @reactvision/react-viro` resolves cleanly against this project's real installed
  versions (Expo ~57.0.19, React Native 0.86.3) - checked against the package's actual peer-dep
  range (`expo >=55 <58`, `react-native >=0.83 <0.87`), not assumed.
- The `@reactvision/react-viro` config plugin is correctly added to `app.json`'s `plugins` array
  (with `"provider": "none"` - deliberately opting out of ViroReact's cloud-anchor service, since
  this only needs local on-device AR tracking, not an account/API key).
- `npx expo prebuild --clean` succeeds and generates real `ios/` and `android/` native project
  skeletons, and the plugin correctly wires `pod 'ViroReact'` and `pod 'ViroKit'` into the
  generated `ios/Podfile`.
- `npx tsc --noEmit` passes with the real installed ViroReact type definitions - `ArPocScene.tsx`
  and `ArPocApp.tsx` typecheck cleanly, not just "look right."
- `npx expo export --platform ios` and `--platform android` both succeed with the plugin active,
  and inspecting the actual bundle output (`--dev`, ungzipped) confirms the `EXPO_PUBLIC_AR_POC`
  toggle really is present in the shipped JS as a runtime check, not eliminated at build time.

None of the above touches Xcode, CocoaPods, the Simulator, or a device - it's everything Node/
Metro/TypeScript can check without a Mac.

### The one real blocker found: New Architecture

Reading the generated `ios/Podfile` turned up this, near the bottom:

```ruby
# Enforce New Architecture requirement
# ViroReact 2.43.1+ requires React Native New Architecture
if ENV['RCT_NEW_ARCH_ENABLED'] != '1'
  raise "ViroReact requires New Architecture to be enabled. Please set RCT_NEW_ARCH_ENABLED=1 in ios/.xcode.env"
end
```

ViroReact requires React Native's New Architecture (Fabric). On Android, `expo prebuild` turns
this on automatically. On iOS, the Podfile checks the **shell environment variable**
`RCT_NEW_ARCH_ENABLED` directly - not `app.json`'s `newArchEnabled` field (confirmed empirically:
adding that to `app.json` does not reach the Podfile). Without it set, `pod install` (which
`expo run:ios` runs for you) will hard-fail with the error above.

Because `ios/` is regenerated by every `expo prebuild --clean` and is gitignored, a one-time edit
to a generated file wouldn't stick. The durable fix is exporting it in your **persistent shell
profile**, so it's step 1 below.

### Exact steps to run on your Mac

1. **One-time: enable New Architecture for iOS builds.** Add this line to `~/.zshrc` (or
   `~/.bash_profile` if you use bash), then open a **new** terminal tab (or `source ~/.zshrc`) so
   it takes effect:
   ```
   export RCT_NEW_ARCH_ENABLED=1
   ```
2. In `ai-visual-agent-app/`, pull this branch and install deps:
   ```
   npm install
   ```
3. Generate the native iOS project on your machine (this sandbox's generated `ios/` folder isn't
   committed/isn't yours to reuse - CocoaPods has to run on your Mac regardless):
   ```
   npx expo prebuild --clean
   ```
   Watch for the `RCT_NEW_ARCH_ENABLED` raise from the Podfile section above - if you see it, step
   1 didn't take effect in that terminal session; open a fresh terminal and retry.
4. Connect your iPhone via USB (simplest for a first run) and unlock it. If this is the first time
   this Mac has run a dev build to that phone, Xcode will prompt you to "Trust This Computer" -
   accept on the phone.
5. Run it, targeting your physical device (**not** the Simulator - ARKit world tracking doesn't
   work in the Simulator):
   ```
   EXPO_PUBLIC_AR_POC=1 npx expo run:ios --device
   ```
   Expo will list connected devices/simulators if there's any ambiguity - pick your iPhone.
6. **Code signing, if Xcode stops the build asking for it:** this only happens if `expo run:ios`
   can't resolve it automatically. If it does:
   - Xcode opens (or open `ios/aivisualagentapp.xcworkspace` manually).
   - Click the blue project icon at the top of the left sidebar -> select the app target ->
     **Signing & Capabilities** tab.
   - Under **Team**, pick your personal Apple ID (if none is listed, click "Add an Account..." and
     sign in with the Apple ID you use for the App Store - a free personal team works fine for
     running on your own device, no paid developer account needed).
   - Leave "Automatically manage signing" checked.
   - Re-run step 5's command.
7. **Trusting the developer certificate on your iPhone** (needed the first time you install any
   app built this way, separate from the "Trust This Computer" prompt): if the app installs but
   won't open ("Untrusted Developer Certificate"), go to **Settings -> General -> VPN & Device
   Management** on the iPhone, tap your Apple ID under "Developer App", tap **Trust**, confirm.
   Then relaunch the app from the home screen.

### What "it worked" looks like

Per the comment at the top of `ar-poc/ArPocScene.tsx`:
1. Camera feed appears with floating text: "Move phone to find surfaces..."
2. Point the phone at a flat surface (table/floor) - text changes to "Tracking - point at a flat
   surface" and a translucent overlay should appear on the detected plane.
3. Tap the overlay - a small cyan sphere appears where you tapped, text changes to "Placed!
   ViroReact is working."
4. Walk around / move the phone - **the sphere should stay locked to that real-world point.** This
   last part is the actual thing Phase A exists to prove - not this app's code, but that ARKit
   world tracking itself is working end-to-end through ViroReact on your device.

**Phase A result: confirmed working on a real device.** ARKit surface detection and world-anchored
placement both work correctly through ViroReact - a placed marker stays locked to its real-world
position exactly like the iPhone Measure app, verified by physically moving the camera away and
back. Phase B (below) builds on this.

## Phase B results: AR camera in the real app flow

Phase A proved the ViroReact toolchain itself works. Phase B swaps the *real app's* camera layer
(the one behind the ask/analyze/speak flow, not just a test scene) from `expo-camera` to
ViroReact's `ViroARSceneNavigator` - still gated behind the same `EXPO_PUBLIC_AR_POC=1` flag, so
`App.tsx` and the working expo-camera flow are completely unaffected when it's off. **As with
Phase A, this was built and verified from a Linux sandbox with no Xcode/Simulator/device access -
everything below that needs a Mac still needs you to run it and report back.**

### What changed

- `ar-poc/ArMainScene.tsx` - the AR scene mounted by the real flow. No visible 3D content (that's
  Phase C - anchoring Gemini's targets in AR space); its only job is to be the live AR camera
  passthrough with plane detection running in the background, and to report tracking state up to
  the app shell.
- `ar-poc/ArMainApp.tsx` - a parallel version of `App.tsx`'s ask/analyze/speak flow, with two
  differences: `ViroARSceneNavigator` instead of `CameraView` for the camera layer, and
  `takeScreenshot()` instead of `takePictureAsync()` for capture. Everything downstream of capture
  (resize/compress, `/api/analyze` call, request/response shape, native TTS) is identical to
  `App.tsx` - copied rather than shared/refactored out, so `App.tsx` itself has **zero diff** (same
  isolation approach as Phase A - confirmed via `git status`/`git diff` showing only `index.ts`'s
  one-line toggle target changed, plus the two new files).
- `index.ts`'s `EXPO_PUBLIC_AR_POC=1` flag now launches `ArMainApp` (Phase B) instead of Phase A's
  hello-world scene. That scene's files (`ArPocApp.tsx`/`ArPocScene.tsx`) are untouched and still
  in `ar-poc/` for reference, just no longer wired to the flag now that they've served their
  purpose.

### The screenshot format question, and how it's handled without guessing

You asked me to confirm the captured image's format/orientation matches what the backend expects,
and flag clearly if adjustment is needed. Here's the honest answer: **ViroReact ships as a
precompiled binary (`ViroKit.framework` on iOS) - there's no source for `takeScreenshot()` in this
sandbox to read, so I cannot directly confirm what pixel format, resolution, or orientation it
writes.** Rather than guess, `ArMainApp.tsx` pipes the screenshot's file URI through the exact same
`expo-image-manipulator` resize/recompress step `App.tsx` already uses for expo-camera photos
(`manipulateAsync(uri, [{resize: {width: 896}}], {compress: 0.72, format: SaveFormat.JPEG, base64:
true})`). That step decodes whatever image format the input file actually is - PNG, JPEG, whatever
ViroReact chose - so it sidesteps needing to know the format up front, and it normalizes every
capture (AR or expo-camera) to the same JPEG/896px/quality-0.72 payload the backend already expects
and that `parseDataUrl` on the backend already validates (`data:image/jpeg;base64,...`). The one
thing this can't rule out from this sandbox: whether the *content* of that JPEG is right-side-up
and matches what's on screen (a rendered AR view's screenshot should be pixel-exact to the display,
with no separate EXIF-orientation step the way raw camera sensor output sometimes has - but "should
be" is a claim from how these APIs generally behave, not something verified here). That's the one
concrete thing to check in your on-device test below.

### What was verified from this sandbox (no Mac needed for these)

- `npx tsc --noEmit` passes cleanly - `ArMainScene.tsx`/`ArMainApp.tsx` typecheck against the real
  ViroReact/expo-image-manipulator types, including `ViroARSceneNavigator`'s ref-exposed
  `arSceneNavigator.takeScreenshot()` method and `requestRequiredPermissions()` (ViroReact's own
  camera-permission API, used here instead of `expo-camera`'s hook since it's the AR session that
  needs the permission now).
- `npx expo export --platform ios` succeeds, and inspecting the `--dev` bundle output confirms both
  `ArMainApp`/`ArMainScene` and `takeScreenshot` are present, and that the runtime toggle now reads
  `EXPO_PUBLIC_AR_POC === '1' ? ArMainApp.default : App.default`.
- `npx expo prebuild --clean` still succeeds and the generated `ios/Podfile` still wires in
  `ViroReact`/`ViroKit` the same as Phase A - no new native dependency was needed for this phase
  (`expo-image-manipulator` was already installed).
- `git status`/`git diff` confirm `App.tsx` has **zero changes** - the existing expo-camera flow is
  byte-for-byte what it was before Phase B, so switching `EXPO_PUBLIC_AR_POC` off is guaranteed to
  give you back exactly the working app you had.

### Run it on your Mac

Same steps as Phase A (New Architecture env var, `npm install`, `npx expo prebuild --clean`,
physical device required), just re-run step 5 to pick up this phase's code:
```
EXPO_PUBLIC_AR_POC=1 npx expo run:ios --device
```

### What "it worked" looks like

1. Camera permission prompt appears (via ViroReact's `requestRequiredPermissions`, not
   expo-camera's) - grant it.
2. Live AR camera feed appears (same visual passthrough as Phase A, just no sphere/text overlay
   this time) with a small "AR tracking: initializing…" badge bottom-left, which should switch to
   "AR tracking: normal" within a second or two of pointing at a reasonably lit, textured surface.
3. Type a question (e.g. "what's wrong with this circuit?"), point the camera at something, tap
   **Ask**. Watch the Metro log for `[speech]` lines same as before.
4. You should get back a real instruction from Gemini, shown in the panel and spoken aloud - this
   confirms the full round trip: AR screenshot -> resize/JPEG -> `/api/analyze` -> real backend
   response -> native TTS.

**Phase B result: confirmed working on a real device.** The AR camera stays live (no freeze/
capture pause), and Gemini's responses are accurate to what the camera was actually pointing at -
orientation and capture content are correct. Phase C (below) builds on this.

## Phase C results: Gemini's targets as real, world-anchored AR markers

This is the feature the whole AR migration was for: Gemini's returned targets (source/destination,
2D coordinates) rendered as real content anchored in 3D space - a marker placed on the actual wire
stays visually on that wire as the phone moves, the same way the Phase A test sphere did, instead
of the 2D-overlay approximation `App.tsx` uses. **As with Phases A and B, this was built and
verified from a Linux sandbox with no Xcode/Simulator/device access - the on-device behavior below
is what still needs you to test and report back**, and this phase in particular leans on some
ViroReact API behavior I could only confirm by reading its shipped source, not by running it.

### What changed

- `ar-poc/arTargetPlacement.ts` - for each of Gemini's targets, works out its on-screen 2D point,
  hit-tests that point into the live AR session with `performARHitTestWithPoint`, ranks the results
  (a confirmed real surface beats a sparse feature point - see below), and calls
  `createAnchoredNode` on the best one to create a real AR anchor.
- `ar-poc/ArAnchoredTargets.tsx` - renders the placed targets: a small sphere marker + a
  camera-facing text label per target (cyan for source, amber for destination - the same
  `#22d3ee`/`#f59e0b` convention as the web app and `src/overlay/CameraOverlay.tsx`), and a line
  between a destination and its linked source, mirroring the web app's dashed connector.
- `ar-poc/ArMainScene.tsx` now holds a ref to the `ViroARScene` itself (needed for the hit-test/
  anchor calls) and re-runs placement whenever a new set of targets arrives, replacing the
  rendered markers wholesale rather than adding to them.
- `ar-poc/ArMainApp.tsx` now tracks `targets`/`frameSize`/`containerSize` state (the same inputs
  the gyroscope-tracked 2D overlay uses) and a small "targets placed: X/Y" status badge next to
  the AR tracking indicator.

Unlike `App.tsx`'s gyroscope-compensated overlay, there's no capture-moment snapshot or per-frame
pixel-offset math on this path at all - each marker is hit-tested into real 3D world space once,
and from then on ARKit/ARCore itself is what keeps it visually locked to that point as the phone
moves. That's the entire point of doing this migration.

### A real API-behavior finding: `viroAppProps`, not a normal prop

Something I found by reading `ViroARSceneNavigator`'s actual implementation (not by guessing, and
not documented anywhere I could find): **`initialScene`'s `scene` factory is only invoked once, at
first mount** - passing `targets` through it as an ordinary prop (`scene: () => <ArMainScene
targets={targets} />`) would have permanently frozen it at whatever `targets` was on the very first
render (an empty array), silently never updating again on later questions. I found this by tracing
`ViroARSceneNavigator.js`'s `constructor`/`componentDidUpdate`/`render` directly: the scene is
captured into `state.sceneDictionary` once in the constructor and `componentDidUpdate` never
refreshes it, while `viroAppProps` **is** explicitly re-synced onto the live scene every render
(`this.arSceneNavigator.viroAppProps = this.props.viroAppProps`, run inside `render()`). So
`ArMainApp.tsx` now passes `{targets, frameSize, containerSize}` through `viroAppProps` instead,
and the scene factory reads them back out via its own `arSceneNavigator` prop. This is exactly the
kind of thing that would have looked like it worked in a quick test (a marker or two would
correctly appear from the *first* question) and then silently stopped updating on every question
after that - worth being extra sure of on-device, per the checklist below.

### The `createAnchoredNode` limitation - and why it's still called

You asked specifically for `performARHitTestWithPoint` + `createAnchoredNode`. The hit-test part
works exactly as documented. `createAnchoredNode` is more complicated: its own doc comment in the
shipped `.d.ts` says the node reference it returns "can be passed to a `ViroARNode` component to
attach 3D content (though `ViroARNode` is optional **and not yet implemented**)." I confirmed
`ViroARNode` genuinely isn't exported anywhere in this package version. That means:

- There is no way, in this ViroReact version, to parent a visible marker under the anchor
  `createAnchoredNode` creates. What actually makes a marker "stay locked" here is the same
  mechanism Phase A's tap-to-place sphere used: a plain `ViroSphere`/`ViroText` positioned once at
  a fixed `[x, y, z]` world coordinate, which ARKit/ARCore continuously re-projects correctly onto
  the live camera feed as the phone moves - **not** anything from the anchor itself.
- There's also no exposed way to remove an individual anchor - only `resetARSession(...,
  removeAnchors: true)`, which also resets tracking (and would undo the whole point of this
  migration if called on every question). So native anchors from `createAnchoredNode` accumulate
  for the life of the AR session, with no visible/rendering cost (nothing renders from them) but a
  real, unbounded native resource cost the library gives no way to avoid short of restarting
  tracking.

Given that, `createAnchoredNode` is still called - it's the more correct AR practice, it's cheap,
and it's what was explicitly asked for - but its result is only used as a one-time position
snapshot (falling back to the raw hit-test position if it fails), not as a live-updating anchor.
I considered dropping the call entirely, since in this version it provides no observable benefit
over just using the hit-test's own position - but kept it since it does no harm and might still
matter (ARKit continues refining an anchor's tracked pose after creation in ways a bare static
point doesn't benefit from, even though nothing here currently reads that refinement back). Worth
knowing about for a long troubleshooting session with many questions, though unlikely to matter for
a normal one.

### Coordinates: confirmed from source, not guessed

`performARHitTestWithPoint(x, y)` isn't documented anywhere as to what units `x`/`y` are in. I
found the answer by reading ViroReact's own internal "tap to place" feature
(`StudioARScene.js`/`StudioSceneNavigator.js`), which computes its point as `locationX *
PixelRatio.get()` before calling this same method - i.e. **raw device pixels, not React Native's
dp/logical-pixel units.** `arTargetPlacement.ts` reproduces this: it reuses the exact same
normalized-(0-1)-to-on-screen-pixel "cover" mapping the 2D SVG overlay already uses
(`computeCoverTransform`/`mapPoint` from `src/overlay/coordinateMapping.ts`), then multiplies by
`PixelRatio.get()` before calling the hit test - the same two-step conversion the library's own
internal feature does.

### Shape simplification: every target is a sphere + label, not box/path

You explicitly left this as my call. Every target - regardless of whether Gemini marked it `box`,
`circle`, `point`, or `path` in 2D - renders as the same small sphere + billboarded text label in
AR. Reproducing a box or path shape faithfully in 3D would need either several hit tests per
corner/point (each of which can land on a different real-world depth, since AR hit-testing has no
guarantee that, say, a bounding box's four corners are on the same real-world plane - the result
could easily come out warped or non-planar) or assuming a single flat depth for the whole shape
(which would just be a guess dressed up as geometry). A single well-placed, readable marker is more
useful and far more robust than a shape that might render distorted - especially for a first pass
of the actual placement mechanism, which is the part worth getting right before investing in shape
fidelity.

### Graceful hit-test misses

Not every target will land on a real surface - Gemini reasons over the flat captured image; ARKit/
ARCore reasons over whatever it's actually mapped of the real 3D scene so far, and those two views
routinely disagree at the pixel level (early in a session before much has been scanned, or for a
target on a feature-poor surface like bare wire or dark plastic). `arTargetPlacement.ts` treats a
failed/empty hit test as "skip this one target," never a crash, and reports how many were skipped
via the "targets placed: X/Y" badge next to the AR tracking indicator. **A target being skipped is
expected, routine behavior, not necessarily a bug** - but if most/all targets are consistently
skipped, that's the signal something's off (see the checklist below).

### What was verified from this sandbox (no Mac needed for these)

- `npx tsc --noEmit` passes cleanly, including the `as unknown as` cast needed for
  `initialScene.scene` (ViroARSceneNavigator's shipped `.d.ts` types it as a zero-argument
  function; its shipped `.js` always calls it with props - a real type/runtime mismatch in the
  library, not something papered over to dodge a real error).
- `npx expo export --platform ios` succeeds, and the `--dev` bundle contains
  `performARHitTestWithPoint`, `createAnchoredNode`, `ArAnchoredTargets`, and the hit-test priority/
  fallback logic - confirming this code is actually reachable in the shipped bundle, not dead code.
- `npx expo prebuild --clean` still succeeds with the same `ios/Podfile` wiring as Phases A/B - no
  new native dependency was needed for this phase.

### What "it worked" looks like

1. Ask a question the same way as Phase B. Once Gemini responds, watch the "AR tracking" badge -
   it should briefly show `targets placed: X/Y` (Y = however many targets Gemini returned).
2. **The core thing to check:** do small cyan/amber sphere markers with text labels appear roughly
   where the relevant wire/component actually is? As you move the phone around that area, do they
   **stay visually locked to that real point** - not drift, not follow the screen?
3. If there's a source+destination pair, is there a line connecting them?
4. Ask a *different* question. Do the old markers disappear and get replaced by new ones (not
   accumulate)? This also indirectly confirms the `viroAppProps` fix above actually works, since a
   second question's targets reaching the scene at all depends on it.
5. If the badge shows fewer placed than total, that's an expected hit-test miss per target (see
   above) - not necessarily wrong, but worth noting which ones and whether it seems to correlate
   with a specific type of surface (bare wire vs. a component body, for instance).

**Phase C result: core mechanism confirmed working on a real device.** Markers appear and the
graceful-skip diagnostic works correctly (`targets placed: 1/2 (1 no surface found)` observed).
Three real issues came out of that test - fixes below.

## Phase C fixes: label scale, hit-test misses, voice regression

**As with every phase, this was fixed and verified from a Linux sandbox with no device access -
all three need your on-device re-test to confirm.**

### 1. Oversized marker text - fixed, needs a size check on-device

Cause, confirmed by reading ViroReact's own shipped source: `ViroText`'s `fontSize` is not meters.
The library's own internal usage (`StudioARScene.js`'s Quest placement prompt: `fontSize: 14`, no
`scale` override, positioned 2m from the camera) is a large on-screen HUD message meant to fill a
good part of the view - the exact same `fontSize`/no-scale pattern I'd used for a marker label
meant to sit a few centimeters from a real component. There's no documented meters-per-fontSize
conversion to calculate a "correct" small fontSize from, and it can't be measured without a device,
so `ArAnchoredTargets.tsx` now shrinks the whole label with an explicit `scale={[0.05, 0.05, 0.05]}`
(`LABEL_SCALE`) instead of guessing at fontSize directly - a flat, predictable, linearly-tunable
factor (double it to double the size) regardless of what fontSize maps to internally.
**This specific factor (0.05) is a first estimate, not verified against a real device** - if labels
are still oversized, or now too small to read, that's the one number to adjust
(`ar-poc/ArAnchoredTargets.tsx`'s `LABEL_SCALE`), linearly.

### 2. Hit-test misses - one real bug fixed, one legitimate fallback added, one inherent limitation documented

You asked whether this was a bug or inherent - it's both, and here's the breakdown:

- **A real bug, found by re-reading `targetCenter()`:** for a path/wire-shaped target, the hit-test
  point was the path's **bounding-box center** (midpoint of its min/max x and y) - not a point
  actually on the path. For anything but a straight wire, that computed point isn't guaranteed to
  land anywhere near the wire itself (an L-shaped or diagonal wire's bounding-box center can fall
  in the empty space it bends around - e.g. onto the bedsheet behind/beside it, not the wire).
  Fixed: it now uses the path's own middle vertex - a point Gemini actually placed on the wire.
- **A legitimate, bounded fallback, now added:** if the exact point still misses, `arTargetPlacement.ts`
  retries a small ring of nearby points (up to ~3.5% of the frame away, 8 tries) before giving up.
  This is a standard AR UX pattern - feature detection is inherently a little noisy, and a real
  surface a few pixels away from a miss is routine - and it doesn't fake anything: every retry point
  is a real hit test, and the bound keeps a successful retry visually right next to the original
  point. The Metro log now says `placed via nearby (dx=…, dy=…) retry` when this happens, so you
  can see how often it's needed.
- **Deliberately NOT done: falling back to the nearest already-detected plane regardless of
  distance.** That could place a marker on a real but unrelated surface (the table instead of the
  small part sitting on it) - a confidently wrong pointer is worse than an honest skip for a tool
  whose entire point is precision, so this wasn't implemented. This is the "don't fake precision"
  line you drew, applied.
- **A genuine, inherent limitation, not fixable in code:** ARKit/ARCore can only return a hit-test
  result where it has actually built up 3D understanding of the scene - a plain surface (bedsheet,
  blank wall) or an area the camera hasn't looked at/moved around yet will legitimately have no
  hit-testable geometry there, full stop. No amount of retrying invents 3D data that was never
  captured. **Practical implication worth testing:** if a miss correlates with "I just pointed the
  camera there and immediately asked" rather than "I'd been looking at that area for a bit," that's
  this limitation, not a bug - moving the phone slightly around the target area for a second or two
  before asking should measurably reduce misses. Worth specifically checking on the next test.

### 3. Voice regression - logging improved, one low-risk change made, root cause NOT confirmed

Per your instruction, this is reported honestly rather than guessed at. I traced through the entire
Phase C diff line by line looking for anything that could plausibly stop `Speech.speak()` from
firing or succeeding, and found **no definitive bug**. Specifically ruled out:
- The AR scene/`ViroARScene` isn't remounting when targets update (confirmed by re-tracing
  `ViroARSceneNavigator`'s `_renderSceneStackItems`/`componentDidUpdate` - same mechanism verified
  for the `viroAppProps` fix) - so this isn't an unmount interrupting speech mid-call.
- No Viro sound/audio component was added in Phase C that could claim an `AVAudioSession` category
  ViroReact might not already have been holding in Phase B (which also used the AR camera + mic
  permission and had working voice) - weakens "ViroReact's audio session now conflicts with TTS" as
  an explanation, since the underlying AR/audio setup didn't change between the two phases.
- Found and fixed one real, independent gap while looking: `ArMainScene.tsx`'s placement effect had
  no `.catch()` on the `placeTargets(...).then(...)` chain - an unexpected error there would become
  an unhandled promise rejection (RN just logs a warning for these, doesn't crash), leaving the
  placement status badge silently stuck on stale data. Fixed regardless of whether it's related to
  voice - it's a real robustness gap either way.

**What was actually changed, clearly labeled as a hypothesis, not a fix:** `ArMainApp.tsx`'s
`handleAsk` now calls `speakInstruction(...)` *before* `setTargets(...)`, so the TTS engine's native
call is issued before the state update that kicks off the AR placement effect's burst of
`performARHitTestWithPoint`/`createAnchoredNode` native calls, rather than in the same tick. This is
a safe, harmless reordering (the two are independent side effects with no data dependency) that
might reduce native-bridge contention around the same moment - it is **not** a confirmed fix.

**What I need from the next test:** the same `[speech]` log lines as before (does `speak() called`
appear? does `onStart` fire? does `onError` fire, and with what message?), and ideally whether it
correlates with the `[ar-anchor] placement pass starting`/`done` log lines happening around the
same time. If `onStart` never fires, that points at the TTS engine/audio session; if it fires but no
sound plays, that's a different class of issue (per the existing "Diagnosing silent TTS" section
below). Please paste the exact log sequence rather than just "it didn't work" - that's what turns
this from a guess into an actual diagnosis.

**Update after the placement-loop bug below was found and fixed:** that bug means the AR placement
effect was firing continuously, not once - a real, ongoing burst of native `performARHitTestWithPoint`/
`createAnchoredNode` calls (not the brief one-time burst I'd assumed above) is a substantially
stronger candidate for interfering with `Speech.speak()`'s own native call than the "same tick"
theory this section was originally written around. Still not confirmed - but worth specifically
checking whether voice comes back once the loop fix (below) is in place, before looking any further.

## Phase C fix: placement running in a continuous loop instead of once per response

**Real bug, found from your on-device Metro logs** (multiple `placement pass starting for 2
target(s)` lines firing repeatedly for the same response, no new question asked) - not something
I could have caught from this sandbox alone; device log evidence is what found it.

### Root cause

`ArMainScene.tsx`'s placement `useEffect` depended on `[targets, frameSize, containerSize]` - three
values coming from `ArMainApp.tsx` via `viroAppProps`. `targets` itself was reference-stable (only
changes when `setTargets` is called), but `containerSize` was not: `ArMainApp.tsx`'s `onLayout`
handler called `setContainerSize({ width, height })` - a **brand-new object literal** - on every
single `onLayout` firing, even ones reporting the exact same size as before. `onLayout` was firing
repeatedly and continuously (plausibly from the AR view's own rendering marking the surrounding
native view hierarchy dirty, though the exact native trigger can't be confirmed from this sandbox -
the fix doesn't depend on knowing why, only that it was happening). React can't tell an
unchanged-but-newly-allocated object apart from a real change by reference, so every one of those
re-fired the placement effect - with the *same* targets, over and over, never anything new.

### The fix

Two changes, addressing this at both ends:

1. **The real fix - decouple "should a new pass start" from `frameSize`/`containerSize`
   entirely.** `ArMainApp.tsx` now increments a plain counter, `targetsGeneration`, exactly once
   per real `/api/analyze` response (`setTargetsGeneration((g) => g + 1)`, right next to
   `setTargets`). `ArMainScene.tsx`'s placement effect now depends on **only** `targetsGeneration`
   - a primitive number, immune to the "new object, same content" problem entirely. `frameSize`/
   `containerSize` are still needed for the hit-test math, but are now read via a ref (always
   current, updated every render, never itself triggers the effect) rather than the dependency
   array - correctly reflecting that they're *inputs* to a placement pass, not a *signal* that one
   should start.

   A content-derived key (e.g. joining target IDs) was considered instead and rejected: the
   backend does not guarantee target IDs are unique *across* separate responses - the mock
   provider generates simple per-call indices like `source-0`, and nothing in the Gemini prompt
   schema requires otherwise - so two genuinely different real responses could plausibly produce
   the same ID set and an ID-based key would then silently fail to trigger a new placement pass,
   which would be a regression on top of a regression. A response-generation counter has no such
   ambiguity: every real answer from the backend is unconditionally new, regardless of what its
   targets contain.

2. **Defense in depth - stop the redundant `onLayout` churn at its source too.** `ArMainApp.tsx`'s
   `onLayout` handler now compares the incoming width/height against the current `containerSize`
   and returns the *same* state object (`prev`) when they match, letting React's `setState`
   bail-out skip the re-render entirely instead of just hoping nothing downstream reacts to it.
   This isn't required for the loop fix (fix 1 alone breaks the cycle), but it's a real,
   independent improvement - unnecessary re-renders of the whole AR tree on every redundant layout
   event were happening regardless of what caused them.

### What was verified from this sandbox (no Mac needed for these)

- `npx tsc --noEmit` passes cleanly with the new `targetsGeneration` prop threaded through
  `ArMainApp.tsx` → `viroAppProps` → `ArMainScene.tsx`.
- `npx expo export --platform ios` succeeds, and the `--dev` bundle contains `targetsGeneration`
  at the expected call sites.

**Confirmed fixed on-device:** exactly one placement pass per response now, verified from your
Metro logs.

## Phase C investigation: markers placing at the wrong location

**New bug found on-device:** placement now succeeds (`"2 placed, 0 skipped"`), but a target Gemini
located near the bottom of the frame rendered near the top of the screen instead - a genuine
coordinate-mapping bug, not a hit-testing limitation (the previous fixes already proved hit-testing
itself works when given a correct point).

### What was checked, and what's still an open question

I re-traced the full transform chain (Gemini's normalized point → `computeCoverTransform`/
`mapPoint` → dp → `* PixelRatio.get()` → `performARHitTestWithPoint`) and re-verified the "cover"
math itself (`src/overlay/coordinateMapping.ts`) is algebraically correct for a top-left-origin,
y-down convention with no sign or axis-swap bug - it's the same, unmodified math the 2D SVG overlay
uses. I worked out on paper what a pure `frameSize`/`containerSize` aspect-ratio mismatch would
actually produce: for one direction of mismatch it pushes a point *beyond* the container's edge
(a miss, not a relocation to the opposite edge); for the other, it doesn't distort the Y axis at
all. Neither cleanly produces "bottom becomes top" on its own, which is a genuine, symmetric-looking
inversion - so a **Y-axis flip is the strongest single-cause hypothesis**: either Gemini's normalized
y is measured from a different edge than assumed here (unlikely, since this is the same convention
the already-working 2D overlay uses), or - more likely, and something Phase B's "content is
accurate" confirmation never actually tested - an orientation/EXIF mismatch between the pixel
buffer `frameSize` describes (from `manipulateAsync`'s resize output) and the one Gemini actually
analyzed. **This is a hypothesis to test against real data, not a diagnosis** - I have no device to
inspect an actual screenshot's orientation metadata, and guessed compensations aren't going in
without evidence per your instruction.

### Diagnostic logging added (no behavior change)

`arTargetPlacement.ts` now logs, for every hit-test attempt:
- `frameSize`/`containerSize` (dimensions and derived aspect ratio) once per placement pass, with
  an explicit `⚠` warning if they differ by more than 3% - directly surfaces a crop/letterboxing
  mismatch between the captured screenshot and what's on-screen, if there is one.
- Per target: the original normalized `(nx, ny)`, the computed on-screen dp point, the final
  device-pixel point actually handed to `performARHitTestWithPoint`, and the `PixelRatio.get()`
  value used - the full chain, in one place, per attempt (including retries).
- Per target: where the point would have landed **if the Y axis were flipped** (`1 - ny`) -
  purely so it can be compared against the real device-pixel point and, most usefully, against
  where the marker actually rendered on your screen. If the flipped point lines up with reality and
  the unflipped one doesn't, that confirms the Y-flip hypothesis directly from the log rather than
  from another guess.

`ArMainApp.tsx` also now logs `ViroARSceneNavigator`'s own `onLayout` size separately from
`cameraWrap`'s (which is what actually feeds `containerSize`) - `style={StyleSheet.absoluteFill}`
*should* make these identical, but that's an assumption I haven't verified on-device. If they
differ, `containerSize` has been coming from the wrong view this whole time.

### What was verified from this sandbox (no Mac needed for these)

- `npx tsc --noEmit` passes cleanly with the new logging and its plumbing.
- `npx expo export --platform ios` succeeds.

**What I need from you:** re-run the same test and paste the full `[ar-anchor:coords]` log block
for the misplaced target, plus roughly where the marker actually appeared vs. where the purple wire
actually was (e.g. "marker showed up near the top third of the screen, wire was in the bottom
quarter"). With the normalized point, the dp point, the device-pixel point, the flipped-point
comparison, the frame/container aspect ratios, and the two `onLayout` sizes all in one log, this
should go from "investigate" to "confirmed fix" in one more round rather than another guess.

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

import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ViroARSceneNavigator, ViroTrackingStateConstants, requestRequiredPermissions } from "@reactvision/react-viro";
import type { ViroTrackingReason, ViroTrackingState } from "@reactvision/react-viro";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";

import { ApiError, callAnalyze } from "../src/api";
import type { VisionProviderRequest, VisualTarget } from "../src/types";
import type { Size } from "../src/overlay/coordinateMapping";
import ArMainScene from "./ArMainScene";

/**
 * The real app flow (ask a question, capture a frame, call the backend, speak the answer), but
 * with ViroReact's AR camera (ViroARSceneNavigator + takeScreenshot) as the camera layer instead
 * of expo-camera's CameraView + takePictureAsync (Phase B), and Gemini's returned targets
 * rendered as real, world-anchored AR content instead of a 2D overlay (Phase C). Only reachable
 * behind EXPO_PUBLIC_AR_POC=1 (see index.ts) - App.tsx and its expo-camera/gyroscope-overlay flow
 * are untouched and are exactly what runs with the flag off.
 *
 * A screenshot from takeScreenshot() is the AR renderer's own composited output (whatever
 * format/resolution ViroReact chooses to write - not necessarily JPEG, and not necessarily
 * RESIZE_MAX_WIDTH-sized), so it's piped through the same expo-image-manipulator resize/JPEG-
 * recompress step App.tsx already uses for expo-camera photos. That step decodes whatever image
 * format the input file actually is - it doesn't require knowing that format up front - so it
 * both normalizes the payload to what the backend expects (JPEG, ~896px, matching frameCapture.ts
 * on the web app) AND sidesteps needing to guess/sniff takeScreenshot's real output format from
 * this sandbox, where that can't be observed directly. (Phase B result: confirmed correct on a
 * real device - orientation and content match what the camera was pointed at.)
 *
 * The actual AR target placement (hit-testing each target's 2D position, creating anchors,
 * rendering markers/labels/connectors) lives in arTargetPlacement.ts and ArAnchoredTargets.tsx,
 * run from inside ArMainScene.tsx - see that file for why `targets`/`frameSize`/`containerSize`
 * are threaded down via ViroARSceneNavigator's `viroAppProps` prop rather than passed as an
 * ordinary prop through `initialScene`'s scene factory.
 */

const RESIZE_MAX_WIDTH = 896;
const JPEG_QUALITY = 0.72;

type ScreenshotResult = { success: boolean; url?: string; errorCode?: number };
type PlacementStatus = { placed: number; skipped: number; total: number } | null;
type ViroAppProps = { targets: VisualTarget[]; targetsGeneration: number; frameSize: Size; containerSize: Size | null };

function describeSpeechFailure(startedFirst: boolean, err: Error): string {
  if (startedFirst) {
    return "The device's text-to-speech engine accepted the request but reported an error (or produced no sound). Check the device's media volume, and that a TTS voice is installed under Settings -> Accessibility -> Text-to-speech.";
  }
  return `Speech never started (native error: ${err.message}). The device's text-to-speech engine may not be set up - check Settings -> Accessibility -> Text-to-speech output.`;
}

export default function ArMainApp() {
  const navigatorRef = useRef<ViroARSceneNavigator>(null);
  const [permission, setPermission] = useState<"unknown" | "granted" | "denied">("unknown");
  const [trackingState, setTrackingState] = useState<ViroTrackingState>(ViroTrackingStateConstants.TRACKING_UNAVAILABLE);

  const [question, setQuestion] = useState("");
  const [userProblem, setUserProblem] = useState<string | null>(null);
  const [previousInstruction, setPreviousInstruction] = useState<string | null>(null);
  const [instruction, setInstruction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Phase C: AR target placement. containerSize/frameSize feed the same normalized-(0-1)-to-
  // on-screen-pixel "cover" mapping the gyroscope-tracked 2D overlay uses (src/overlay/
  // coordinateMapping.ts) - here its output is hit-tested into the AR world instead of drawn as
  // an SVG shape. See ArMainScene.tsx/arTargetPlacement.ts for the rest of the pipeline.
  const [containerSize, setContainerSize] = useState<Size | null>(null);
  const [frameSize, setFrameSize] = useState<Size>({ width: RESIZE_MAX_WIDTH, height: RESIZE_MAX_WIDTH });
  const [targets, setTargets] = useState<VisualTarget[]>([]);
  // Bumped once per real backend response (see handleAsk) - the actual signal ArMainScene.tsx's
  // placement effect keys off, not the targets array or its content. See the long comment in
  // ArMainScene.tsx for why: this app hit a real tight-loop bug where an unrelated, frequently-
  // recreated object (containerSize, from onLayout) was in that effect's dependency array and
  // kept retriggering placement with no new response at all.
  const [targetsGeneration, setTargetsGeneration] = useState(0);
  const [placementStatus, setPlacementStatus] = useState<PlacementStatus>(null);

  useEffect(() => {
    requestRequiredPermissions(["camera"]).then((result) => setPermission(result.camera ? "granted" : "denied"));
  }, []);

  const speakInstruction = (text: string, label: string) => {
    setVoiceError(null);
    let started = false;
    console.log(`[speech] speak() called (${label}):`, JSON.stringify(text.slice(0, 80)));

    Speech.speak(text, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.95,
      volume: 1.0,
      onStart: () => {
        started = true;
        console.log(`[speech] onStart (${label})`);
        setIsSpeaking(true);
      },
      onDone: () => {
        console.log(`[speech] onDone (${label})`);
        setIsSpeaking(false);
      },
      onStopped: () => {
        console.log(`[speech] onStopped (${label})`);
        setIsSpeaking(false);
      },
      onError: (err: Error) => {
        console.error(`[speech] onError (${label}), started=${started}:`, err);
        setIsSpeaking(false);
        setVoiceError(describeSpeechFailure(started, err));
      },
    });
  };

  const handleTrackingUpdated = (state: ViroTrackingState, _reason: ViroTrackingReason) => {
    setTrackingState(state);
  };

  // ViroARSceneNavigator's own type declares `initialScene.scene` as a zero-argument factory
  // (`() => JSX.Element`), but its real implementation (_renderSceneStackItems in
  // ViroARSceneNavigator.js) always invokes it as a genuine React component - with
  // `sceneNavigator`/`arSceneNavigator`/passProps as props - on every render, which is exactly
  // what's needed to read the live viroAppProps back out. The `as unknown as` cast below papers
  // over that type/runtime mismatch; it isn't hiding a real type error, the shipped .d.ts is just
  // narrower than the shipped .js.
  const arMainSceneFactory = (sceneProps: { arSceneNavigator?: { viroAppProps?: Partial<ViroAppProps> } }) => {
    const live = sceneProps?.arSceneNavigator?.viroAppProps;
    return (
      <ArMainScene
        targets={live?.targets ?? []}
        targetsGeneration={live?.targetsGeneration ?? 0}
        frameSize={live?.frameSize ?? frameSize}
        containerSize={live?.containerSize ?? null}
        onTrackingStateChange={handleTrackingUpdated}
        onPlacementStatusChange={setPlacementStatus}
      />
    );
  };

  const handleAsk = async () => {
    const text = question.trim();
    if (!text || isBusy) return;
    // Independent safety net (kept from the abandoned square-view attempt, where it caught a
    // real crash): never attempt a screenshot before the AR view has reported a real, non-zero
    // measured size - a native ImageLoadingFailedException is what happens otherwise, capturing
    // a view that hasn't actually rendered anything yet.
    if (!navigatorRef.current || !containerSize || containerSize.width <= 0 || containerSize.height <= 0) {
      setErrorMessage("AR camera isn't ready yet - point it at your circuit and wait a moment.");
      return;
    }

    Keyboard.dismiss();
    setIsBusy(true);
    setErrorMessage(null);

    try {
      // 1. Screenshot the AR renderer's composited output (camera passthrough + any 3D content -
      // none yet, in this phase) instead of expo-camera's takePictureAsync.
      const shot = (await navigatorRef.current.arSceneNavigator.takeScreenshot(
        `ar_capture_${Date.now()}`,
        false,
      )) as ScreenshotResult;
      if (!shot.success || !shot.url) {
        throw new Error(`AR screenshot failed (errorCode: ${shot.errorCode ?? "unknown"}).`);
      }

      // 2. Normalize to JPEG at the same size/quality the backend expects everywhere else - see
      // the file-level comment for why this step also sidesteps needing to know the screenshot's
      // raw format.
      const resized = await manipulateAsync(shot.url, [{ resize: { width: RESIZE_MAX_WIDTH } }], {
        compress: JPEG_QUALITY,
        format: SaveFormat.JPEG,
        base64: true,
      });
      if (!resized.base64) throw new Error("Failed to encode the captured frame.");
      const frameDataUrl = `data:image/jpeg;base64,${resized.base64}`;
      // Targets' normalized (0-1) coordinates are relative to this exact resized frame, so its
      // pixel size has to be captured alongside them for the hit-test mapping in ArMainScene.tsx.
      setFrameSize({ width: resized.width, height: resized.height });

      // 3. Call the existing Next.js backend - identical request shape to App.tsx/the web app.
      const isFirstMessage = !userProblem;
      const payload: VisionProviderRequest = {
        frameDataUrl,
        mode: isFirstMessage ? "initial" : "followup",
        userMessage: text,
        problemDescription: userProblem ?? text,
        previousInstruction,
        expectedNextState: null,
        previousObservations: [],
        detectedComponents: [],
        conversationTail: [],
        verifyAttempt: 0,
      };

      const response = await callAnalyze(payload);
      if (isFirstMessage) setUserProblem(text);
      setQuestion("");
      setInstruction(response.instruction);
      setPreviousInstruction(response.instruction || previousInstruction);

      // Speak first, then hand off targets for AR placement. Voice stopped working in on-device
      // Phase C testing (it worked in Phase B, same AR+microphone setup) and no definitive cause
      // was found from static review - see the README's Phase C fixes section for what was ruled
      // out. This ordering is a low-risk, easily-reverted hypothesis (don't kick off the
      // hit-test/anchor-creation burst - a handful of native AR calls - in the same tick as the
      // speech call), not a confirmed fix. The [speech] logs below plus [ar-anchor] logs from
      // ArMainScene's placement effect together should show, on the next real-device run, whether
      // onStart ever fires and how its timing relates to the AR placement work.
      const spokenText = response.spokenInstruction || response.instruction;
      if (spokenText) speakInstruction(spokenText, "analyze-response");

      // Hand the new targets to ArMainScene (via viroAppProps below) for AR hit-test placement.
      // Unlike App.tsx's gyroscope-compensated 2D overlay, there's no capture-moment snapshot or
      // pixel-offset math needed here - each marker gets hit-tested into real 3D world space once
      // and then just stays there, tracked by ARKit/ARCore itself like any other AR content.
      setTargets(response.targets);
      // Every real response is unconditionally a new generation - see the comment on
      // targetsGeneration's declaration above and in ArMainScene.tsx for why this, not the
      // targets array/content, is what actually triggers a new placement pass.
      setTargetsGeneration((g) => g + 1);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Something went wrong.";
      setErrorMessage(message);
    } finally {
      setIsBusy(false);
    }
  };

  if (permission === "unknown") {
    // Permission status is still loading.
    return <View style={styles.container} />;
  }

  if (permission === "denied") {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          AI Visual Expert needs camera access for AR tracking of your circuit.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => requestRequiredPermissions(["camera"]).then((r) => setPermission(r.camera ? "granted" : "denied"))}
        >
          <Text style={styles.buttonText}>Grant camera access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="light" />
      <View
        style={styles.cameraWrap}
        onLayout={(e) => {
          // Guard against a real bug found on-device: onLayout can fire repeatedly (observed
          // happening continuously here, plausibly from the AR view's own rendering marking the
          // native view hierarchy dirty) reporting the *same* size every time. Naively calling
          // setContainerSize({width, height}) on every firing creates a brand-new object each
          // time even when nothing changed, and that reference churn was silently retriggering
          // ArMainScene's placement effect in a tight loop (see the long comment there and in
          // handleAsk's targetsGeneration for the full fix). Returning the previous state object
          // unchanged when the size is actually the same lets React's setState bail out and skip
          // the re-render entirely, instead of just hoping downstream effects ignore it.
          const { width, height } = e.nativeEvent.layout;
          setContainerSize((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
        }}
      >
        {/* AR camera layer (Phase B) + AR-anchored target markers (Phase C). `viroAppProps` is
            the one channel ViroARSceneNavigator actually keeps in sync on an already-mounted
            scene after its first render - `initialScene.scene` is only invoked once, at mount,
            so a normal prop passed through it would freeze at whatever `targets` was on that very
            first render (an empty array) and never update again. Confirmed by reading
            ViroARSceneNavigator's own render()/componentDidUpdate - it explicitly re-syncs
            `this.arSceneNavigator.viroAppProps` from `this.props.viroAppProps` on every render,
            and componentDidUpdate does not do the same for `initialScene`. ArMainScene.tsx reads
            these back out via the scene factory's own `arSceneNavigator` prop. */}
        <ViroARSceneNavigator
          ref={navigatorRef}
          style={StyleSheet.absoluteFill}
          viroAppProps={{ targets, targetsGeneration, frameSize, containerSize } satisfies ViroAppProps}
          initialScene={{ scene: arMainSceneFactory as unknown as () => React.JSX.Element }}
          // Diagnostic only, for the misplaced-marker investigation - does NOT feed containerSize;
          // `style={StyleSheet.absoluteFill}` should make this identical to cameraWrap's own
          // onLayout above, but that's an assumption, not something verified on-device. If this
          // logs a different size than the "[ar-anchor:coords] frameSize=.../containerSize=..."
          // line, that's the mismatch: containerSize would be coming from the wrong view.
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            console.log(`[ar-anchor:coords] ViroARSceneNavigator's own onLayout: ${width}x${height}`);
          }}
        />
        {isSpeaking && (
          <View style={styles.speakingBadge}>
            <Text style={styles.speakingBadgeText}>Speaking…</Text>
          </View>
        )}
        <View style={styles.trackingBadge}>
          <Text style={styles.trackingBadgeText}>
            AR tracking: {trackingState === ViroTrackingStateConstants.TRACKING_NORMAL ? "normal" : "initializing…"}
            {placementStatus &&
              ` · targets placed: ${placementStatus.placed}/${placementStatus.total}${
                placementStatus.skipped > 0 ? ` (${placementStatus.skipped} no surface found)` : ""
              }`}
          </Text>
        </View>
      </View>

      <View style={styles.panel}>
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        {instruction && <Text style={styles.instructionText}>{instruction}</Text>}
        {!instruction && !errorMessage && (
          <Text style={styles.hintText}>
            AR camera + world-anchored targets. Point the camera at your circuit and ask a question below.
          </Text>
        )}

        {voiceError && <Text style={styles.errorText}>⚠ Voice error: {voiceError}</Text>}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={question}
            onChangeText={setQuestion}
            placeholder="What's wrong with this circuit?"
            placeholderTextColor="#6b7280"
            editable={!isBusy}
            onSubmitEditing={handleAsk}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.askButton, (isBusy || !question.trim()) && styles.askButtonDisabled]}
            onPress={handleAsk}
            disabled={isBusy || !question.trim()}
          >
            {isBusy ? <ActivityIndicator color="#022c33" /> : <Text style={styles.askButtonText}>Ask</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  permissionText: {
    color: "#e5e7eb",
    textAlign: "center",
    marginHorizontal: 24,
    marginBottom: 16,
    fontSize: 15,
  },
  button: {
    backgroundColor: "#22d3ee",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: { color: "#022c33", fontWeight: "600" },
  cameraWrap: { flex: 1, position: "relative" },
  speakingBadge: {
    position: "absolute",
    top: 56,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  speakingBadgeText: { color: "#34d399", fontSize: 12, fontWeight: "600" },
  trackingBadge: {
    position: "absolute",
    bottom: 12,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  trackingBadgeText: { color: "#9ca3af", fontSize: 10, fontWeight: "500" },
  panel: {
    backgroundColor: "#111827",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    gap: 12,
  },
  hintText: { color: "#9ca3af", fontSize: 13 },
  instructionText: { color: "#f3f4f6", fontSize: 15, lineHeight: 21 },
  errorText: { color: "#f87171", fontSize: 13 },
  inputRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: {
    flex: 1,
    backgroundColor: "#1f2937",
    color: "#f3f4f6",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  askButton: {
    backgroundColor: "#22d3ee",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  askButtonDisabled: { opacity: 0.4 },
  askButtonText: { color: "#022c33", fontWeight: "700" },
});

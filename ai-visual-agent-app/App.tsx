import { useRef, useState } from "react";
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
import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import * as Speech from "expo-speech";
import { StatusBar } from "expo-status-bar";

import { ApiError, callAnalyze } from "./src/api";
import type { VisionProviderRequest } from "./src/types";
import { CameraOverlay } from "./src/overlay/CameraOverlay";
import { useTrackedTargets } from "./src/overlay/useTrackedTargets";
import type { Size } from "./src/overlay/coordinateMapping";

// Matches the web app's frameCapture.ts convention (896px max dimension, JPEG quality 0.72) so
// the backend sees comparable payload sizes/latency regardless of which client calls it.
const RESIZE_MAX_WIDTH = 896;
const JPEG_QUALITY = 0.72;
const CAMERA_FACING: CameraType = "back";

/**
 * expo-speech's Android event bridge does not pass a real error message for the
 * "Exponent.speakingError" event (see node_modules/expo-speech/src/Speech.ts - it does
 * `new Error(error)` where `error` is always undefined on Android), so onError's `.message` is
 * never anything more useful than "undefined". The likely cause has to be inferred from *whether*
 * onStart fired at all - see the on-device diagnosis notes in README.md.
 */
function describeSpeechFailure(startedFirst: boolean, err: Error): string {
  if (startedFirst) {
    // onStart fired (the TTS engine accepted and began the utterance) but it still ended in
    // error, or produced no sound - almost always a device-level TTS/audio-routing issue, not a
    // bug in this app: media volume muted, no TTS voice data downloaded for the selected
    // language, or the wrong output route (e.g. a disconnected Bluetooth device still selected).
    return "The device's text-to-speech engine accepted the request but reported an error (or produced no sound). Check the device's media volume, and that a TTS voice is installed under Settings -> Accessibility -> Text-to-speech.";
  }
  // onStart never fired at all - the TTS engine itself likely failed to initialize (no default
  // engine configured/enabled on the device) or rejected the request outright.
  return `Speech never started (native error: ${err.message}). The device's text-to-speech engine may not be set up - check Settings -> Accessibility -> Text-to-speech output.`;
}

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const [question, setQuestion] = useState("");
  const [userProblem, setUserProblem] = useState<string | null>(null);
  const [previousInstruction, setPreviousInstruction] = useState<string | null>(null);
  const [instruction, setInstruction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [testVoiceState, setTestVoiceState] = useState<"idle" | "testing" | "done">("idle");

  // Pixel size of the on-screen camera preview (from onLayout) and of the analyzed frame (from
  // the last capture's resize) - both needed to map Gemini's normalized target coordinates onto
  // the live preview. See src/overlay/coordinateMapping.ts.
  const [containerSize, setContainerSize] = useState<Size | null>(null);
  const [frameSize, setFrameSize] = useState<Size>({ width: RESIZE_MAX_WIDTH, height: RESIZE_MAX_WIDTH });
  const { activeTargets, pixelOffset, markCaptureMoment, setTargets, motionAvailable } =
    useTrackedTargets(containerSize);

  /**
   * Single place that calls Speech.speak() - always with explicit options (never relying on
   * device defaults for language/pitch/rate/volume) and always with every event logged, so a
   * silent on-device failure shows up in the Metro log instead of just... nothing. See README.md
   * "Diagnosing silent TTS" for how to read these logs live from a phone.
   */
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

  const handleTestVoice = () => {
    setTestVoiceState("testing");
    speakInstruction("Voice test successful.", "test-voice");
    // There is no reliable "it definitely played audio" signal from expo-speech (onStart/onDone
    // only report the engine's own bookkeeping, not audible output - the same class of problem
    // the web app's Test Voice flow was built around) - so this just marks the attempt as made;
    // the real answer is whether you heard it, and what the Metro log shows for this attempt.
    setTestVoiceState("done");
  };

  const handleAsk = async () => {
    const text = question.trim();
    if (!text || isBusy) return;
    if (!cameraRef.current || !cameraReady) {
      setErrorMessage("Camera isn't ready yet - point it at your circuit and wait a moment.");
      return;
    }

    Keyboard.dismiss();
    setIsBusy(true);
    setErrorMessage(null);

    try {
      // 1. Capture a still frame from the live camera. This is ONLY the frame sent to the
      // backend for analysis - the live preview (CameraView below) keeps rendering the whole
      // time and is never paused, so the user always sees the real live feed, never a frozen
      // photo. Snapshot the current motion-tracking anchor at the same moment, so the eventual
      // response's targets can be aligned back to whatever the camera has moved to by then.
      const captureSnapshot = markCaptureMoment();
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      if (!photo) throw new Error("Failed to capture a frame from the camera.");

      // 2. Downscale + compress to match the backend's expected payload size (this is the same
      // resize step the web app does client-side in frameCapture.ts before upload).
      const resized = await manipulateAsync(photo.uri, [{ resize: { width: RESIZE_MAX_WIDTH } }], {
        compress: JPEG_QUALITY,
        format: SaveFormat.JPEG,
        base64: true,
      });
      if (!resized.base64) throw new Error("Failed to encode the captured frame.");
      const frameDataUrl = `data:image/jpeg;base64,${resized.base64}`;
      setFrameSize({ width: resized.width, height: resized.height });

      // 3. Call the existing Next.js backend - identical request shape to the web app.
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
      // Hand the new targets to the tracker along with the motion snapshot from the moment the
      // analyzed frame was captured - it uses the difference between that and now to keep the
      // overlay roughly aligned with the live camera instead of snapping to a stale position.
      setTargets(response.targets, captureSnapshot);

      // 4. Speak the result with native TTS - no browser speechSynthesis anywhere.
      const spokenText = response.spokenInstruction || response.instruction;
      if (spokenText) speakInstruction(spokenText, "analyze-response");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Something went wrong.";
      setErrorMessage(message);
    } finally {
      setIsBusy(false);
    }
  };

  if (!permission) {
    // Permission status is still loading.
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>AI Visual Expert needs camera access to see your circuit.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant camera access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" />
      <View
        style={styles.cameraWrap}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setContainerSize({ width, height });
        }}
      >
        {/* This is the ONLY camera element - it renders continuously and is never paused, even
            while a frame is captured/analyzed/spoken. takePictureAsync() (in handleAsk) grabs a
            still frame for the backend without affecting this live preview at all. */}
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={CAMERA_FACING}
          onCameraReady={() => setCameraReady(true)}
        />
        <CameraOverlay
          targets={activeTargets}
          frameSize={frameSize}
          containerSize={containerSize}
          pixelOffset={pixelOffset}
        />
        {isSpeaking && (
          <View style={styles.speakingBadge}>
            <Text style={styles.speakingBadgeText}>Speaking…</Text>
          </View>
        )}
        {activeTargets.length > 0 && (
          <View style={styles.trackingBadge}>
            <Text style={styles.trackingBadgeText}>
              {motionAvailable ? "Tracking: motion-compensated" : "Tracking: static (no gyroscope)"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.panel}>
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        {instruction && <Text style={styles.instructionText}>{instruction}</Text>}
        {!instruction && !errorMessage && (
          <Text style={styles.hintText}>Point the camera at your circuit and ask a question below.</Text>
        )}

        {voiceError && (
          <Text style={styles.errorText}>
            ⚠ Voice error: {voiceError}
          </Text>
        )}
        <TouchableOpacity style={styles.testVoiceButton} onPress={handleTestVoice}>
          <Text style={styles.testVoiceButtonText}>Test Voice</Text>
        </TouchableOpacity>
        {testVoiceState === "done" && (
          <Text style={styles.hintText}>
            Did you hear "Voice test successful."? Check the Metro terminal for [speech] logs either way.
          </Text>
        )}

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
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
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
  buttonText: {
    color: "#022c33",
    fontWeight: "600",
  },
  cameraWrap: {
    flex: 1,
    position: "relative",
  },
  speakingBadge: {
    position: "absolute",
    top: 56,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  speakingBadgeText: {
    color: "#34d399",
    fontSize: 12,
    fontWeight: "600",
  },
  trackingBadge: {
    position: "absolute",
    bottom: 12,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  trackingBadgeText: {
    color: "#9ca3af",
    fontSize: 10,
    fontWeight: "500",
  },
  panel: {
    backgroundColor: "#111827",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    gap: 12,
  },
  hintText: {
    color: "#9ca3af",
    fontSize: 13,
  },
  instructionText: {
    color: "#f3f4f6",
    fontSize: 15,
    lineHeight: 21,
  },
  errorText: {
    color: "#f87171",
    fontSize: 13,
  },
  testVoiceButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  testVoiceButtonText: {
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
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
  askButtonDisabled: {
    opacity: 0.4,
  },
  askButtonText: {
    color: "#022c33",
    fontWeight: "700",
  },
});

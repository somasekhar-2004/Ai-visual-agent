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
import type { VisionProviderRequest } from "../src/types";
import ArMainScene from "./ArMainScene";

/**
 * Phase B: the real app flow (ask a question, capture a frame, call the backend, speak the
 * answer), but with ViroReact's AR camera (ViroARSceneNavigator + takeScreenshot) as the camera
 * layer instead of expo-camera's CameraView + takePictureAsync. Only reachable behind
 * EXPO_PUBLIC_AR_POC=1 (see index.ts) - App.tsx and its expo-camera flow are untouched and are
 * exactly what runs with the flag off.
 *
 * Deliberately NOT included yet (Phase C): rendering Gemini's returned targets as AR-anchored
 * content, or any 2D-tap/hit-test placement. This phase only proves the AR camera layer itself -
 * live preview, plane detection running in the background, and a real screenshot -> /api/analyze
 * -> spoken response round trip.
 *
 * A screenshot from takeScreenshot() is the AR renderer's own composited output (whatever
 * format/resolution ViroReact chooses to write - not necessarily JPEG, and not necessarily
 * RESIZE_MAX_WIDTH-sized), so it's piped through the same expo-image-manipulator resize/JPEG-
 * recompress step App.tsx already uses for expo-camera photos. That step decodes whatever image
 * format the input file actually is - it doesn't require knowing that format up front - so it
 * both normalizes the payload to what the backend expects (JPEG, ~896px, matching frameCapture.ts
 * on the web app) AND sidesteps needing to guess/sniff takeScreenshot's real output format from
 * this sandbox, where that can't be observed directly.
 */

const RESIZE_MAX_WIDTH = 896;
const JPEG_QUALITY = 0.72;

type ScreenshotResult = { success: boolean; url?: string; errorCode?: number };

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

  const handleAsk = async () => {
    const text = question.trim();
    if (!text || isBusy) return;
    if (!navigatorRef.current) {
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
      // Not wiring response.targets into any overlay yet - AR-anchored target placement is
      // Phase C. This phase only confirms the request/response round trip works.

      const spokenText = response.spokenInstruction || response.instruction;
      if (spokenText) speakInstruction(spokenText, "analyze-response");
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
      <View style={styles.cameraWrap}>
        {/* AR camera layer (Phase B) - replaces expo-camera's CameraView. No visible 3D content
            yet (that's Phase C); this is purely the live AR passthrough + background plane
            detection, exactly like ArPocScene.tsx proved works in Phase A. */}
        <ViroARSceneNavigator
          ref={navigatorRef}
          style={StyleSheet.absoluteFill}
          initialScene={{ scene: () => <ArMainScene onTrackingStateChange={handleTrackingUpdated} /> }}
        />
        {isSpeaking && (
          <View style={styles.speakingBadge}>
            <Text style={styles.speakingBadgeText}>Speaking…</Text>
          </View>
        )}
        <View style={styles.trackingBadge}>
          <Text style={styles.trackingBadgeText}>
            AR tracking: {trackingState === ViroTrackingStateConstants.TRACKING_NORMAL ? "normal" : "initializing…"}
          </Text>
        </View>
      </View>

      <View style={styles.panel}>
        {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
        {instruction && <Text style={styles.instructionText}>{instruction}</Text>}
        {!instruction && !errorMessage && (
          <Text style={styles.hintText}>
            Phase B: AR camera layer. Point the camera at your circuit and ask a question below.
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

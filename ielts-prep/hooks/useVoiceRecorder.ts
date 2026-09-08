import { RecordingPresets, requestRecordingPermissionsAsync, useAudioRecorder, setAudioModeAsync } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';

export function useVoiceRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function requestPermission() {
    const res = await requestRecordingPermissionsAsync();
    setPermissionGranted(res.granted);
    return res.granted;
  }

  useEffect(() => {
    requestRecordingPermissionsAsync().then((res) => setPermissionGranted(res.granted));
    setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true }).catch(() => {});
  }, []);

  /** Returns false (without starting) if microphone permission is missing —
   * callers must check this and show the user an explicit message rather
   * than silently proceeding as if recording were happening. */
  async function start(): Promise<boolean> {
    const granted = permissionGranted ?? (await requestPermission());
    if (!granted) return false;
    await recorder.prepareToRecordAsync();
    recorder.record();
    setIsRecording(true);
    setDurationSeconds(0);
    intervalRef.current = setInterval(() => setDurationSeconds((d) => d + 1), 1000);
    return true;
  }

  async function stop(): Promise<{ uri: string | null; durationSeconds: number }> {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    await recorder.stop();
    setIsRecording(false);
    return { uri: recorder.uri, durationSeconds };
  }

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
    []
  );

  return { isRecording, durationSeconds, start, stop, permissionGranted, requestPermission };
}

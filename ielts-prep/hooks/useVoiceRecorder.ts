import { RecordingPresets, requestRecordingPermissionsAsync, useAudioRecorder, setAudioModeAsync } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';

export function useVoiceRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    requestRecordingPermissionsAsync().then((res) => setPermissionGranted(res.granted));
    setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true }).catch(() => {});
  }, []);

  async function start() {
    if (permissionGranted === false) return;
    await recorder.prepareToRecordAsync();
    recorder.record();
    setIsRecording(true);
    setDurationSeconds(0);
    intervalRef.current = setInterval(() => setDurationSeconds((d) => d + 1), 1000);
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

  return { isRecording, durationSeconds, start, stop, permissionGranted };
}

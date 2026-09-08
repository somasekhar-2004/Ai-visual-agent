import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { ProgressBar, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';

const WORDS_PER_MINUTE = 150;

/** Plays a listening-section transcript aloud via on-device text-to-speech —
 * a stand-in "audio player" for demo mode, where no real audio file exists.
 * Once a real audioUrl is attached to a track, swap this for expo-audio's
 * useAudioPlayer / useAudioPlayerStatus (see services/repository/testing.ts). */
export function TranscriptAudioPlayer({ title, transcript }: { title: string; transcript: string }) {
  const theme = useTheme();
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const wordCount = transcript.trim().split(/\s+/).length;
  const estimatedSeconds = Math.max(10, Math.round((wordCount / WORDS_PER_MINUTE) * 60));

  useEffect(() => {
    return () => {
      Speech.stop();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function play() {
    setElapsed(0);
    setPlaying(true);
    Speech.speak(transcript, {
      rate: 0.95,
      onDone: stop,
      onStopped: stop,
      onError: stop,
    });
    intervalRef.current = setInterval(() => {
      setElapsed((e) => Math.min(estimatedSeconds, e + 1));
    }, 1000);
  }

  function stop() {
    setPlaying(false);
    Speech.stop();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Pressable
          onPress={playing ? stop : play}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={playing ? 'stop' : 'play'} size={22} color={theme.colors.onPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text variant="bodyMedium">{title}</Text>
          <Text variant="caption" color="tertiary">
            {playing ? 'Playing (simulated audio via text-to-speech)' : 'Tap play to listen'}
          </Text>
        </View>
      </View>
      <ProgressBar progress={elapsed / estimatedSeconds} />
    </View>
  );
}

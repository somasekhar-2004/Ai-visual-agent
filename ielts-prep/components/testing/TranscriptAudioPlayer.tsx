import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { ProgressBar, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { audioRegistry } from '@/lib/content/audioRegistry';

const WORDS_PER_MINUTE = 150;

type PlayerProps = { title: string; transcript: string; showTitle?: boolean };

/** Plays a listening-section transcript aloud. Uses a real pre-generated
 * audio file (see scripts/generate-audio.ts) when one exists for this track;
 * otherwise falls back to on-device text-to-speech, which is still real,
 * audible playback — never a decorative button that does nothing. */
export function TranscriptAudioPlayer({ trackId, title, transcript, showTitle = true }: PlayerProps & { trackId: string }) {
  const realSource = audioRegistry[trackId];
  if (realSource) return <RealAudioPlayer source={realSource} title={title} showTitle={showTitle} />;
  return <SpeechFallbackPlayer title={title} transcript={transcript} showTitle={showTitle} />;
}

function RealAudioPlayer({ source, title, showTitle }: { source: number; title: string; showTitle?: boolean }) {
  const theme = useTheme();
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  function toggle() {
    if (status.playing) player.pause();
    else {
      if (status.currentTime >= (status.duration || 0) - 0.25) player.seekTo(0);
      player.play();
    }
  }

  const progress = status.duration ? status.currentTime / status.duration : 0;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Pressable
          onPress={toggle}
          style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name={status.playing ? 'pause' : 'play'} size={22} color={theme.colors.onPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          {showTitle ? <Text variant="bodyMedium">{title}</Text> : null}
          <Text variant="caption" color="tertiary">
            {status.playing ? 'Playing' : 'Tap play to listen'} · {formatTime(status.currentTime)} / {formatTime(status.duration)}
          </Text>
        </View>
      </View>
      <ProgressBar progress={progress} />
    </View>
  );
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function SpeechFallbackPlayer({ title, transcript, showTitle }: PlayerProps) {
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
          style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name={playing ? 'stop' : 'play'} size={22} color={theme.colors.onPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          {showTitle ? <Text variant="bodyMedium">{title}</Text> : null}
          <Text variant="caption" color="tertiary">
            {playing ? 'Playing (on-device text-to-speech)' : 'Tap play to listen (on-device text-to-speech)'}
          </Text>
        </View>
      </View>
      <ProgressBar progress={elapsed / estimatedSeconds} />
    </View>
  );
}

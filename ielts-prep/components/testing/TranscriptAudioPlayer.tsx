import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import { ProgressBar, Text } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { audioRegistry } from '@/lib/content/audioRegistry';
import type { ListeningSpeakerTurn } from '@/types/models';

const WORDS_PER_MINUTE = 150;

type PlayerProps = { title: string; transcript: string; turns?: ListeningSpeakerTurn[]; showTitle?: boolean; restrictToOnePass?: boolean };

/** Plays a listening-section transcript aloud. Uses a real pre-generated
 * audio file (see scripts/generate-audio.ts) when one exists for this track;
 * otherwise falls back to on-device text-to-speech, which is still real,
 * audible playback — never a decorative button that does nothing.
 *
 * `restrictToOnePass` mirrors the real IELTS Listening test, where the
 * recording plays once with no pausing or rewinding — pass it in exam/mock
 * contexts (listening-test.tsx). Free-practice contexts (practice-session.tsx)
 * omit it and keep full play/pause/scrub/replay controls. */
export function TranscriptAudioPlayer({ trackId, title, transcript, turns, showTitle = true, restrictToOnePass = false }: PlayerProps & { trackId: string }) {
  const realSource = audioRegistry[trackId];
  if (realSource) return <RealAudioPlayer source={realSource} title={title} showTitle={showTitle} restrictToOnePass={restrictToOnePass} />;
  return <SpeechFallbackPlayer title={title} transcript={transcript} turns={turns} showTitle={showTitle} restrictToOnePass={restrictToOnePass} />;
}

function RealAudioPlayer({ source, title, showTitle, restrictToOnePass }: { source: number; title: string; showTitle?: boolean; restrictToOnePass?: boolean }) {
  const theme = useTheme();
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);
  const [hasPlayed, setHasPlayed] = useState(false);
  const finished = restrictToOnePass && hasPlayed && !status.playing && status.currentTime >= (status.duration || 0) - 0.25 && status.duration > 0;

  function toggle() {
    if (restrictToOnePass) {
      if (hasPlayed || status.playing) return;
      setHasPlayed(true);
      player.play();
      return;
    }
    if (status.playing) player.pause();
    else {
      if (status.currentTime >= (status.duration || 0) - 0.25) player.seekTo(0);
      player.play();
    }
  }

  const progress = status.duration ? status.currentTime / status.duration : 0;
  const disabled = restrictToOnePass && hasPlayed;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Pressable
          onPress={toggle}
          disabled={disabled}
          style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: disabled ? theme.colors.border : theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name={status.playing ? 'pause' : 'play'} size={22} color={theme.colors.onPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          {showTitle ? <Text variant="bodyMedium">{title}</Text> : null}
          <Text variant="caption" color="tertiary">
            {restrictToOnePass
              ? finished
                ? 'Played — this recording plays once, as in the real test'
                : hasPlayed
                  ? `Playing (plays once) · ${formatTime(status.currentTime)} / ${formatTime(status.duration)}`
                  : 'Tap play to start — this recording plays once, as in the real test'
              : `${status.playing ? 'Playing' : 'Tap play to listen'} · ${formatTime(status.currentTime)} / ${formatTime(status.duration)}`}
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

function SpeechFallbackPlayer({ title, transcript, turns, showTitle, restrictToOnePass }: PlayerProps) {
  const theme = useTheme();
  const [playing, setPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // When structured turns exist, speak only the spoken words — never the
  // "Speaker:" label — even on this on-device fallback path. On-device TTS
  // still can't switch voices per speaker (a real platform limitation,
  // which is exactly why production sections must use pre-generated audio
  // instead of relying on this fallback), but it must never read metadata
  // aloud regardless of which path is playing.
  const spokenText = turns && turns.length > 0 ? turns.map((t) => t.text).join(' ') : transcript;
  const wordCount = spokenText.trim().split(/\s+/).length;
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
    setHasPlayed(true);
    Speech.speak(spokenText, {
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

  const disabled = restrictToOnePass && hasPlayed && !playing;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
        <Pressable
          onPress={disabled ? undefined : playing ? stop : play}
          disabled={disabled}
          style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: disabled ? theme.colors.border : theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name={playing ? 'stop' : 'play'} size={22} color={theme.colors.onPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          {showTitle ? <Text variant="bodyMedium">{title}</Text> : null}
          <Text variant="caption" color="tertiary">
            {restrictToOnePass
              ? disabled
                ? 'Played — this recording plays once, as in the real test (on-device text-to-speech)'
                : playing
                  ? 'Playing (plays once, on-device text-to-speech)'
                  : 'Tap play to start — this recording plays once, as in the real test (on-device text-to-speech)'
              : playing
                ? 'Playing (on-device text-to-speech)'
                : 'Tap play to listen (on-device text-to-speech)'}
          </Text>
        </View>
      </View>
      <ProgressBar progress={elapsed / estimatedSeconds} />
    </View>
  );
}

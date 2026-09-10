import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';
import { isRealAiActive, type AiSource } from '@/services/ai';

/** Shown next to every AI-generated result so a practice-mode estimate is
 * never mistaken for a live evaluation. Never hide this distinction — see
 * AGENTS requirement: "Never silently present mocked scoring as real AI
 * scoring." Deliberately never names a provider or model (Gemini, OpenAI,
 * ...) — that's an implementation detail with no place in normal user UI;
 * see app/dev-health-check.tsx for provider diagnostics aimed at
 * developers instead.
 *
 * Pass `source` when you have the actual per-call result (from
 * evaluateWriting/evaluateSpeaking/chatWithCoach) — a single call can fall
 * back to mock output even with a real provider configured, so that is more
 * accurate than the global `isRealAiActive()` check used as a fallback when
 * no specific result is available yet (e.g. before the first message). */
export function DemoAiBadge({ source }: { source?: AiSource }) {
  const theme = useTheme();
  const real = source ? source === 'real' : isRealAiActive();

  const bg = real ? theme.colors.successSoft : theme.colors.warningSoft;
  const fg = real ? theme.colors.success : theme.colors.warning;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'center',
        backgroundColor: bg,
        borderRadius: theme.radius.pill,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
      }}
    >
      <Ionicons name={real ? 'sparkles' : 'flask-outline'} size={12} color={fg} />
      <Text variant="micro" style={{ color: fg }}>
        {real ? 'AI Evaluation' : 'AI Evaluation (practice mode, offline estimate)'}
      </Text>
    </View>
  );
}

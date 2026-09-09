import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { BandGrid } from '@/components/onboarding/BandGrid';
import { Button, Card, Chip, Screen, ScreenHeader, Text, TextField } from '@/components/ui';
import { useTheme, useThemePreference } from '@/hooks/useTheme';
import { saveOnboardingGoal, updateProfileName } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';
import type { IeltsType, SkillKey } from '@/types/models';

const SKILLS: SkillKey[] = ['listening', 'reading', 'writing', 'speaking'];
const STUDY_MINUTES = [15, 30, 45, 60, 90];

export default function ProfileEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { preference, setPreference } = useThemePreference();
  const { userId, profile, goal, refreshUserData } = useAppStore(useShallow((s) => ({
    userId: s.userId,
    profile: s.profile,
    goal: s.goal,
    refreshUserData: s.refreshUserData,
  })));

  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [ieltsType, setIeltsType] = useState<IeltsType>(goal?.ieltsType ?? 'academic');
  const [targetBand, setTargetBand] = useState(goal?.targetBand ?? 7);
  const [weakestSkill, setWeakestSkill] = useState<SkillKey | null>(goal?.weakestSkill ?? null);
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(goal?.dailyStudyMinutes ?? 30);
  const [examDateText, setExamDateText] = useState(goal?.examDate ?? '');
  const [saving, setSaving] = useState(false);

  const examDateValid = examDateText.trim() === '' || /^\d{4}-\d{2}-\d{2}$/.test(examDateText.trim());

  async function handleSave() {
    if (!userId || !examDateValid) return;
    setSaving(true);
    try {
      await updateProfileName(userId, fullName);
      await saveOnboardingGoal(userId, {
        ieltsType,
        currentBand: goal?.currentBand ?? null,
        targetBand,
        examDate: examDateText.trim() || null,
        weakestSkill,
        dailyStudyMinutes,
      });
      await refreshUserData(userId);
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Edit profile & goals" showBack />

      <Card style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.md }}>
        <TextField label="Full name" value={fullName} onChangeText={setFullName} />

        <View>
          <Text variant="bodyMedium" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
            IELTS type
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
            <Chip label="Academic" selected={ieltsType === 'academic'} onPress={() => setIeltsType('academic')} />
            <Chip label="General Training" selected={ieltsType === 'general'} onPress={() => setIeltsType('general')} />
          </View>
        </View>

        <View>
          <Text variant="bodyMedium" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
            Target band
          </Text>
          <BandGrid value={targetBand} onChange={setTargetBand} />
        </View>

        <View>
          <Text variant="bodyMedium" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
            Weakest skill
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
            {SKILLS.map((s) => (
              <Chip key={s} label={s} selected={weakestSkill === s} onPress={() => setWeakestSkill(s)} />
            ))}
          </View>
        </View>

        <View>
          <Text variant="bodyMedium" color="secondary" style={{ marginBottom: theme.spacing.xs }}>
            Daily study time
          </Text>
          <View style={{ flexDirection: 'row', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
            {STUDY_MINUTES.map((m) => (
              <Chip key={m} label={`${m} min`} selected={dailyStudyMinutes === m} onPress={() => setDailyStudyMinutes(m)} />
            ))}
          </View>
        </View>

        <View>
          <TextField
            label="Exam date (YYYY-MM-DD, optional)"
            value={examDateText}
            onChangeText={setExamDateText}
            placeholder="e.g. 2026-03-15"
          />
          {!examDateValid ? (
            <Text variant="caption" color="error" style={{ marginTop: 4 }}>
              Enter a date as YYYY-MM-DD, or clear the field if you haven&apos;t booked one yet.
            </Text>
          ) : null}
        </View>
      </Card>

      <Card style={{ marginBottom: theme.spacing.lg, gap: theme.spacing.xs }}>
        <Text variant="bodyMedium" style={{ marginBottom: theme.spacing.xs }}>
          Appearance
        </Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.xs }}>
          {(['system', 'light', 'dark'] as const).map((p) => (
            <Chip key={p} label={p} selected={preference === p} onPress={() => setPreference(p)} />
          ))}
        </View>
      </Card>

      <Button label="Save changes" onPress={handleSave} loading={saving} disabled={!examDateValid} fullWidth style={{ marginBottom: theme.spacing.huge }} />
    </Screen>
  );
}

import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Badge, Card, Chip, Screen, ScreenHeader, Text, TextField } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { content } from '@/lib/content';
import type { IeltsType, Task2Category, WritingTaskType } from '@/types/models';

const TASK_FILTERS: { key: WritingTaskType | 'all'; label: string }[] = [
  { key: 'all', label: 'All tasks' },
  { key: 'task1_academic', label: 'Academic Task 1' },
  { key: 'task1_general', label: 'General Task 1' },
  { key: 'task2', label: 'Task 2' },
];

const IELTS_TYPE_FILTERS: { key: IeltsType | 'all'; label: string }[] = [
  { key: 'all', label: 'All types' },
  { key: 'academic', label: 'Academic' },
  { key: 'general', label: 'General' },
];

const CATEGORY_LABEL: Record<Task2Category, string> = {
  opinion: 'Opinion',
  discussion: 'Discussion',
  advantages_disadvantages: 'Advantages / Disadvantages',
  problem_solution: 'Problem / Solution',
  two_part_question: 'Two-part question',
};

export default function WritingPromptsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [taskFilter, setTaskFilter] = useState<WritingTaskType | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<IeltsType | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Task2Category | 'all'>('all');
  const [search, setSearch] = useState('');

  const prompts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return content.writingPrompts.filter((p) => {
      if (taskFilter !== 'all' && p.taskType !== taskFilter) return false;
      if (typeFilter !== 'all' && p.ieltsType !== typeFilter) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.promptText.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [taskFilter, typeFilter, categoryFilter, search]);

  return (
    <Screen scroll>
      <ScreenHeader title="Writing prompts" showBack />
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing.md }}>
        {content.writingPrompts.length} prompts — search or filter, then pick one for a timed writing task with AI feedback.
      </Text>

      <TextField value={search} onChangeText={setSearch} placeholder="Search prompts..." style={{ marginBottom: theme.spacing.sm }} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.xs }}>
        {TASK_FILTERS.map((f) => (
          <Chip key={f.key} label={f.label} selected={taskFilter === f.key} onPress={() => setTaskFilter(f.key)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.xs }}>
        {IELTS_TYPE_FILTERS.map((f) => (
          <Chip key={f.key} label={f.label} selected={typeFilter === f.key} onPress={() => setTypeFilter(f.key)} />
        ))}
      </View>
      {taskFilter === 'task2' ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginBottom: theme.spacing.sm }}>
          <Chip label="All categories" selected={categoryFilter === 'all'} onPress={() => setCategoryFilter('all')} />
          {(Object.keys(CATEGORY_LABEL) as Task2Category[]).map((c) => (
            <Chip key={c} label={CATEGORY_LABEL[c]} selected={categoryFilter === c} onPress={() => setCategoryFilter(c)} />
          ))}
        </View>
      ) : null}

      <Text variant="caption" color="tertiary" style={{ marginBottom: theme.spacing.sm }}>
        {prompts.length} matching prompt{prompts.length === 1 ? '' : 's'}
      </Text>

      {prompts.map((p) => (
        <Card
          key={p.id}
          onPress={() => router.push({ pathname: '/writing-test', params: { promptId: p.id } })}
          style={{ marginBottom: theme.spacing.sm, gap: 6 }}
        >
          <Text variant="bodyMedium">{p.title}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <Badge label={p.taskType.replace(/_/g, ' ')} tone="brand" />
            <Badge label={p.ieltsType} tone="neutral" />
            {p.category ? <Badge label={CATEGORY_LABEL[p.category]} tone="warning" /> : null}
          </View>
          <Text variant="caption" color="secondary" numberOfLines={2}>
            {p.promptText}
          </Text>
        </Card>
      ))}

      {prompts.length === 0 ? (
        <Text color="secondary" align="center" style={{ marginTop: theme.spacing.xl }}>
          No prompts match these filters.
        </Text>
      ) : null}
    </Screen>
  );
}

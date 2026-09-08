import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { Chip, DemoAiBadge, IconCircle, ScreenHeader, Text, TextField } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { chatWithCoach, type CoachContext } from '@/services/ai';
import { addMessage, createConversation, getMessages, listConversations } from '@/services/repository';
import { useAppStore } from '@/store/useAppStore';

const SUGGESTED_PROMPTS = [
  'How can I reach my target band?',
  "Why is my reading score low?",
  "Give me today's plan",
  'Explain True False Not Given',
  'Give me a speaking topic',
  'How do I improve Task 2?',
];

export default function AiCoachScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ conversationId?: string }>();
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);

  const { userId, profile, goal, bandScores, streak } = useAppStore(useShallow((s) => ({
    userId: s.userId,
    profile: s.profile,
    goal: s.goal,
    bandScores: s.bandScores,
    streak: s.streak,
  })));

  const [conversationId, setConversationId] = useState<string | null>(params.conversationId ?? null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const conversationsQuery = useQuery({
    queryKey: ['ai-conversations', userId],
    queryFn: () => listConversations(userId!),
    enabled: Boolean(userId),
  });

  const messagesQuery = useQuery({
    queryKey: ['ai-messages', conversationId],
    queryFn: () => getMessages(conversationId!),
    enabled: Boolean(conversationId),
  });

  useEffect(() => {
    if (!userId || conversationId || !conversationsQuery.isFetched) return;
    (async () => {
      const existing = conversationsQuery.data?.[0];
      if (existing) {
        setConversationId(existing.id);
        return;
      }
      const c = await createConversation(userId);
      setConversationId(c.id);
      queryClient.invalidateQueries({ queryKey: ['ai-conversations', userId] });
    })();
  }, [userId, conversationId, conversationsQuery.isFetched, conversationsQuery.data, queryClient]);

  async function handleNewConversation() {
    if (!userId) return;
    const c = await createConversation(userId);
    setConversationId(c.id);
    queryClient.invalidateQueries({ queryKey: ['ai-conversations', userId] });
  }

  async function send(text: string) {
    if (!text.trim() || !userId || !conversationId || sending) return;
    setInput('');
    setSending(true);
    await addMessage(conversationId, 'user', text.trim());
    queryClient.invalidateQueries({ queryKey: ['ai-messages', conversationId] });

    const context: CoachContext = {
      fullName: profile?.fullName ?? null,
      ieltsType: goal?.ieltsType ?? 'academic',
      targetBand: goal?.targetBand ?? 7,
      currentBand: goal?.currentBand ?? null,
      examDate: goal?.examDate ?? null,
      weakestSkill: goal?.weakestSkill ?? null,
      bandBySkill: bandScores,
      streakDays: streak.count,
      dailyStudyMinutes: goal?.dailyStudyMinutes ?? 30,
    };

    const history = (await getMessages(conversationId)).map((m) => ({ role: m.role, content: m.content }));
    const reply = await chatWithCoach(history as any, context);
    await addMessage(conversationId, 'assistant', reply);
    queryClient.invalidateQueries({ queryKey: ['ai-messages', conversationId] });
    setSending(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  const messages = messagesQuery.data ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md }}>
        <ScreenHeader
          title="AI Coach"
          showBack
          right={
            <Pressable onPress={handleNewConversation} hitSlop={10}>
              <Ionicons name="add-circle-outline" size={26} color={theme.colors.primary} />
            </Pressable>
          }
        />
        <View style={{ alignItems: 'flex-start', marginBottom: theme.spacing.xs }}>
          <DemoAiBadge />
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}>
          {messages.length === 0 ? (
            <View style={{ alignItems: 'center', gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
              <IconCircle name="sparkles" size={64} />
              <Text variant="h3" align="center">
                Ask me anything about your IELTS prep
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, justifyContent: 'center' }}>
                {SUGGESTED_PROMPTS.map((p) => (
                  <Chip key={p} label={p} onPress={() => send(p)} />
                ))}
              </View>
            </View>
          ) : (
            messages.map((m) => (
              <View
                key={m.id}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: m.role === 'user' ? theme.colors.primary : theme.colors.surfaceAlt,
                  borderRadius: theme.radius.lg,
                  padding: theme.spacing.sm,
                  maxWidth: '85%',
                }}
              >
                <Text variant="body" color={m.role === 'user' ? 'inverse' : 'primary'}>
                  {m.content}
                </Text>
              </View>
            ))
          )}
          {sending ? (
            <View style={{ alignSelf: 'flex-start', backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.lg, padding: theme.spacing.sm }}>
              <Text color="secondary">Coach is typing...</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, padding: theme.spacing.md, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <TextField value={input} onChangeText={setInput} placeholder="Ask your coach..." multiline />
          </View>
          <Pressable
            onPress={() => send(input)}
            disabled={sending || !input.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: sending || !input.trim() ? 0.5 : 1,
            }}
          >
            <Ionicons name="send" size={18} color={theme.colors.onPrimary} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

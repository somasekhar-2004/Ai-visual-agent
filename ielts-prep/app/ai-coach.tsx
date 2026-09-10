import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

import { Chip, DailyLimitCard, DemoAiBadge, IconCircle, ScreenHeader, Text, TextField } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { buildCoachContext } from '@/lib/coachContext';
import { activityUsedToday, checkDailyLimit, FREE_DAILY_AI_MESSAGES } from '@/lib/entitlements';
import { chatWithCoach, type AiSource } from '@/services/ai';
import { addMessage, addTestHistory, createConversation, getMessages, getQuestionAttempts, getTestHistory, listConversations } from '@/services/repository';
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

  const { userId, profile, goal, bandScores, streak, isPremium, dataLoaded } = useAppStore(useShallow((s) => ({
    userId: s.userId,
    profile: s.profile,
    goal: s.goal,
    bandScores: s.bandScores,
    streak: s.streak,
    isPremium: s.subscription?.plan !== 'free',
    dataLoaded: s.dataLoaded,
  })));

  const [conversationId, setConversationId] = useState<string | null>(params.conversationId ?? null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [lastReplySource, setLastReplySource] = useState<AiSource | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

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

  const historyQuery = useQuery({
    queryKey: ['test-history', userId],
    queryFn: () => getTestHistory(userId!),
    enabled: Boolean(userId),
  });
  // Same queryKey ProgressDashboard uses, so this is typically already
  // cached — real accuracy/questions-completed for the coach's context
  // (real Supabase mode overrides both server-side anyway; see
  // supabase/functions/_shared/userContext.ts, but Demo Mode has no server
  // to do that, so this is what makes those honest there too).
  const attemptsQuery = useQuery({
    queryKey: ['question-attempts', userId],
    queryFn: () => getQuestionAttempts(userId!),
    enabled: Boolean(userId),
  });
  const usedToday = activityUsedToday(historyQuery.data ?? [], 'ai_chat');
  const limitStatus = checkDailyLimit(usedToday, FREE_DAILY_AI_MESSAGES, isPremium);

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
    // dataLoaded also gated: building context from the store before its
    // initial load has settled is exactly how a real production bug sent
    // the coach a hardcoded fallback target band instead of the real one —
    // `goal` (and everything else read below) can still be sitting at its
    // unloaded initial value at this point otherwise.
    if (!text.trim() || !userId || !conversationId || sending || !limitStatus.allowed || !dataLoaded) return;
    setInput('');
    setSending(true);
    setSendError(null);
    await addMessage(conversationId, 'user', text.trim());
    queryClient.invalidateQueries({ queryKey: ['ai-messages', conversationId] });

    try {
      // Real Supabase mode also has this (and every other identity/goal/
      // band field) re-fetched and overridden server-side by authenticated
      // user id, not trusted from this client read at all — see
      // supabase/functions/_shared/userContext.ts. buildCoachContext is
      // still what enforces "never fabricate a missing value" here (and
      // what Demo Mode, with no server to override anything, relies on).
      const context = buildCoachContext({ profile, goal, bandScores, streak, attempts: attemptsQuery.data ?? [] });

      const history = (await getMessages(conversationId)).map((m) => ({ role: m.role, content: m.content }));
      const { reply, aiSource } = await chatWithCoach(history as any, context);
      setLastReplySource(aiSource);
      await addMessage(conversationId, 'assistant', reply);
      await addTestHistory(userId, 'ai_chat', conversationId, null, {});
      queryClient.invalidateQueries({ queryKey: ['ai-messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['test-history', userId] });
    } catch (err) {
      // A failed real-provider call must surface as a visible, recoverable
      // error — never a silently-substituted mock reply (see
      // services/ai/index.ts's chatWithCoach). The user's own message is
      // already saved above; only the coach's reply is missing, so they can
      // just retry.
      setSendError((err as Error).message || 'The coach is unavailable right now. Please try again.');
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
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
          <DemoAiBadge source={lastReplySource ?? undefined} />
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
              {!dataLoaded ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : limitStatus.allowed ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, justifyContent: 'center' }}>
                  {SUGGESTED_PROMPTS.map((p) => (
                    <Chip key={p} label={p} onPress={() => send(p)} />
                  ))}
                </View>
              ) : null}
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
          {sendError ? (
            <View style={{ alignSelf: 'flex-start', backgroundColor: theme.colors.errorSoft, borderRadius: theme.radius.lg, padding: theme.spacing.sm, maxWidth: '85%' }}>
              <Text color="error">{sendError}</Text>
            </View>
          ) : null}
        </ScrollView>

        {limitStatus.allowed ? (
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, padding: theme.spacing.md, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <TextField value={input} onChangeText={setInput} placeholder="Ask your coach..." multiline />
            </View>
            <Pressable
              onPress={() => send(input)}
              disabled={sending || !input.trim() || !dataLoaded}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: sending || !input.trim() || !dataLoaded ? 0.5 : 1,
              }}
            >
              <Ionicons name="send" size={18} color={theme.colors.onPrimary} />
            </Pressable>
          </View>
        ) : (
          <View style={{ padding: theme.spacing.md }}>
            <DailyLimitCard used={limitStatus.used} limit={limitStatus.limit} feature="AI Coach messages" />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

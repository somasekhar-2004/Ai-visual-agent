import { content } from '@/lib/content';
import { getDb, mutateDb } from '@/lib/demoStore';
import { isDemoMode } from '@/lib/env';
import { generateId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import type { Achievement, AiConversation, AiMessage, UserAchievement } from '@/types/models';

export function listAchievements(): Achievement[] {
  return content.achievements;
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  if (isDemoMode) {
    const db = await getDb();
    return db.userAchievements;
  }
  const { data } = await supabase!.from('user_achievements').select('*').eq('user_id', userId);
  return (data ?? []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    achievementId: row.achievement_id,
    earnedAt: row.earned_at,
  }));
}

async function unlock(userId: string, achievementId: string): Promise<boolean> {
  if (isDemoMode) {
    return mutateDb((db) => {
      if (db.userAchievements.some((a) => a.achievementId === achievementId)) return false;
      db.userAchievements.push({ id: generateId('ua'), userId, achievementId, earnedAt: new Date().toISOString() });
      return true;
    });
  }
  const { error } = await supabase!.from('user_achievements').insert({ user_id: userId, achievement_id: achievementId });
  return !error;
}

export type AchievementStats = {
  mockCount: number;
  streakDays: number;
  bandBySkill: Partial<Record<'reading' | 'listening' | 'writing' | 'speaking', number>>;
  writingCount: number;
  speakingCount: number;
  questionCount: number;
};

/** Checks the given stats against each achievement's criteria and unlocks any newly earned ones. Returns the newly unlocked achievements. */
export async function checkAndUnlockAchievements(userId: string, stats: AchievementStats): Promise<Achievement[]> {
  const already = new Set((await getUserAchievements(userId)).map((a) => a.achievementId));
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of content.achievements) {
    if (already.has(achievement.id)) continue;
    const criteria = achievement.criteria as any;
    let earned = false;
    switch (criteria.type) {
      case 'mock_count':
        earned = stats.mockCount >= criteria.value;
        break;
      case 'streak_days':
        earned = stats.streakDays >= criteria.value;
        break;
      case 'skill_band':
        earned = (stats.bandBySkill[criteria.skill as keyof typeof stats.bandBySkill] ?? 0) >= criteria.value;
        break;
      case 'writing_count':
        earned = stats.writingCount >= criteria.value;
        break;
      case 'speaking_count':
        earned = stats.speakingCount >= criteria.value;
        break;
      case 'question_count':
        earned = stats.questionCount >= criteria.value;
        break;
    }
    if (earned && (await unlock(userId, achievement.id))) {
      newlyUnlocked.push(achievement);
    }
  }
  return newlyUnlocked;
}

export async function listConversations(userId: string): Promise<AiConversation[]> {
  if (isDemoMode) {
    const db = await getDb();
    return db.conversations;
  }
  const { data } = await supabase!
    .from('ai_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data ?? []).map((row: any) => ({ id: row.id, userId: row.user_id, title: row.title, createdAt: row.created_at }));
}

export async function createConversation(userId: string, title = 'New conversation'): Promise<AiConversation> {
  const conversation: AiConversation = { id: generateId('conv'), userId, title, createdAt: new Date().toISOString() };
  if (isDemoMode) {
    await mutateDb((db) => {
      db.conversations.unshift(conversation);
      db.messages[conversation.id] = [];
    });
    return conversation;
  }
  const { data } = await supabase!.from('ai_conversations').insert({ user_id: userId, title }).select('*').single();
  return { id: data.id, userId: data.user_id, title: data.title, createdAt: data.created_at };
}

export async function getMessages(conversationId: string): Promise<AiMessage[]> {
  if (isDemoMode) {
    const db = await getDb();
    return db.messages[conversationId] ?? [];
  }
  const { data } = await supabase!
    .from('ai_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  return (data ?? []).map((row: any) => ({
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function addMessage(conversationId: string, role: AiMessage['role'], content: string): Promise<AiMessage> {
  const message: AiMessage = { id: generateId('msg'), conversationId, role, content, createdAt: new Date().toISOString() };
  if (isDemoMode) {
    await mutateDb((db) => {
      if (!db.messages[conversationId]) db.messages[conversationId] = [];
      db.messages[conversationId].push(message);
    });
    return message;
  }
  await supabase!.from('ai_messages').insert({ conversation_id: conversationId, role, content });
  return message;
}

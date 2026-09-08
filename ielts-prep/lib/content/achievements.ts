import type { Achievement } from '@/types/models';

export const achievements: Achievement[] = [
  { id: 'a-first-mock', code: 'first_mock', title: 'First Mock', description: 'Complete your first full mock test', icon: 'ribbon-outline', criteria: { type: 'mock_count', value: 1 } },
  { id: 'a-streak-7', code: 'streak_7', title: '7 Day Streak', description: 'Study for 7 days in a row', icon: 'flame-outline', criteria: { type: 'streak_days', value: 7 } },
  { id: 'a-streak-30', code: 'streak_30', title: '30 Day Streak', description: 'Study for 30 days in a row', icon: 'flame-outline', criteria: { type: 'streak_days', value: 30 } },
  { id: 'a-band7-reading', code: 'band7_reading', title: 'Band 7 Reading', description: 'Score Band 7 or higher in a Reading test', icon: 'book-outline', criteria: { type: 'skill_band', skill: 'reading', value: 7 } },
  { id: 'a-writing-10', code: 'writing_10', title: '10 Writing Tasks', description: 'Submit 10 writing tasks for AI evaluation', icon: 'create-outline', criteria: { type: 'writing_count', value: 10 } },
  { id: 'a-speaking-20', code: 'speaking_20', title: '20 Speaking Sessions', description: 'Complete 20 speaking practice sessions', icon: 'mic-outline', criteria: { type: 'speaking_count', value: 20 } },
  { id: 'a-questions-100', code: 'questions_100', title: '100 Questions Completed', description: 'Answer 100 practice questions', icon: 'checkmark-done-outline', criteria: { type: 'question_count', value: 100 } },
];

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { NotificationCategory } from '@/types/models';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const IDS: Record<NotificationCategory, string> = {
  daily_reminder: 'ielts-prep-daily-reminder',
  streak_reminder: 'ielts-prep-streak-reminder',
  test_countdown: 'ielts-prep-test-countdown',
  unfinished_plan: 'ielts-prep-unfinished-plan',
  weekly_summary: 'ielts-prep-weekly-summary',
};

export async function requestNotificationPermissions(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const request = await Notifications.requestPermissionsAsync();
  return request.granted;
}

async function cancel(category: NotificationCategory) {
  await Notifications.cancelScheduledNotificationAsync(IDS[category]).catch(() => {});
}

export async function scheduleDailyReminder(enabled: boolean, hour = 19, minute = 0) {
  await cancel('daily_reminder');
  if (!enabled) return;
  await Notifications.scheduleNotificationAsync({
    identifier: IDS.daily_reminder,
    content: { title: 'Time to study', body: "Your daily IELTS practice is waiting — even 15 minutes keeps your streak alive." },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
}

export async function scheduleWeeklySummary(enabled: boolean, weekday = 1, hour = 18) {
  await cancel('weekly_summary');
  if (!enabled) return;
  await Notifications.scheduleNotificationAsync({
    identifier: IDS.weekly_summary,
    content: { title: 'Your weekly progress', body: 'See how your band scores moved this week and what to focus on next.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute: 0 },
  });
}

export async function scheduleStreakReminder(enabled: boolean, hour = 21, minute = 0) {
  await cancel('streak_reminder');
  if (!enabled) return;
  await Notifications.scheduleNotificationAsync({
    identifier: IDS.streak_reminder,
    content: { title: "Don't break your streak!", body: "You haven't studied today yet — a quick session keeps your streak going." },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
  });
}

/** Schedules a one-off reminder a few days before the exam, if there's enough runway left. */
export async function scheduleTestCountdown(enabled: boolean, examDateIso: string | null) {
  await cancel('test_countdown');
  if (!enabled || !examDateIso) return;
  const examDate = new Date(examDateIso);
  const reminderDate = new Date(examDate.getTime() - 7 * 86400000);
  reminderDate.setHours(9, 0, 0, 0);
  if (reminderDate.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: IDS.test_countdown,
    content: { title: 'One week to go!', body: 'Your IELTS test is in 7 days — review your weakest skill and do one full mock section today.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate },
  });
}

export async function applyNotificationPreferences(
  prefs: Record<NotificationCategory, boolean>,
  examDate: string | null
) {
  if (Platform.OS === 'web') return; // scheduled local notifications aren't supported on web
  const granted = await requestNotificationPermissions();
  if (!granted) return;
  await scheduleDailyReminder(prefs.daily_reminder);
  await scheduleStreakReminder(prefs.streak_reminder);
  await scheduleWeeklySummary(prefs.weekly_summary);
  await scheduleTestCountdown(prefs.test_countdown, examDate);
}

import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { ReminderItem, TaskItem } from "../types/domain";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

type DailyReminderKind = "daily_plan" | "night_review";

const dailyReminderMeta: Record<
  DailyReminderKind,
  { title: string; body: string; hour: number; minute: number; label: string }
> = {
  daily_plan: {
    title: "伴办：该定今日重点了",
    body: "先抓三个重点，今天就不会散。",
    hour: 9,
    minute: 0,
    label: "每天 09:00"
  },
  night_review: {
    title: "伴办：做个晚间复盘",
    body: "看见完成的，也把明天第一步放小。",
    hour: 21,
    minute: 0,
    label: "每天 21:00"
  }
};

export async function scheduleTaskReminder(task: TaskItem): Promise<ReminderItem> {
  await ensureNotificationPermission();

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "伴办：任务提醒",
      body: task.title,
      data: { taskId: task.id }
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60
    }
  });

  return {
    id: `reminder-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    notificationId,
    type: "task",
    title: task.title,
    scheduledLabel: "1 小时后",
    createdAt: new Date().toISOString()
  };
}

export async function scheduleDailyReminder(
  type: DailyReminderKind
): Promise<ReminderItem> {
  await ensureNotificationPermission();

  const meta = dailyReminderMeta[type];
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: meta.title,
      body: meta.body,
      data: { type }
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: meta.hour,
      minute: meta.minute
    }
  });

  return {
    id: `reminder-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    notificationId,
    type,
    title: meta.title,
    scheduledLabel: meta.label,
    createdAt: new Date().toISOString()
  };
}

export async function cancelReminder(reminder: ReminderItem): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
}

async function ensureNotificationPermission(): Promise<void> {
  if (Platform.OS === "web") {
    throw new Error("Web 预览暂不支持系统通知，请在 iOS 或 Android 上测试。");
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return;

  const requested = await Notifications.requestPermissionsAsync();
  if (!requested.granted) {
    throw new Error("没有通知权限，请在系统设置中允许伴办发送通知。");
  }
}

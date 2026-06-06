export type AppTab =
  | "home"
  | "chat"
  | "tasks"
  | "workflows"
  | "memory"
  | "settings";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type TaskItem = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
};

export type MemoryItem = {
  id: string;
  type: "goal" | "preference" | "project" | "blocker";
  title: string;
  content: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type ReminderItem = {
  id: string;
  notificationId: string;
  type: "task" | "daily_plan" | "night_review";
  title: string;
  scheduledLabel: string;
  createdAt: string;
};

export type SetupState = {
  hasCompletedIntro: boolean;
  hasRunWorkflow: boolean;
};

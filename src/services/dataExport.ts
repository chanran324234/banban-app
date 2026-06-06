import { Platform, Share } from "react-native";
import type {
  ChatMessage,
  MemoryItem,
  ReminderItem,
  SetupState,
  TaskItem
} from "../types/domain";

export type ExportSnapshot = {
  app: "banban";
  version: string;
  exportedAt: string;
  tasks: TaskItem[];
  memories: MemoryItem[];
  messages: ChatMessage[];
  reminders: ReminderItem[];
  setup: SetupState;
};

export async function exportUserData(snapshot: ExportSnapshot): Promise<void> {
  const content = JSON.stringify(snapshot, null, 2);
  const filename = `banban-export-${snapshot.exportedAt.slice(0, 10)}.json`;

  if (Platform.OS === "web") {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return;
  }

  await Share.share({
    title: filename,
    message: content
  });
}

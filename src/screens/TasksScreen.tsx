import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Section } from "../components/Section";
import { TaskRow } from "../components/TaskRow";
import { scheduleTaskReminder } from "../services/reminders";
import { colors, spacing } from "../theme/tokens";
import type { ReminderItem, TaskItem, TaskStatus } from "../types/domain";

type TasksScreenProps = {
  tasks: TaskItem[];
  onChangeTasks: (tasks: TaskItem[]) => void;
  onAddReminder: (reminder: ReminderItem) => void;
};

const columns: Array<{ status: TaskStatus; title: string }> = [
  { status: "todo", title: "待办" },
  { status: "in_progress", title: "进行中" },
  { status: "done", title: "已完成" }
];

export function TasksScreen({
  tasks,
  onChangeTasks,
  onAddReminder
}: TasksScreenProps) {
  const changeTaskStatus = (taskId: string, status: TaskStatus) => {
    onChangeTasks(
      tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
  };

  const remindTask = async (task: TaskItem) => {
    try {
      const reminder = await scheduleTaskReminder(task);
      onAddReminder(reminder);
      Alert.alert("提醒已设置", `${task.title}\n${reminder.scheduledLabel}`);
    } catch (error) {
      Alert.alert(
        "提醒未设置",
        error instanceof Error ? error.message : "设置提醒时出错。"
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.status);

        return (
          <Section
            key={column.status}
            title={column.title}
            hint={column.status === "done" ? "完成也要看见，它会给明天一点底气。" : undefined}
          >
            <View style={styles.list}>
              {columnTasks.length ? (
                columnTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onStatusChange={(status) => changeTaskStatus(task.id, status)}
                    onRemind={() => remindTask(task)}
                  />
                ))
              ) : (
                <Text style={styles.empty}>这里暂时没有任务</Text>
              )}
            </View>
          </Section>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl
  },
  list: {
    gap: spacing.sm
  },
  empty: {
    minHeight: 52,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.muted,
    backgroundColor: colors.surface,
    fontSize: 14
  }
});

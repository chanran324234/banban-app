import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../theme/tokens";
import type { TaskItem, TaskStatus } from "../types/domain";

type TaskRowProps = {
  task: TaskItem;
  onStatusChange?: (status: TaskStatus) => void;
  onRemind?: () => void;
};

const statusMeta = {
  todo: { label: "待办", icon: "ellipse-outline" },
  in_progress: { label: "进行中", icon: "play-circle-outline" },
  done: { label: "完成", icon: "checkmark-circle-outline" }
} as const;

export function TaskRow({ task, onStatusChange, onRemind }: TaskRowProps) {
  const nextStatus: TaskStatus =
    task.status === "todo"
      ? "in_progress"
      : task.status === "in_progress"
        ? "done"
        : "todo";

  return (
    <View style={styles.row}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={task.title}
        onPress={() => onStatusChange?.(nextStatus)}
        style={styles.statusButton}
      >
      <Ionicons
        name={statusMeta[task.status].icon}
        size={22}
        color={task.status === "done" ? colors.action : colors.blue}
      />
      </TouchableOpacity>
      <View style={styles.copy}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.description}>{task.description}</Text>
      </View>
      <View style={styles.trailing}>
        <View
          style={[
            styles.priority,
            task.priority === "high" && styles.priorityHigh,
            task.priority === "low" && styles.priorityLow
          ]}
        >
          <Text style={styles.priorityText}>{statusMeta[task.status].label}</Text>
        </View>
        {onRemind ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`提醒 ${task.title}`}
            onPress={onRemind}
            style={styles.remindButton}
          >
            <Ionicons name="alarm-outline" size={18} color={colors.action} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 88,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  statusButton: {
    width: 34,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4
  },
  title: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  priority: {
    minWidth: 56,
    minHeight: 28,
    borderRadius: 8,
    backgroundColor: colors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8
  },
  priorityHigh: {
    backgroundColor: colors.amberSoft
  },
  priorityLow: {
    backgroundColor: colors.actionSoft
  },
  priorityText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "800"
  },
  trailing: {
    alignItems: "center",
    gap: spacing.xs
  },
  remindButton: {
    width: 36,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.actionSoft,
    alignItems: "center",
    justifyContent: "center"
  }
});

import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
import { Section } from "../components/Section";
import { TaskRow } from "../components/TaskRow";
import { colors, spacing } from "../theme/tokens";
import type { MemoryItem, SetupState, TaskItem } from "../types/domain";

type HomeScreenProps = {
  tasks: TaskItem[];
  memories: MemoryItem[];
  setup: SetupState;
  hasApiKey: boolean;
  onDismissIntro: () => void;
  onStartChat: () => void;
  onOpenWorkflows: () => void;
  onOpenSettings: () => void;
};

export function HomeScreen({
  tasks,
  memories,
  setup,
  hasApiKey,
  onDismissIntro,
  onStartChat,
  onOpenWorkflows,
  onOpenSettings
}: HomeScreenProps) {
  const focusTask = tasks.find((task) => task.status !== "done") ?? tasks[0];
  const hasTasks = tasks.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {!setup.hasCompletedIntro ? (
        <Section title="开始使用" hint="三步跑通伴办的核心体验。">
          <View style={styles.setupPanel}>
            <View style={styles.setupRows}>
              <SetupRow
                done={hasApiKey}
                title="配置 DeepSeek Key"
                description="免费开源版本使用你自己的模型密钥。"
              />
              <SetupRow
                done={hasTasks}
                title="确认第一批任务"
                description="先从一个项目目标和三个待办开始。"
              />
              <SetupRow
                done={setup.hasRunWorkflow}
                title="运行一次 AI 工作流"
                description="生成今日计划、晚间复盘或项目拆解。"
              />
            </View>
            <View style={styles.actions}>
              <Button
                label={hasApiKey ? "打开设置" : "配置 Key"}
                icon="key-outline"
                variant="secondary"
                onPress={onOpenSettings}
              />
              <Button
                label="运行工作流"
                icon="git-branch-outline"
                onPress={onOpenWorkflows}
              />
              <Button
                label="先跳过"
                icon="close-outline"
                variant="secondary"
                onPress={onDismissIntro}
              />
            </View>
          </View>
        </Section>
      ) : null}

      <Section title="今日推进" hint="先抓住一个最小动作，今天就不会散。">
        <View style={styles.focusBand}>
          <View style={styles.focusIcon}>
            <Ionicons name="navigate-outline" size={24} color={colors.action} />
          </View>
          <View style={styles.focusCopy}>
            <Text style={styles.kicker}>下一步</Text>
            <Text style={styles.focusTitle}>
              {focusTask?.title ?? "先写下今天最重要的一件事"}
            </Text>
            <Text style={styles.focusText}>
              {focusTask?.description ?? "伴办会把你的想法拆成能马上执行的任务。"}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Button
            label="开始聊天"
            icon="chatbubble-ellipses-outline"
            onPress={onStartChat}
          />
          <Button
            label="生成计划"
            icon="calendar-outline"
            variant="secondary"
            onPress={onOpenWorkflows}
          />
        </View>
      </Section>

      <Section title="待推进任务">
        <View style={styles.list}>
          {tasks.length ? (
            tasks.slice(0, 3).map((task) => <TaskRow key={task.id} task={task} />)
          ) : (
            <Text style={styles.emptyText}>还没有任务，先去聊天或工作流里生成一个。</Text>
          )}
        </View>
      </Section>

      <Section title="伴办记住的方向">
        <View style={styles.memoryGrid}>
          {memories.slice(0, 2).map((memory) => (
            <View key={memory.id} style={styles.memoryItem}>
              <Text style={styles.memoryTitle}>{memory.title}</Text>
              <Text style={styles.memoryContent}>{memory.content}</Text>
            </View>
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}

function SetupRow({
  done,
  title,
  description
}: {
  done: boolean;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.setupRow}>
      <Ionicons
        name={done ? "checkmark-circle" : "ellipse-outline"}
        size={20}
        color={done ? colors.action : colors.muted}
      />
      <View style={styles.setupCopy}>
        <Text style={styles.setupTitle}>{title}</Text>
        <Text style={styles.setupDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl
  },
  focusBand: {
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    gap: spacing.md
  },
  focusIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  focusCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4
  },
  kicker: {
    color: colors.action,
    fontSize: 12,
    fontWeight: "800"
  },
  focusTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  focusText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  actions: {
    marginTop: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  setupPanel: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    gap: spacing.md
  },
  setupRows: {
    gap: spacing.sm
  },
  setupRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  setupCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2
  },
  setupTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  setupDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  list: {
    gap: spacing.sm
  },
  emptyText: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  memoryGrid: {
    gap: spacing.sm
  },
  memoryItem: {
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6
  },
  memoryTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "800"
  },
  memoryContent: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19
  }
});

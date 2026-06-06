import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../components/Button";
import { Section } from "../components/Section";
import {
  buildLocalWorkflowResult,
  formatWorkflowForChat,
  runWorkflow,
  type WorkflowKind,
  type WorkflowResult
} from "../services/workflows";
import { getDeepSeekApiKey } from "../storage/apiKeyStore";
import { colors, spacing } from "../theme/tokens";
import type { ChatMessage, MemoryItem, TaskItem } from "../types/domain";

type WorkflowsScreenProps = {
  tasks: TaskItem[];
  memories: MemoryItem[];
  messages: ChatMessage[];
  onCreateTask: (
    title: string,
    description: string,
    options?: { openTasks?: boolean }
  ) => void;
  onAppendMessages: (messages: ChatMessage[]) => void;
  onWorkflowRun: () => void;
};

const workflows: Array<{
  id: WorkflowKind;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  {
    id: "daily_plan",
    title: "生成今日计划",
    description: "把精力、时间和待办压成三个关键动作。",
    icon: "calendar-outline"
  },
  {
    id: "night_review",
    title: "晚间复盘",
    description: "整理完成、卡点和明天第一步。",
    icon: "moon-outline"
  },
  {
    id: "project_breakdown",
    title: "项目拆解",
    description: "输入一个项目目标，生成里程碑、风险和下一批任务。",
    icon: "map-outline"
  }
];

export function WorkflowsScreen({
  tasks,
  memories,
  messages,
  onCreateTask,
  onAppendMessages,
  onWorkflowRun
}: WorkflowsScreenProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowKind | null>(null);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [error, setError] = useState("");
  const [projectGoal, setProjectGoal] = useState(
    "把伴办做成可以上架的免费开源应用"
  );

  const startWorkflow = async (kind: WorkflowKind) => {
    if (kind === "project_breakdown" && !projectGoal.trim()) {
      setError("请先输入项目目标。");
      return;
    }

    setActiveWorkflow(kind);
    setResult(null);
    setError("");

    const context = {
      tasks,
      memories,
      messages,
      projectGoal:
        kind === "project_breakdown" ? projectGoal.trim() : undefined
    };

    try {
      const apiKey = await getDeepSeekApiKey();
      const nextResult = apiKey
        ? await runWorkflow({ apiKey, kind, context })
        : buildLocalWorkflowResult(kind, context);

      setResult(nextResult);
      onWorkflowRun();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "工作流运行失败，请稍后再试。"
      );
    } finally {
      setActiveWorkflow(null);
    }
  };

  const writeTasks = () => {
    result?.tasks.forEach((task) => {
      onCreateTask(task.title, task.description, { openTasks: false });
    });
  };

  const writeToChat = () => {
    if (!result) return;

    onAppendMessages([
      {
        id: `workflow-user-${Date.now()}`,
        role: "user",
        content: `请生成${result.title}`
      },
      {
        id: `workflow-assistant-${Date.now()}`,
        role: "assistant",
        content: formatWorkflowForChat(result)
      }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Section title="AI 工作流" hint="读取当前任务、记忆和最近聊天，生成可执行结果。">
        <View style={styles.goalPanel}>
          <Text style={styles.goalLabel}>项目目标</Text>
          <TextInput
            style={styles.goalInput}
            value={projectGoal}
            onChangeText={setProjectGoal}
            placeholder="例如：做一个可上架的免费开源 AIGC App"
            placeholderTextColor={colors.muted}
            multiline
          />
        </View>
        <View style={styles.grid}>
          {workflows.map((workflow) => (
            <TouchableOpacity
              key={workflow.id}
              accessibilityRole="button"
              accessibilityLabel={workflow.title}
              style={styles.workflow}
              onPress={() => startWorkflow(workflow.id)}
              disabled={Boolean(activeWorkflow)}
            >
              <View style={styles.iconBox}>
                <Ionicons name={workflow.icon} size={24} color={colors.blue} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.title}>{workflow.title}</Text>
                <Text style={styles.description}>{workflow.description}</Text>
              </View>
              {activeWorkflow === workflow.id ? (
                <ActivityIndicator color={colors.action} />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Section>

      {error ? (
        <Section title="运行失败">
          <View style={styles.errorPanel}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </Section>
      ) : null}

      {result ? (
        <Section title="工作流结果" hint="结果可以写入聊天，也可以把建议任务加入任务页。">
          <View style={styles.resultPanel}>
            <Text style={styles.resultTitle}>{result.title}</Text>
            <Text style={styles.resultSummary}>{result.summary}</Text>

            {result.sections.map((section) => (
              <View key={section.heading} style={styles.sectionBlock}>
                <Text style={styles.sectionTitle}>{section.heading}</Text>
                {section.items.map((item) => (
                  <View key={item} style={styles.bulletRow}>
                    <View style={styles.bullet} />
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.actions}>
              <Button
                label="写入聊天"
                icon="chatbubble-outline"
                variant="secondary"
                onPress={writeToChat}
              />
              <Button
                label={`加入任务${result.tasks.length ? ` ${result.tasks.length}` : ""}`}
                icon="add-circle-outline"
                onPress={writeTasks}
                disabled={!result.tasks.length}
              />
            </View>
          </View>
        </Section>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl
  },
  grid: {
    gap: spacing.sm
  },
  goalPanel: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    gap: spacing.sm
  },
  goalLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  goalInput: {
    minHeight: 72,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 21
  },
  workflow: {
    minHeight: 86,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.blueSoft,
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
    fontSize: 16,
    fontWeight: "900"
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  resultPanel: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    gap: spacing.md
  },
  resultTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  resultSummary: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  },
  sectionBlock: {
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  bullet: {
    width: 6,
    height: 6,
    marginTop: 7,
    borderRadius: 3,
    backgroundColor: colors.action
  },
  bulletText: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  errorPanel: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.dangerSoft
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  }
});

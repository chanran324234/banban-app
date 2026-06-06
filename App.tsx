import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChatScreen } from "./src/screens/ChatScreen";
import {
  initialChatMessages,
  initialMemories,
  initialSetupState,
  initialTasks,
  storageKeys
} from "./src/data/defaults";
import { getDeepSeekApiKey } from "./src/storage/apiKeyStore";
import { HomeScreen } from "./src/screens/HomeScreen";
import { MemoryScreen } from "./src/screens/MemoryScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { TasksScreen } from "./src/screens/TasksScreen";
import { WorkflowsScreen } from "./src/screens/WorkflowsScreen";
import { usePersistentState } from "./src/storage/usePersistentState";
import { colors, spacing } from "./src/theme/tokens";
import type {
  AppTab,
  ChatMessage,
  MemoryItem,
  ReminderItem,
  SetupState,
  TaskItem
} from "./src/types/domain";

const tabs: Array<{
  key: AppTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { key: "home", label: "今日", icon: "sunny-outline" },
  { key: "chat", label: "聊天", icon: "chatbubble-ellipses-outline" },
  { key: "tasks", label: "任务", icon: "checkbox-outline" },
  { key: "workflows", label: "工作流", icon: "git-branch-outline" },
  { key: "memory", label: "记忆", icon: "library-outline" },
  { key: "settings", label: "设置", icon: "settings-outline" }
];

function getInitialTab(): AppTab {
  const hash = globalThis.location?.hash?.replace("#", "");
  const tab = tabs.find((item) => item.key === hash);
  return tab?.key ?? "home";
}

function selectTab(tab: AppTab, setActiveTab: (tab: AppTab) => void) {
  setActiveTab(tab);
  if (globalThis.location) {
    globalThis.location.hash = tab;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>(getInitialTab);
  const [tasks, setTasks] = usePersistentState<TaskItem[]>(
    storageKeys.tasks,
    initialTasks
  );
  const [memories, setMemories] = usePersistentState<MemoryItem[]>(
    storageKeys.memories,
    initialMemories
  );
  const [chatMessages, setChatMessages] = usePersistentState<ChatMessage[]>(
    storageKeys.chatMessages,
    initialChatMessages
  );
  const [reminders, setReminders] = usePersistentState<ReminderItem[]>(
    storageKeys.reminders,
    []
  );
  const [setup, setSetup] = usePersistentState<SetupState>(
    storageKeys.setup,
    initialSetupState
  );
  const [hasApiKey, setHasApiKey] = useState(false);

  const refreshApiKeyStatus = () => {
    getDeepSeekApiKey()
      .then((key) => setHasApiKey(Boolean(key)))
      .catch(() => setHasApiKey(false));
  };

  useEffect(() => {
    refreshApiKeyStatus();
  }, []);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.status === "done").length,
    [tasks]
  );

  const addTask = (
    title: string,
    description: string,
    options: { openTasks?: boolean } = { openTasks: true }
  ) => {
    setTasks((current) => [
      {
        id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title,
        description,
        status: "todo",
        priority: "medium"
      },
      ...current
    ]);
    if (options.openTasks) selectTab("tasks", setActiveTab);
  };

  const saveMemory = (
    title: string,
    content: string,
    options: { openMemory?: boolean } = { openMemory: true }
  ) => {
    setMemories((current) => [
      {
        id: `memory-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: "project",
        title,
        content
      },
      ...current
    ]);
    if (options.openMemory) selectTab("memory", setActiveTab);
  };

  const appendChatMessages = (messages: ChatMessage[]) => {
    setChatMessages((current) => [...current, ...messages]);
    selectTab("chat", setActiveTab);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.appShell}>
          <View style={styles.header}>
            <View>
              <Text style={styles.appName}>伴办</Text>
              <Text style={styles.subtitle}>陪你想清楚，也帮你往前走</Text>
            </View>
            <View style={styles.progressBadge}>
              <Ionicons name="flag-outline" size={16} color={colors.ink} />
              <Text style={styles.progressText}>
                {completedCount}/{tasks.length}
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            {activeTab === "home" && (
              <HomeScreen
                tasks={tasks}
                memories={memories}
                setup={setup}
                hasApiKey={hasApiKey}
                onDismissIntro={() =>
                  setSetup((current) => ({ ...current, hasCompletedIntro: true }))
                }
                onStartChat={() => selectTab("chat", setActiveTab)}
                onOpenWorkflows={() => selectTab("workflows", setActiveTab)}
                onOpenSettings={() => selectTab("settings", setActiveTab)}
              />
            )}
            {activeTab === "chat" && (
              <ChatScreen
                messages={chatMessages}
                onChangeMessages={setChatMessages}
                onCreateTask={addTask}
                onSaveMemory={saveMemory}
              />
            )}
            {activeTab === "tasks" && (
              <TasksScreen
                tasks={tasks}
                onChangeTasks={setTasks}
                onAddReminder={(reminder) =>
                  setReminders((current) => [reminder, ...current])
                }
              />
            )}
            {activeTab === "workflows" && (
              <WorkflowsScreen
                tasks={tasks}
                memories={memories}
                messages={chatMessages}
                onCreateTask={addTask}
                onAppendMessages={appendChatMessages}
                onWorkflowRun={() =>
                  setSetup((current) => ({ ...current, hasRunWorkflow: true }))
                }
              />
            )}
            {activeTab === "memory" && (
              <MemoryScreen memories={memories} onChangeMemories={setMemories} />
            )}
            {activeTab === "settings" && (
              <SettingsScreen
                tasks={tasks}
                memories={memories}
                messages={chatMessages}
                reminders={reminders}
                setup={setup}
                onChangeReminders={setReminders}
                onApiKeyChange={refreshApiKeyStatus}
                onResetLocalData={() => {
                  setTasks([]);
                  setMemories([]);
                  setChatMessages(initialChatMessages);
                  setReminders([]);
                  setSetup(initialSetupState);
                  setHasApiKey(false);
                }}
              />
            )}
          </View>

          <View style={styles.tabBar}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  accessibilityRole="button"
                  accessibilityLabel={tab.label}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => selectTab(tab.key, setActiveTab)}
                >
                  <Ionicons
                    name={tab.icon}
                    size={20}
                    color={isActive ? colors.action : colors.muted}
                  />
                  <Text
                    numberOfLines={1}
                    style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  appShell: {
    flex: 1,
    width: "100%",
    maxWidth: 900,
    alignSelf: "center",
    backgroundColor: colors.background
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  appName: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "800"
  },
  subtitle: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 14
  },
  progressBadge: {
    minWidth: 68,
    height: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  progressText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "700"
  },
  content: {
    flex: 1
  },
  tabBar: {
    minHeight: 72,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center"
  },
  tabButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 3
  },
  tabButtonActive: {
    backgroundColor: colors.actionSoft
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700"
  },
  tabLabelActive: {
    color: colors.action
  }
});

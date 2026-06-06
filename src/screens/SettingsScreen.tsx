import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Button } from "../components/Button";
import { Section } from "../components/Section";
import { appInfo } from "../config/appInfo";
import { legalDocuments } from "../content/legal";
import { exportUserData } from "../services/dataExport";
import { cancelReminder, scheduleDailyReminder } from "../services/reminders";
import {
  deleteDeepSeekApiKey,
  getDeepSeekApiKey,
  saveDeepSeekApiKey
} from "../storage/apiKeyStore";
import { colors, spacing } from "../theme/tokens";
import type {
  ChatMessage,
  MemoryItem,
  ReminderItem,
  SetupState,
  TaskItem
} from "../types/domain";

type SettingsScreenProps = {
  tasks: TaskItem[];
  memories: MemoryItem[];
  messages: ChatMessage[];
  reminders: ReminderItem[];
  setup: SetupState;
  onChangeReminders: React.Dispatch<React.SetStateAction<ReminderItem[]>>;
  onApiKeyChange: () => void;
  onResetLocalData: () => void;
};

export function SettingsScreen({
  tasks,
  memories,
  messages,
  reminders,
  setup,
  onChangeReminders,
  onApiKeyChange,
  onResetLocalData
}: SettingsScreenProps) {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState("未配置");

  useEffect(() => {
    getDeepSeekApiKey()
      .then((storedKey) => {
        if (storedKey) {
          setApiKey(storedKey);
          setStatus("已保存");
        }
      })
      .catch(() => setStatus("读取失败"));
  }, []);

  const saveKey = async () => {
    if (!apiKey.trim()) {
      setStatus("请输入 API Key");
      return;
    }

    await saveDeepSeekApiKey(apiKey);
    setStatus("已保存");
    onApiKeyChange();
  };

  const deleteKey = async () => {
    await deleteDeepSeekApiKey();
    setApiKey("");
    setStatus("已删除");
    onApiKeyChange();
  };

  const openSource = () => {
    Linking.openURL(appInfo.repositoryUrl);
  };

  const exportData = async () => {
    await exportUserData({
      app: "banban",
      version: appInfo.version,
      exportedAt: new Date().toISOString(),
      tasks,
      memories,
      messages,
      reminders,
      setup
    });
    setStatus("数据已导出");
  };

  const clearLocalData = () => {
    Alert.alert("清空本地数据", "这会删除任务、记忆、聊天记录和 DeepSeek Key。", [
      {
        text: "取消",
        style: "cancel"
      },
      {
        text: "清空",
        style: "destructive",
        onPress: async () => {
          await Promise.all(reminders.map((reminder) => cancelReminder(reminder)));
          await deleteDeepSeekApiKey();
          setApiKey("");
          setStatus("本地数据已清空");
          onResetLocalData();
        }
      }
    ]);
  };

  const addDailyReminder = async (type: "daily_plan" | "night_review") => {
    try {
      const reminder = await scheduleDailyReminder(type);
      onChangeReminders((current) => [
        reminder,
        ...current.filter((item) => item.type !== type)
      ]);
      setStatus("提醒已设置");
    } catch (error) {
      Alert.alert(
        "提醒未设置",
        error instanceof Error ? error.message : "设置提醒时出错。"
      );
    }
  };

  const removeReminder = async (reminder: ReminderItem) => {
    await cancelReminder(reminder);
    onChangeReminders((current) =>
      current.filter((item) => item.id !== reminder.id)
    );
    setStatus("提醒已取消");
  };

  const openLegalDocument = (title: string, body: string) => {
    Alert.alert(title, body);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Section title="DeepSeek API Key" hint="伴办免费开源，不内置统一密钥。">
        <View style={styles.panel}>
          <Text style={styles.label}>连接状态：{status}</Text>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-..."
            placeholderTextColor={colors.muted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.actions}>
            <Button label="保存 Key" icon="key-outline" onPress={saveKey} />
            <Button
              label="删除"
              icon="trash-outline"
              variant="danger"
              onPress={deleteKey}
            />
          </View>
        </View>
      </Section>

      <Section title="数据控制" hint="导出和清空都只处理本机数据。">
        <View style={styles.panel}>
          <Text style={styles.text}>
            当前有 {tasks.length} 个任务、{memories.length} 条记忆、{messages.length} 条聊天消息。
          </Text>
          <View style={styles.actions}>
            <Button
              label="导出 JSON"
              icon="download-outline"
              variant="secondary"
              onPress={exportData}
            />
            <Button
              label="清空数据"
              icon="trash-outline"
              variant="danger"
              onPress={clearLocalData}
            />
          </View>
        </View>
      </Section>

      <Section title="提醒" hint="移动端使用系统通知；Web 预览暂不支持。">
        <View style={styles.panel}>
          <View style={styles.actions}>
            <Button
              label="每天 9 点计划"
              icon="sunny-outline"
              variant="secondary"
              onPress={() => addDailyReminder("daily_plan")}
            />
            <Button
              label="每天 21 点复盘"
              icon="moon-outline"
              variant="secondary"
              onPress={() => addDailyReminder("night_review")}
            />
          </View>

          {reminders.length ? (
            <View style={styles.reminderList}>
              {reminders.map((reminder) => (
                <View key={reminder.id} style={styles.reminderRow}>
                  <View style={styles.reminderCopy}>
                    <Text style={styles.reminderTitle}>{reminder.title}</Text>
                    <Text style={styles.reminderMeta}>
                      {reminder.scheduledLabel}
                    </Text>
                  </View>
                  <Button
                    label="取消"
                    icon="close-outline"
                    variant="secondary"
                    onPress={() => removeReminder(reminder)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.text}>还没有已登记的提醒。</Text>
          )}
        </View>
      </Section>

      <Section title="合规说明">
        <View style={styles.panel}>
          <View style={styles.actions}>
            {legalDocuments.map((document) => (
              <Button
                key={document.id}
                label={document.title}
                icon="document-text-outline"
                variant="secondary"
                onPress={() => openLegalDocument(document.title, document.body)}
              />
            ))}
          </View>
        </View>
      </Section>

      <Section title="开源">
        <View style={styles.panel}>
          <Text style={styles.text}>
            伴办使用 Apache-2.0 协议，代码和路线图都公开在 GitHub。
          </Text>
          <View style={styles.actions}>
            <Button
              label="开源仓库"
              icon="logo-github"
              variant="secondary"
              onPress={openSource}
            />
          </View>
        </View>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl
  },
  panel: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    gap: spacing.md
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  input: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 15
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  text: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  },
  reminderList: {
    gap: spacing.sm
  },
  reminderRow: {
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  reminderCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3
  },
  reminderTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  reminderMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  }
});

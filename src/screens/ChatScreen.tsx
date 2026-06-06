import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Button } from "../components/Button";
import { buildLocalFallback, sendCompanionTurn } from "../services/deepseek";
import { getDeepSeekApiKey } from "../storage/apiKeyStore";
import { colors, spacing } from "../theme/tokens";
import type { ChatMessage } from "../types/domain";

type ChatScreenProps = {
  messages: ChatMessage[];
  onChangeMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onCreateTask: (
    title: string,
    description: string,
    options?: { openTasks?: boolean }
  ) => void;
  onSaveMemory: (
    title: string,
    content: string,
    options?: { openMemory?: boolean }
  ) => void;
};

export function ChatScreen({
  messages,
  onChangeMessages,
  onCreateTask,
  onSaveMemory
}: ChatScreenProps) {
  const [input, setInput] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getDeepSeekApiKey().then(setApiKey).catch(() => setApiKey(null));
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text
    };

    const nextMessages = [...messages, userMessage];
    onChangeMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const result = apiKey
        ? await sendCompanionTurn({ apiKey, messages: nextMessages })
        : buildLocalFallback(text);

      onChangeMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.reply
        }
      ]);

      result.tasks.forEach((task) => {
        onCreateTask(task.title, task.description, { openTasks: false });
      });

      result.memories.forEach((memory) => {
        onSaveMemory(memory.title, memory.content, { openMemory: false });
      });
    } catch (error) {
      onChangeMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          content:
            error instanceof Error
              ? `调用 DeepSeek 时出错：${error.message}`
              : "调用 DeepSeek 时出错，请稍后再试。"
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const latestUserText =
    [...messages].reverse().find((message) => message.role === "user")
      ?.content ?? "继续推进伴办第一版";

  return (
    <View style={styles.screen}>
      {!apiKey ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>本地模式</Text>
          <Text style={styles.noticeText}>
            设置页填入自己的 DeepSeek Key 后，这里会切换为真实模型回复。
          </Text>
        </View>
      ) : null}

      <ScrollView ref={scrollRef} contentContainerStyle={styles.messages}>
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <View
              key={message.id}
              style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}
            >
              <Text style={[styles.bubbleText, isUser && styles.userText]}>
                {message.content}
              </Text>
            </View>
          );
        })}
        {isSending ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.action} />
            <Text style={styles.loadingText}>伴办正在整理下一步</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.quickActions}>
        <Button
          label="转任务"
          icon="add-circle-outline"
          variant="secondary"
          onPress={() =>
            onCreateTask(latestUserText.slice(0, 28), "从聊天里生成的待办。")
          }
        />
        <Button
          label="存记忆"
          icon="bookmark-outline"
          variant="secondary"
          onPress={() =>
            onSaveMemory("聊天沉淀", latestUserText.slice(0, 120))
          }
        />
      </View>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="说说你现在想推进什么"
          placeholderTextColor={colors.muted}
          multiline
        />
        <Button
          label="发送"
          icon="send-outline"
          onPress={sendMessage}
          disabled={!input.trim() || isSending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  notice: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.amberSoft,
    borderWidth: 1,
    borderColor: colors.line
  },
  noticeTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  noticeText: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  messages: {
    padding: spacing.lg,
    gap: spacing.sm
  },
  bubble: {
    maxWidth: "86%",
    padding: spacing.md,
    borderRadius: 8
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.action
  },
  bubbleText: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22
  },
  userText: {
    color: colors.white
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm
  },
  loadingText: {
    color: colors.muted,
    fontSize: 13
  },
  quickActions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    gap: spacing.sm
  },
  composer: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
    gap: spacing.sm
  },
  input: {
    minHeight: 64,
    maxHeight: 130,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    color: colors.ink,
    fontSize: 15,
    lineHeight: 21
  }
});

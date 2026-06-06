import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Section } from "../components/Section";
import { colors, spacing } from "../theme/tokens";
import type { MemoryItem } from "../types/domain";

type MemoryScreenProps = {
  memories: MemoryItem[];
  onChangeMemories: (memories: MemoryItem[]) => void;
};

const typeLabel: Record<MemoryItem["type"], string> = {
  goal: "目标",
  preference: "偏好",
  project: "项目",
  blocker: "卡点"
};

export function MemoryScreen({ memories, onChangeMemories }: MemoryScreenProps) {
  const deleteMemory = (id: string) => {
    onChangeMemories(memories.filter((memory) => memory.id !== id));
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Section title="长期记忆" hint="用户必须能看见、修改和删除 AI 记住的内容。">
        <View style={styles.list}>
          {memories.map((memory) => (
            <View key={memory.id} style={styles.memory}>
              <View style={styles.header}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{typeLabel[memory.type]}</Text>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`删除 ${memory.title}`}
                  onPress={() => deleteMemory(memory.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
              <Text style={styles.title}>{memory.title}</Text>
              <Text style={styles.content}>{memory.content}</Text>
            </View>
          ))}
        </View>
      </Section>
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
  memory: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    gap: spacing.sm
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  tag: {
    minWidth: 42,
    minHeight: 26,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.actionSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  tagText: {
    color: colors.actionStrong,
    fontSize: 12,
    fontWeight: "900"
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  content: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  }
});

import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme/tokens";

type SectionProps = {
  title: string;
  hint?: string;
  children: ReactNode;
};

export function Section({ title, hint, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  header: {
    marginBottom: spacing.sm,
    gap: 2
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800"
  },
  hint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  }
});

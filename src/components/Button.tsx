import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors, spacing } from "../theme/tokens";

type ButtonProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
};

export function Button({
  label,
  icon,
  onPress,
  variant = "primary",
  disabled = false
}: ButtonProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        variant === "secondary" && styles.secondary,
        variant === "danger" && styles.danger,
        disabled && styles.disabled
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={variant === "secondary" ? colors.actionStrong : colors.white}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          variant === "secondary" && styles.secondaryLabel
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.action,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  secondary: {
    backgroundColor: colors.actionSoft,
    borderWidth: 1,
    borderColor: colors.line
  },
  danger: {
    backgroundColor: colors.danger
  },
  disabled: {
    opacity: 0.55
  },
  label: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800"
  },
  secondaryLabel: {
    color: colors.actionStrong
  }
});

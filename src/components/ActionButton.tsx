import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  busy?: boolean;
};

export function ActionButton({
  label,
  onPress,
  secondary = false,
  disabled = false,
  busy = false,
}: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        (disabled || busy) && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={secondary ? colors.accent : colors.background} />
      ) : (
        <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 15,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 20,
  },
  secondary: { backgroundColor: colors.elevated, borderColor: colors.border, borderWidth: 1 },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  label: { color: colors.background, fontSize: 15, fontWeight: '800' },
  secondaryLabel: { color: colors.text },
});

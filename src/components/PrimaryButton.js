import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, fonts } from '../theme';

export default function PrimaryButton({
  label,
  onPress,
  variant = 'orange',
  style,
  disabled,
  loading,
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  orange: {
    backgroundColor: colors.orange,
  },
  dark: {
    backgroundColor: colors.slate,
  },
  mint: {
    backgroundColor: colors.mint,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.65,
  },
  label: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 16,
  },
});

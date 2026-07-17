import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

export function ThemeToggle() {
  const { colors, mode, toggleMode } = useAppTheme();
  const nextModeLabel = mode === 'dark' ? 'claro' : 'escuro';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ativar tema ${nextModeLabel}`}
      onPress={toggleMode}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.indicator,
          { backgroundColor: mode === 'dark' ? colors.secondary : colors.primary },
        ]}
      />
      <Text style={[styles.label, { color: colors.text }]}>Tema {mode === 'dark' ? 'escuro' : 'claro'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});

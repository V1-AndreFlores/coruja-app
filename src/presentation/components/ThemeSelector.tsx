import { Pressable, StyleSheet, View } from 'react-native';

import type { AppThemeMode } from '@/domain/models/AppThemeMode';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

const OPTIONS: Array<{ mode: AppThemeMode; label: string }> = [
  { mode: 'dark', label: 'Escuro' },
  { mode: 'light', label: 'Claro' },
];

export function ThemeSelector() {
  const { colors, mode, setMode } = useAppTheme();

  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const isSelected = mode === option.mode;

        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            key={option.mode}
            onPress={() => setMode(option.mode)}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: isSelected ? colors.primary : colors.card,
                borderColor: isSelected ? colors.primary : colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <AppIcon
              color={isSelected ? '#FFFFFF' : colors.textSecondary}
              name="theme"
              size={20}
            />
            <AppText
              style={[
                styles.label,
                isSelected ? styles.selectedLabel : undefined,
              ]}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    minHeight: 48,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
});

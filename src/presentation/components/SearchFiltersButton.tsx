import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

type SearchFiltersButtonProps = {
  activeCount: number;
  onPress: () => void;
};

export function SearchFiltersButton({
  activeCount,
  onPress,
}: SearchFiltersButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={
        activeCount > 0
          ? `Abrir filtros. ${activeCount} filtros ativos.`
          : 'Abrir filtros'
      }
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.surface,
          borderColor: activeCount > 0 ? colors.primary : colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <AppIcon
        color={activeCount > 0 ? colors.primary : colors.textSecondary}
        name="filter"
        size={20}
      />
      <AppText style={styles.label}>Filtros</AppText>
      {activeCount > 0 ? (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <AppText style={styles.badgeText}>{activeCount}</AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
  },
  badge: {
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});

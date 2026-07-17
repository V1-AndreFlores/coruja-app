import { Pressable, StyleSheet } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

type AppSearchButtonProps = {
  onPress: () => void;
};

export function AppSearchButton({ onPress }: AppSearchButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel="Buscar filmes e séries"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <AppIcon color={colors.textSecondary} name="search" size={22} />
      <AppText secondary style={styles.placeholder}>
        Buscar filmes, séries ou elenco
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  placeholder: {
    flex: 1,
    fontSize: 15,
  },
});

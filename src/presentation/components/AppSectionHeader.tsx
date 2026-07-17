import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

type AppSectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function AppSectionHeader({
  title,
  actionLabel,
  onActionPress,
}: AppSectionHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>{title}</AppText>
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onActionPress}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <AppText style={[styles.actionText, { color: colors.primary }]}>
            {actionLabel}
          </AppText>
          <AppIcon color={colors.primary} name="arrow-right" size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.65,
  },
});

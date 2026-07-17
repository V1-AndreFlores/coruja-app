import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppIcon, type AppIconName } from './AppIcon';
import { AppText } from './AppText';

type SettingsLinkRowProps = {
  icon: AppIconName;
  title: string;
  description?: string;
  onPress?: () => void;
};

export function SettingsLinkRow({
  icon,
  title,
  description,
  onPress,
}: SettingsLinkRowProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
        <AppIcon color={colors.primary} name={icon} size={22} />
      </View>
      <View style={styles.content}>
        <AppText style={styles.title}>{title}</AppText>
        {description ? (
          <AppText secondary style={styles.description}>
            {description}
          </AppText>
        ) : null}
      </View>
      {onPress ? (
        <AppIcon color={colors.textSecondary} name="arrow-right" size={20} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: {
    opacity: 0.65,
  },
  iconContainer: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
  },
});

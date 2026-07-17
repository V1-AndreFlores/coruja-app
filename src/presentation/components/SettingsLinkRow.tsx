import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppIcon, type AppIconName } from './AppIcon';
import { AppText } from './AppText';

type SettingsLinkRowProps = {
  icon: AppIconName;
  title: string;
  description?: string;
  onPress?: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
};

export function SettingsLinkRow({
  icon,
  title,
  description,
  onPress,
  disabled = false,
  tone = 'default',
}: SettingsLinkRowProps) {
  const { colors } = useAppTheme();
  const isInteractive = Boolean(onPress) && !disabled;
  const accentColor = colors.primary;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { disabled } : undefined}
      disabled={!isInteractive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
        <AppIcon color={accentColor} name={icon} size={22} />
      </View>
      <View style={styles.content}>
        <AppText
          style={[
            styles.title,
            tone === 'danger' && { color: colors.primary },
          ]}
        >
          {title}
        </AppText>
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
  disabled: {
    opacity: 0.48,
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

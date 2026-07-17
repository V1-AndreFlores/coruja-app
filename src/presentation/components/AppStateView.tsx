import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppIcon, type AppIconName } from './AppIcon';
import { AppText } from './AppText';

type AppStateVariant = 'loading' | 'empty' | 'error';

type AppStateViewProps = {
  variant: AppStateVariant;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

const ICON_BY_VARIANT: Record<Exclude<AppStateVariant, 'loading'>, AppIconName> = {
  empty: 'empty',
  error: 'error',
};

export function AppStateView({
  variant,
  title,
  description,
  actionLabel,
  onActionPress,
}: AppStateViewProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
        {variant === 'loading' ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <AppIcon
            color={variant === 'error' ? colors.primary : colors.textSecondary}
            name={ICON_BY_VARIANT[variant]}
            size={30}
          />
        )}
      </View>
      <AppText style={styles.title}>{title}</AppText>
      <AppText secondary style={styles.description}>
        {description}
      </AppText>
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onActionPress}
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: colors.primary, opacity: pressed ? 0.72 : 1 },
          ]}
        >
          <AppText style={styles.actionText}>{actionLabel}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  iconContainer: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    maxWidth: 320,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  action: {
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 18,
    marginTop: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

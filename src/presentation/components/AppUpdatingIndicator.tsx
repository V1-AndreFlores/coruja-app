import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/presentation/components/AppText';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

type AppUpdatingIndicatorProps = {
  message?: string;
};

export function AppUpdatingIndicator({
  message = 'Atualizando...',
}: AppUpdatingIndicatorProps) {
  const { colors } = useAppTheme();

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      pointerEvents="none"
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <ActivityIndicator color={colors.primary} size="small" />
      <AppText secondary style={styles.message}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  message: {
    fontSize: 12,
    fontWeight: '700',
  },
});

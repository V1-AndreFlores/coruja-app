import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from '@/presentation/components/AppText';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

type AppLoadingOverlayProps = {
  message: string;
};

export function AppLoadingOverlay({ message }: AppLoadingOverlayProps) {
  const { colors, mode } = useAppTheme();

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      accessibilityLabel={message}
      style={[
        styles.overlay,
        {
          backgroundColor:
            mode === 'dark'
              ? 'rgba(11, 15, 20, 0.94)'
              : 'rgba(247, 249, 252, 0.95)',
        },
      ]}
    >
      <View style={styles.content}>
        <ActivityIndicator color={colors.primary} size="large" />
        <AppText style={styles.message}>{message}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
    elevation: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  content: {
    maxWidth: 320,
    alignItems: 'center',
    gap: 18,
  },
  message: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
    textAlign: 'center',
  },
});

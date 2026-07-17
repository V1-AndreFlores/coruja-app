import { PropsWithChildren } from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

type AppScreenProps = PropsWithChildren<{
  bottomSpacing?: number;
  contentStyle?: StyleProp<ViewStyle>;
  scroll?: boolean;
}>;

export function AppScreen({
  bottomSpacing = 0,
  children,
  contentStyle,
  scroll = false,
}: AppScreenProps) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, styles.scrollContent, contentStyle]}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          {children}
          {bottomSpacing > 0 ? (
            <View
              pointerEvents="none"
              style={[styles.bottomSpacer, { height: bottomSpacing }]}
            />
          ) : null}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bottomSpacer: {
    flexShrink: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
});

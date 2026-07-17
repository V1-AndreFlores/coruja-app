import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

export function TitleDetailsSkeleton() {
  const { colors } = useAppTheme();
  const blockStyle = { backgroundColor: colors.card };

  return (
    <View style={styles.container}>
      <View style={[styles.backdrop, blockStyle]} />
      <View style={styles.content}>
        <View style={[styles.title, blockStyle]} />
        <View style={[styles.metadata, blockStyle]} />
        <View style={styles.actions}>
          <View style={[styles.action, blockStyle]} />
          <View style={[styles.action, blockStyle]} />
          <View style={[styles.action, blockStyle]} />
        </View>
        <View style={[styles.line, blockStyle]} />
        <View style={[styles.line, styles.shortLine, blockStyle]} />
        <View style={[styles.section, blockStyle]} />
        <View style={[styles.section, blockStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    height: 260,
  },
  content: {
    gap: 16,
    padding: 20,
  },
  title: {
    width: '70%',
    height: 34,
    borderRadius: 10,
  },
  metadata: {
    width: '45%',
    height: 18,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    flex: 1,
    height: 48,
    borderRadius: 14,
  },
  line: {
    width: '100%',
    height: 15,
    borderRadius: 7,
  },
  shortLine: {
    width: '82%',
  },
  section: {
    height: 130,
    borderRadius: 18,
  },
});

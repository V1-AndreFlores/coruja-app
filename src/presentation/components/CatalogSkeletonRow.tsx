import { ScrollView, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppText } from './AppText';

export function CatalogSkeletonRow() {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {[0, 1, 2].map((item) => (
        <View key={item} style={styles.item}>
          <View style={[styles.poster, { backgroundColor: colors.card }]} />
          <View style={[styles.titleLine, { backgroundColor: colors.card }]} />
          <AppText secondary style={styles.caption}>
            Catálogo em preparação
          </AppText>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 14,
    paddingRight: 20,
  },
  item: {
    width: 124,
    gap: 8,
  },
  poster: {
    width: 124,
    height: 174,
    borderRadius: 16,
  },
  titleLine: {
    width: 96,
    height: 12,
    borderRadius: 6,
  },
  caption: {
    fontSize: 11,
    lineHeight: 15,
  },
});

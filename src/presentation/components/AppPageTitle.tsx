import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

type AppPageTitleProps = {
  title: string;
  description?: string;
};

export function AppPageTitle({ title, description }: AppPageTitleProps) {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>{title}</AppText>
      {description ? (
        <AppText secondary style={styles.description}>
          {description}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
});

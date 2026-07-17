import { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppText } from './AppText';

type SettingsCardProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

export function SettingsCard({
  title,
  description,
  children,
}: SettingsCardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <AppText style={styles.title}>{title}</AppText>
        {description ? (
          <AppText secondary style={styles.description}>
            {description}
          </AppText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  header: {
    gap: 5,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
});

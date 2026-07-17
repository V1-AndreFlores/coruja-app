import { Image, StyleSheet, View } from 'react-native';

import type { WatchProvider } from '@/domain/models/TitleDetails';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';
import { TMDB } from '@/shared/constants/tmdb';

import { AppText } from './AppText';

type WatchProviderGroupProps = {
  title: string;
  providers: WatchProvider[];
};

export function WatchProviderGroup({
  title,
  providers,
}: WatchProviderGroupProps) {
  const { colors } = useAppTheme();

  if (providers.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>{title}</AppText>
      <View style={styles.providers}>
        {providers.map((provider) => (
          <View key={provider.id} style={styles.provider}>
            <View
              style={[
                styles.logoContainer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {provider.logoPath ? (
                <Image
                  accessibilityIgnoresInvertColors
                  source={{
                    uri: `${TMDB.imageBaseUrl}/${TMDB.providerLogoSize}${provider.logoPath}`,
                  }}
                  style={styles.logo}
                />
              ) : null}
            </View>
            <AppText numberOfLines={2} secondary style={styles.name}>
              {provider.name}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
  },
  providers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  provider: {
    width: 74,
    gap: 5,
  },
  logoContainer: {
    width: 58,
    height: 58,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 13,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 10,
    lineHeight: 13,
  },
});

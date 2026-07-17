import { Image, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';
import { TMDB } from '@/shared/constants/tmdb';

import { AppIcon } from './AppIcon';

type CatalogPosterProps = {
  posterPath?: string | null;
  width: number;
  height: number;
};

export function CatalogPoster({ posterPath, width, height }: CatalogPosterProps) {
  const { colors } = useAppTheme();

  if (!posterPath) {
    return (
      <View
        style={[
          styles.placeholder,
          { width, height, backgroundColor: colors.card },
        ]}
      >
        <AppIcon color={colors.textSecondary} name="movie" size={36} />
      </View>
    );
  }

  return (
    <Image
      accessibilityIgnoresInvertColors
      resizeMode="cover"
      source={{
        uri: `${TMDB.imageBaseUrl}/${TMDB.posterSize}${posterPath}`,
      }}
      style={{ width, height }}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

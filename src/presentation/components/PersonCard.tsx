import { Image, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';
import { TMDB } from '@/shared/constants/tmdb';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';

type PersonCardProps = {
  name: string;
  subtitle?: string | null;
  profilePath?: string | null;
};

export function PersonCard({ name, subtitle, profilePath }: PersonCardProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.photoContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {profilePath ? (
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="cover"
            source={{
              uri: `${TMDB.imageBaseUrl}/${TMDB.profileSize}${profilePath}`,
            }}
            style={styles.photo}
          />
        ) : (
          <AppIcon color={colors.textSecondary} name="person" size={34} />
        )}
      </View>
      <AppText numberOfLines={2} style={styles.name}>
        {name}
      </AppText>
      {subtitle ? (
        <AppText numberOfLines={2} secondary style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 112,
    gap: 5,
  },
  photoContainer: {
    width: 112,
    height: 142,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 16,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  subtitle: {
    fontSize: 11,
    lineHeight: 15,
  },
});

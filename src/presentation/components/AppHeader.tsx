import { Image, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

type AppHeaderProps = {
  compact?: boolean;
};

export function AppHeader({ compact = false }: AppHeaderProps) {
  const { mode } = useAppTheme();

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>
      <Image
        accessibilityLabel="Coruja - Sobre filmes e séries"
        resizeMode="contain"
        source={
          mode === 'dark'
            ? require('../../../assets/images/logo-dark.png')
            : require('../../../assets/images/logo-light.png')
        }
        style={[styles.logo, compact && styles.compactLogo]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 64,
    justifyContent: 'center',
  },
  compactContainer: {
    minHeight: 52,
  },
  logo: {
    width: 210,
    height: 64,
  },
  compactLogo: {
    width: 170,
    height: 50,
  },
});

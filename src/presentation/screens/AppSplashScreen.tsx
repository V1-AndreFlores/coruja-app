import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';
import { SPLASH_MINIMUM_DURATION_MS } from '@/shared/constants/timing';

export function AppSplashScreen() {
  const { isHydrated } = useAppTheme();
  const [minimumDurationElapsed, setMinimumDurationElapsed] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setMinimumDurationElapsed(true);
    }, SPLASH_MINIMUM_DURATION_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (minimumDurationElapsed && isHydrated) {
      router.replace('/(tabs)/inicio');
    }
  }, [isHydrated, minimumDurationElapsed]);

  return (
    <View style={styles.container}>
      <View style={styles.brandStage}>
        <Image
          accessibilityLabel="Coruja - Sobre filmes e séries"
          resizeMode="contain"
          source={require('../../../assets/images/splash-brand.png')}
          style={styles.brand}
        />

        <ActivityIndicator color="#FF4B4B" size="small" style={styles.loader} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B0F14',
  },
  brandStage: {
    width: 320,
    height: 320,
  },
  brand: {
    ...StyleSheet.absoluteFill,
    width: 320,
    height: 320,
  },
  loader: {
    position: 'absolute',
    top: 220,
    alignSelf: 'center',
  },
});

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
      <Image
        accessibilityLabel="Coruja - Sobre filmes e séries"
        resizeMode="cover"
        source={require('../../../assets/images/splash.png')}
        style={styles.backgroundImage}
      />

      <View pointerEvents="none" style={styles.loaderContainer}>
        <ActivityIndicator color="#FF4B4B" size="large" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F14',
    overflow: 'hidden',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  loaderContainer: {
    position: 'absolute',
    top: '62%',
    right: 0,
    left: 0,
    alignItems: 'center',
  },
});

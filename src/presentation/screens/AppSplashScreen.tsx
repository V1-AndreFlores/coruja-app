import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  View,
} from 'react-native';

import { useAppTheme } from '@/presentation/theme/AppThemeProvider';
import { SPLASH_MINIMUM_DURATION_MS } from '@/shared/constants/timing';

export function AppSplashScreen() {
  const { isHydrated } = useAppTheme();
  const [minimumDurationElapsed, setMinimumDurationElapsed] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    const timeoutId = setTimeout(() => {
      setMinimumDurationElapsed(true);
    }, SPLASH_MINIMUM_DURATION_MS);

    return () => {
      animation.stop();
      clearTimeout(timeoutId);
    };
  }, [opacity, scale]);

  useEffect(() => {
    if (minimumDurationElapsed && isHydrated) {
      router.replace('/(tabs)/inicio');
    }
  }, [isHydrated, minimumDurationElapsed]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image
          accessibilityLabel="Coruja - Sobre filmes e séries"
          resizeMode="contain"
          source={require('../../../assets/images/splash-icon.png')}
          style={styles.logo}
        />
      </Animated.View>

      <ActivityIndicator color="#FF4B4B" size="small" style={styles.loader} />
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
  logo: {
    width: 320,
    height: 400,
  },
  loader: {
    marginTop: 18,
  },
});

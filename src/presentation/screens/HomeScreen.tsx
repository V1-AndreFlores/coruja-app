import { Image, StyleSheet, View } from 'react-native';

import { AppScreen } from '@/presentation/components/AppScreen';
import { AppText } from '@/presentation/components/AppText';
import { ThemeToggle } from '@/presentation/components/ThemeToggle';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

export function HomeScreen() {
  const { colors, mode } = useAppTheme();

  return (
    <AppScreen contentStyle={styles.container}>
      <Image
        resizeMode="contain"
        source={
          mode === 'dark'
            ? require('../../../assets/images/logo-dark.png')
            : require('../../../assets/images/logo-light.png')
        }
        style={styles.logo}
      />

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <AppText style={styles.eyebrow}>ESTRUTURA INICIAL</AppText>
        <AppText style={styles.title}>Projeto iniciado</AppText>
        <AppText secondary style={styles.description}>
          A base do Coruja está pronta para receber navegação, integração com a API,
          pesquisa, detalhes de títulos, favoritos e disponibilidade de streaming no Brasil.
        </AppText>
      </View>

      <ThemeToggle />

      <AppText secondary style={styles.footer}>
        React Native · Expo · TypeScript
      </AppText>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    gap: 24,
  },
  logo: {
    width: '100%',
    height: 120,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 22,
    gap: 10,
  },
  eyebrow: {
    color: '#FF4B4B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
  },
});

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { AppScreen } from '@/presentation/components/AppScreen';
import { AppText } from '@/presentation/components/AppText';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

export function NotFoundScreen() {
  const { colors } = useAppTheme();

  return (
    <AppScreen contentStyle={styles.container}>
      <AppText style={styles.title}>Página não encontrada</AppText>
      <AppText secondary style={styles.description}>
        A rota informada não existe ou ainda não foi implementada.
      </AppText>
      <Pressable
        onPress={() => router.replace('/home')}
        style={[styles.button, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.buttonText}>Voltar ao início</Text>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: 14,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

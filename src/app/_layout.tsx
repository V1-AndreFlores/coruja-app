import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppThemeProvider, useAppTheme } from '@/presentation/theme/AppThemeProvider';

function AppNavigation() {
  const { colors, mode } = useAppTheme();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          animation: 'fade',
          contentStyle: { backgroundColor: colors.background },
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="home" />
        <Stack.Screen name="history" />
        <Stack.Screen name="about" />
        <Stack.Screen name="data-management" />
        <Stack.Screen name="title/[mediaType]/[id]" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AppNavigation />
    </AppThemeProvider>
  );
}

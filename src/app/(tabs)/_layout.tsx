import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { AppIcon, type AppIconName } from '@/presentation/components/AppIcon';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

type TabIconProps = {
  color: ColorValue;
  name: AppIconName;
};

function TabIcon({ color, name }: TabIconProps) {
  return <AppIcon color={color} name={name} size={24} />;
}

export default function TabsLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      initialRouteName="inicio"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 3,
        },
        tabBarStyle: {
          height: 68,
          paddingTop: 7,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="inicio"
        options={{
          title: 'Início',
          tabBarAccessibilityLabel: 'Início',
          tabBarIcon: ({ color }) => <TabIcon color={color} name="home" />,
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: 'Buscar',
          tabBarAccessibilityLabel: 'Buscar',
          tabBarIcon: ({ color }) => <TabIcon color={color} name="search" />,
        }}
      />
      <Tabs.Screen
        name="quero-assistir"
        options={{
          title: 'Quero assistir',
          tabBarAccessibilityLabel: 'Quero assistir',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name="watchlist" />
          ),
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: 'Favoritos',
          tabBarAccessibilityLabel: 'Favoritos',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name="favorite" />
          ),
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
          tabBarAccessibilityLabel: 'Ajustes',
          tabBarIcon: ({ color }) => <TabIcon color={color} name="settings" />,
        }}
      />
    </Tabs>
  );
}

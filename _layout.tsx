import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme';

type IconName = React.ComponentProps<typeof Feather>['name'];

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Início', icon: 'home' },
  { name: 'planejamento', title: 'Planejamento', icon: 'calendar' },
  { name: 'progresso', title: 'Progresso', icon: 'bar-chart-2' },
  { name: 'perfil', title: 'Perfil', icon: 'user' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.naturalGray,
        tabBarStyle: { backgroundColor: colors.softWhite, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.cream },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarAccessibilityLabel: t.title,
            tabBarIcon: ({ color, size }) => <Feather name={t.icon} size={size - 2} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}

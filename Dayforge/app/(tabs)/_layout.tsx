import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type PlatformIconName = {
  ios: string;
  android: string;
  web: string;
};

function getIconName(icon: PlatformIconName): string {
  return (
    Platform.select({
      ios: icon.ios,
      android: icon.android,
      web: icon.web,
      default: icon.web,
    }) || icon.web
  );
}

function TabIcon({ color, name, size = 22 }: { color: string; name: PlatformIconName; size?: number }) {
  return <SymbolView name={getIconName(name) as any} tintColor={color} size={size} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'dark'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.tabIconSelected,
        tabBarInactiveTintColor: palette.tabIconDefault,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: {
          ...styles.tabBar,
          backgroundColor: palette.tabBackground,
          borderTopColor: palette.border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'house.fill', android: 'home', web: 'home' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="task"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'checkmark.square.fill', android: 'checklist', web: 'checklist' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarLabel: 'Habits',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'arrow.triangle.2.circlepath', android: 'repeat', web: 'repeat' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="reflect"
        options={{
          title: 'Reflect',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'book.closed.fill', android: 'menu_book', web: 'menu_book' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 84,
    borderTopWidth: 1,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    marginTop: 2,
  },
});

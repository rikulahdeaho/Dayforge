import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Redirect, Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useAppState } from '@/store/appState';

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

function TabIcon({
  color,
  focused,
  name,
  size = 22,
  highlightColor,
}: {
  color: string;
  focused: boolean;
  name: PlatformIconName;
  size?: number;
  highlightColor: string;
}) {
  return (
    <View
      style={[
        styles.iconWrap,
        focused
          ? {
              backgroundColor: `${highlightColor}33`,
              borderColor: `${highlightColor}66`,
            }
          : null,
      ]}>
      <SymbolView name={getIconName(name) as any} tintColor={color} size={size} />
    </View>
  );
}

export default function TabLayout() {
  const { isHydrated, state } = useAppState();
  const palette = state.preferences.darkMode ? Colors.dark : Colors.light;

  if (!isHydrated) {
    return null;
  }

  if (!state.hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

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
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              highlightColor={palette.accentStrong}
              name={{ ios: 'house.fill', android: 'home', web: 'home' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="task"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              highlightColor={palette.accentStrong}
              name={{ ios: 'checkmark.square.fill', android: 'checklist', web: 'checklist' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarLabel: 'Habits',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              highlightColor={palette.accentStrong}
              name={{ ios: 'arrow.triangle.2.circlepath', android: 'repeat', web: 'repeat' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reflect"
        options={{
          title: 'Reflect',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              highlightColor={palette.accentStrong}
              name={{ ios: 'book.closed.fill', android: 'menu_book', web: 'menu_book' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              highlightColor={palette.accentStrong}
              name={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }}
            />
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
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
});

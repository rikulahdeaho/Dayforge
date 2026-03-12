import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

type IconName = {
  ios: any;
  android: any;
  web: any;
};

function TabIcon({ color, name, size = 22 }: { color: string; name: IconName; size?: number }) {
  return <SymbolView name={name as any} tintColor={color} size={size} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];

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
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color }) => (
            <TabIcon
              color={color}
              name={{ ios: 'calendar', android: 'calendar_month', web: 'calendar_month' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.centerOrb,
                {
                  borderColor: focused ? palette.accentSoft : palette.border,
                  shadowColor: palette.accentStrong,
                  backgroundColor: focused ? palette.accentStrong : palette.cardStrong,
                },
              ]}>
              <TabIcon
                color={focused ? '#ffffff' : palette.tabIconDefault}
                size={24}
                name={{ ios: 'plus', android: 'add', web: 'add' }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reflect"
        options={{
          title: 'Reflect',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'person.fill', android: 'person', web: 'person' }} />
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
  centerOrb: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -18,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 9,
  },
});

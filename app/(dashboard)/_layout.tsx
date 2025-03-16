import { Tabs, Redirect } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/Expo/navigation/TabBarIcon';
import { useAuthStore } from '@/store/authStore';
import { ScreenPath } from '@/enums/Paths';

export default function DashboardLayout() {
  const { authenticated } = useAuthStore();

  if (!authenticated) {
    return <Redirect href={ScreenPath.AuthLogin} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'black',
          borderTopWidth: 0,
        },
        tabBarActiveTintColor: 'white',
      }}>
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'speedometer' : 'speedometer-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explorer/index"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'compass' : 'compass-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats/index"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

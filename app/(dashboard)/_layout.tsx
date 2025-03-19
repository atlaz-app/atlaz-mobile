import { Tabs, Redirect, router, usePathname } from 'expo-router';
import React from 'react';

import { CallibriSensor } from 'react-native-neurosdk2';
import { TabBarIcon } from '@/components/Expo/navigation/TabBarIcon';
import { useAuthStore } from '@/store/authStore';
import { ScreenPath } from '@/enums/Paths';
import { useGlobalStore } from '@/store';
import { scanner } from '@/infrastructure/clients';

export default function DashboardLayout() {
  const { sensorList, setActiveSensor, setSensorList } = useGlobalStore();
  const { authenticated } = useAuthStore();
  const pathname = usePathname();

  React.useEffect(() => {
    Object.entries(sensorList || {}).forEach(async ([address, sensorData]) => {
      if (sensorData?.info && sensorData.connected) {
        const newSensor = (await scanner.createSensor(sensorData.info)) as CallibriSensor;

        setSensorList({
          ...sensorList,
          [address]: {
            ...sensorList?.[address],
            sensor: newSensor,
            connected: true,
          },
        });
        setActiveSensor(address);

        console.log('Sensor reconnected', address);
      }
    });
  }, []);

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
        listeners={{
          tabPress: (e) => {
            console.log(pathname, !pathname.includes('/tracker/monitor'));
            if (!pathname.includes('/tracker')) {
              e.preventDefault();
              router.replace('/(dashboard)/tracker/preset/saved');
            }
          },
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

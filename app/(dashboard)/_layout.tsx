import { Tabs, Redirect, router, usePathname } from 'expo-router';
import React from 'react';

import { CallibriSensor, SensorCommand, SensorState } from 'react-native-neurosdk2';
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
    Object.entries(sensorList).forEach(async ([address, sensorData]) => {
      if (sensorData?.sensor && sensorData.connected) {
        try {
          const sensorInfo = sensorList[address].info;
          const sensorToConnect = (await scanner.createSensor(sensorInfo!)) as CallibriSensor;
          console.log('connect', sensorToConnect);
          const isSensorFound = await sensorToConnect.execute(SensorCommand.FindMe);

          if (isSensorFound !== 'success') {
            setSensorList({
              ...sensorList,
              [address]: {
                ...sensorList?.[address],
                connected: false,
              },
            });
            setActiveSensor(undefined);
            console.log('No sensor connected');
          }

          sensorToConnect.AddConnectionChanged((state) => {
            if (state === SensorState.OutOfRange) {
              setSensorList({
                ...sensorList,
                [address]: {
                  ...sensorList?.[address],
                  connected: false,
                },
              });
              setActiveSensor(undefined);
            }
          });

          setSensorList({
            ...sensorList,
            [address]: {
              ...sensorList?.[address],
              sensor: sensorToConnect,
              connected: true,
            },
          });
          setActiveSensor(address);

          console.log('Sensor reconnected', address);
        } catch {
          setSensorList({
            ...sensorList,
            [address]: {
              ...sensorList?.[address],
              connected: false,
            },
          });
          setActiveSensor(undefined);

          console.log('No sensor connected');
        }
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

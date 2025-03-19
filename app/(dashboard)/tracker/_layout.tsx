import { Stack } from 'expo-router';
import React from 'react';

export default function TrackerLayout() {
  // useFocusEffect(
  //   React.useCallback(() => {
  //     // Replace with the initial route (e.g., index)
  //     router.replace('/(dashboard)/tracker');
  //   }, [router]),
  // );
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#000000' },
        headerShown: false,
      }}>
      <Stack.Screen
        name="preset"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="monitor/index" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
    </Stack>
  );
}

import { Stack } from 'expo-router';
import React from 'react';

export default function TrackerPresetLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#000000' },
        headerShown: false,
        headerStyle: {
          backgroundColor: 'black',
        },
        headerTitleStyle: { color: 'black' },
        headerTintColor: 'white',
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="saved/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="new" options={{ headerShown: true, headerBackTitleVisible: false }} />
    </Stack>
  );
}

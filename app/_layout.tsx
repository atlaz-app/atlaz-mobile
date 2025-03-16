import { router, Stack } from 'expo-router';
import '../global.css';
import React from 'react';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout() {
  const { authenticated } = useAuthStore();

  React.useEffect(() => {
    router.push(authenticated ? '/(dashboard)/explorer' : '/(auth)/login');
  }, [authenticated]);

  return authenticated ? (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: '#000000' },
      }}>
      <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  ) : (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

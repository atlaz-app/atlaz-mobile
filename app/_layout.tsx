import { router, Stack } from 'expo-router';
import '../global.css';
import React from 'react';
import * as SystemUI from 'expo-system-ui';
import { StyleSheet, View } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { useAuthStore } from '@/store/authStore';
import { ScreenPath } from '@/enums/Paths';

StyleSheet.create({
  '*': {
    backgroundColor: '#000000', // Wildcard—applies to all elements
  },
});
SystemUI.setBackgroundColorAsync('black');

export default function RootLayout() {
  const { authenticated } = useAuthStore();

  React.useEffect(() => {
    enableScreens(true);
    const get = async () => {
      const color = await SystemUI.getBackgroundColorAsync();

      console.log('col', color);
    };

    get();
  }, []);

  React.useEffect(() => {
    router.push(authenticated ? ScreenPath.DashboardExplorer : ScreenPath.AuthLogin);
  }, [authenticated]);

  return (
    <View style={styles.container}>
      {authenticated ? (
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: 'black' },
            headerStyle: { backgroundColor: 'black' },
            gestureEnabled: false,
          }}>
          <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      ) : (
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: 'black' },
            headerStyle: { backgroundColor: 'black' },
            gestureEnabled: false,
          }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Root black background
  },
});

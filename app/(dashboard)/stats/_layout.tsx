import { Stack } from 'expo-router';

export default function StatsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
        animation: 'slide_from_right',
        headerStyle: {
          backgroundColor: 'black',
        },
        headerTitleStyle: { color: 'black' },
        headerTintColor: 'white',
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[traceId]/index" options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal' }} />
      <Stack.Screen
        name="[traceId]/recording"
        options={{ headerShown: true, headerBackButtonDisplayMode: 'minimal', presentation: 'modal' }}
      />
    </Stack>
  );
}

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_bottom',
        headerShown: false,
        animationDuration: 500,
        contentStyle: { backgroundColor: '#000000' },
      }}>
      <Stack.Screen name="login/index" />
      <Stack.Screen name="registration/index" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

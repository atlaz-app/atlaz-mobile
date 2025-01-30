import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_bottom",
        headerShown: false,
        animationDuration: 500,
      }}
    >
      <Stack.Screen name="login/index" />
      <Stack.Screen name="register/index" options={{ presentation: "modal" }} />
    </Stack>
  );
}

import { useAuthStore } from "@/store/authStore";
import { router, Slot, Stack } from "expo-router";
import { Text, View } from "react-native";
import "../global.css";
import React from "react";

export default function Root() {
  const { authenticated } = useAuthStore();

  console.log("root", authenticated);

  React.useEffect(() => {
    router.push(authenticated ? "/(dashboard)/home" : "/(auth)/login");
  }, []);

  return authenticated ? (
    <Stack>
      <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  ) : (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
}

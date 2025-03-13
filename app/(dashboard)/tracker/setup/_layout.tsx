import { useAuthStore } from "@/store/authStore";
import { router, Slot, Stack } from "expo-router";
import { Text, View } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Tracker() {
  const insets = useSafeAreaInsets();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#000000" },
        headerShown: false,
        headerStyle: {
          backgroundColor: "black",
        },
        headerTitleStyle: { color: "black" },
        headerTintColor: "white",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="preset-list/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="create-preset"
        options={{ headerShown: true, headerBackTitleVisible: false }}
      />
    </Stack>
  );
}

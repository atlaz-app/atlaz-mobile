import { useAuthStore } from "@/store/authStore";
import { router, Slot, Stack } from "expo-router";
import { Text, View } from "react-native";
import React from "react";

export default function Tracker() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: "#000000" },
        headerShown: false,
      }}
    >
      <Stack.Screen name="setup/index" options={{ headerShown: false }} />
      <Stack.Screen
        name="track/index"
        options={{ headerShown: false, animation: "slide_from_bottom" }}
      />
    </Stack>
  );
}

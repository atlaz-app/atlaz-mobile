import { Image, StyleSheet, Platform, Button } from "react-native";
import React, { useState, useEffect } from "react";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link, router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { scanner } from "@/infrastructure/clients";

export default function HomeScreen() {
  const {
    authenticated,
    setAuthenticated,
    username,
    setAccessToken,
    setRefreshToken,
  } = useAuthStore();

  React.useEffect(() => {
    const scanForSensors = async () => {
      const start = await scanner.start();
      const sensors = await scanner.sensors();
      // const sensor = await scanner.createSensor(sensors[0]);

      console.log("effect", start, sensors);
    };

    scanner.AddSensorListChanged((sensors) => {
      console.log("show sensors", sensors);
    });

    scanForSensors();
  }, []);

  console.log("scanner", scanner);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<Image source={require("@/assets/images/dmt.jpg")} />}
    >
      <ThemedView>
        <ThemedText type="title">Hi, {username}!</ThemedText>
      </ThemedView>
      <Button
        onPress={async () => {
          setAuthenticated(false);
          setAccessToken("");
          setRefreshToken("");

          router.replace("/(auth)/login");
        }}
        title="Sign Out"
      />
    </ParallaxScrollView>
  );
}

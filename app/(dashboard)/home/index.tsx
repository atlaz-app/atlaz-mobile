import { Image, StyleSheet, Platform, Button } from "react-native";
import React, { useState, useEffect } from "react";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Link, router } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function HomeScreen() {
  // State to hold the fetched data
  const [coffees, setCoffees] = useState([{ title: "test" }]);
  const [loading, setLoading] = useState(true);
  const [bestCoffee, setBestCoffee] = useState({ description: "" });
  const [counter, setCounter] = useState(1);
  const {
    authenticated,
    setAuthenticated,
    username,
    setAccessToken,
    setRefreshToken,
  } = useAuthStore();

  // Fetch the data when the component mounts
  useEffect(() => {
    // const fetchCoffees = async () => {
    //   try {
    //     const response = await fetch("https://api.sampleapis.com/coffee/hot");
    //     const data = await response.json();
    //     setCoffees(data); // Assuming data.data contains the array of employees
    //     setLoading(false);
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //     setLoading(false);
    //   }
    // };
    // fetchCoffees();
  }, []);

  const fetchCoffee = async () => {
    try {
      const response = await fetch("https://api.sampleapis.com/coffee/hot/6");
      const coffee = await response.json();
      setBestCoffee(coffee); // Assuming data.data contains the array of employees
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/dmt.jpg")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Hi, {username}!</ThemedText>
        <HelloWave />
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

      {loading ? (
        <ThemedText>Loading...</ThemedText>
      ) : (
        <ThemedText>{coffees[3].title}</ThemedText>
      )}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: ne pizdiii</ThemedText>
        <ThemedText>
          Edit{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText>{" "}
          to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({ ios: "cmd + d", android: "cmd + m" })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this
          starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{" "}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText>{" "}
          to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText>{" "}
          directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{" "}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
      <Button
        title="add"
        color={"red"}
        onPress={() => setCounter(counter + 1)}
      />
      <ThemedView style={styles.stepContainer}>
        <ThemedText style={counter > 5 ? { color: "blue" } : { color: "red" }}>
          {counter}
        </ThemedText>
      </ThemedView>
      <Button title="find" color={"red"} onPress={fetchCoffee} />
      <ThemedView style={styles.stepContainer}>
        {!!bestCoffee && (
          <ThemedText>Best Employeee: {bestCoffee.description}</ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 260,
    width: 390,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});

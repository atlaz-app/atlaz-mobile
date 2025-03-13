import React from "react";
import {
  ScrollView,
  View,
  Image,
  Text,
  Pressable,
  Modal,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Button,
  TextInput,
} from "react-native";

import { BaseButton } from "@/core/Buttons";
import { Link, router, useRouter } from "expo-router";
import { useTrackerStore } from "@/store/trackerStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TrackerMode } from "@/enums/Common";
import { useGlobalStore, usePresetStore } from "@/store";

export default function SetupCreatePresetSave() {
  const { setName } = usePresetStore();

  return (
    <ScrollView className="w-full h-screen bg-black p-4">
      <View className="w-full bg-black flex justify-end gap-4 h-[480px]">
        <Text className="text-white mt-24 text-lg font-semibold pl-4">
          Name your preset
        </Text>
        <TextInput
          className="w-full rounded-xl p-4 placeholder:text-white/50 text-white placeholder:text-sm h-[50] bg-gray-800"
          cursorColor={"white"}
          selectionColor={"white"}
          onChangeText={(text) => setName(text)}
          placeholder="Name your preset"
        />
        <Text className="text-white mt-24 text-lg font-semibold">
          If you don’t name your preset, it will not be saved to your library
        </Text>
      </View>
    </ScrollView>
  );
}

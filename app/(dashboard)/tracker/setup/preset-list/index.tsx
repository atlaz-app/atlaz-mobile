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
  FlatList,
  SafeAreaView,
} from "react-native";

import { BaseButton } from "@/core/Buttons";
import { Link, router, useRouter } from "expo-router";
import { useTrackerStore } from "@/store/trackerStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TrackerMode } from "@/enums/Common";
import { useGlobalStore } from "@/store";
import {
  CallibriSignalType,
  SensorADCInput,
  SensorCommand,
  SensorDataOffset,
  SensorFilter,
  SensorGain,
} from "react-native-neurosdk2";
import useSWR from "swr";
import { BackendPaths } from "@/enums/Paths";
import { UserApi } from "@/infrastructure/services/User";
import { Preset } from "@/types/components";
import clsx from "clsx";

export default function PresetList() {
  const router = useRouter();
  const { setConfig } = useTrackerStore();

  const { data, error, mutate } = useSWR(BackendPaths.UserPresets, async () => {
    const response = await UserApi.presets.getPresetList();
    return response.data;
  });

  const pickPreset = async (preset: Preset) => {
    setConfig(preset);
    router.navigate("/(dashboard)/tracker/track");
  };

  const deletePreset = async (presetId: number) => {
    const response = await UserApi.presets.deletePreset(presetId);
    mutate(response.data);
  };

  const lastPresetId = data?.[data?.length - 1].id;

  return (
    <SafeAreaView className="justify-center w-full h-full bg-black flex items-center gap-16">
      <FlatList
        data={data}
        renderItem={({ item: preset }) => (
          <Pressable onPress={() => pickPreset(preset)}>
            <View
              className={clsx(
                "px-3 py-10 shadow-sm border-b-[0.5px] border-solid border-gray-500 flex gap-6",
                preset.id === lastPresetId && "!border-black"
              )}
            >
              <View className="w-full flex flex-row justify-between items-center">
                <Text className="text-lg font-extrabold mb-1 text-white">
                  {preset.name}
                </Text>
                <Ionicons
                  name="trash-outline"
                  color="white"
                  size={20}
                  onPress={() => deletePreset(preset.id!)}
                />
              </View>
              <View className="flex flex-row justify-between w-5/6">
                <View className="flex gap-2">
                  <Text className="text-xs text-gray-500 font-medium">
                    Muscle
                  </Text>
                  <Text className="text-sm text-white font-semibold">
                    {preset.muscle}
                  </Text>
                </View>
                <View className="flex gap-2">
                  <Text className="text-xs text-gray-500 font-medium">
                    Mode
                  </Text>
                  <Text className="text-sm text-white font-semibold">
                    {preset.mode}
                  </Text>
                </View>
                <View className="flex gap-2">
                  <Text className="text-xs text-gray-500 font-medium">
                    Optimization
                  </Text>
                  <Text className="text-sm text-white font-semibold">
                    {preset.optimization}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text className="text-center py-5 text-base text-gray-600">
            No presets available
          </Text>
        }
        className="w-full px-3"
        showsVerticalScrollIndicator={false}
      />
      <Pressable
        onPress={() => router.push("/(dashboard)/tracker/setup/create-preset")}
        className="bg-white p-4 rounded-full absolute bottom-8 right-8 w-[60px] h-[60px] flex items-center justify-center"
      >
        <Ionicons size={32} color="black" name="add" />
      </Pressable>
    </SafeAreaView>
  );
}

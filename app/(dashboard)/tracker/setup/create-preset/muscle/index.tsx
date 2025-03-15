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
  Dimensions,
} from "react-native";

import { BaseButton } from "@/core/Buttons";
import { Link, router, useRouter } from "expo-router";
import { useTrackerStore } from "@/store/trackerStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { TrackerMode, TrackerMuscle } from "@/enums/Common";
import { useGlobalStore, usePresetStore } from "@/store";
import { NativeStackScreenProps } from "react-native-screens/lib/typescript/native-stack/types";
import { CreatePresetTabParamList } from "@/types";
import clsx from "clsx";

export type SetupCreatePresetMuscleProps = NativeStackScreenProps<
  CreatePresetTabParamList,
  "Muscle"
>;

export default function SetupCreatePresetMuscle({
  navigation,
}: SetupCreatePresetMuscleProps) {
  const { muscle, setMuscle } = usePresetStore();
  const { width } = Dimensions.get("window");
  const MUSCLE_ITEM_SIZE = (width - 32 - 24) / 3;

  return (
    <ScrollView className="w-full h-screen bg-black">
      <View className="w-full bg-black flex gap-4 flex-row p-4 flex-wrap justify-start">
        {Object.values(TrackerMuscle).map((muscleOption) => (
          <Pressable onPress={() => setMuscle(muscleOption)} key={muscleOption}>
            <View
              className={clsx(
                "bg-gray-800 rounded-lg flex items-center justify-center border-solid border-[1px] border-gray-800",
                muscleOption === muscle && "!bg-gray-500 !border-white"
              )}
              style={{
                width: MUSCLE_ITEM_SIZE,
                height: MUSCLE_ITEM_SIZE,
              }}
            ></View>
            <Text className="text-white text-center leading-8">
              {muscleOption}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

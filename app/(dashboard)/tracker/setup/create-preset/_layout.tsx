import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationProp,
} from "@react-navigation/material-top-tabs";
import SetupStartScreen from "./muscle";
import SetupFinishScreen from "./mode";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Dimensions, Pressable, Text, View } from "react-native";
import { router, withLayoutContext } from "expo-router";
import SetupCreatePresetModeScreen from "./mode";
import SetupCreatePresetMuscleScreen from "./muscle";
import SetupCreatePresetOptimizationScreen from "./optimization";
import SetupCreatePresetSaveScreen from "./save";
import SetupCreatePresetMuscle from "./muscle";
import SetupCreatePresetMode from "./mode";
import SetupCreatePresetOptimization from "./optimization";
import SetupCreatePresetSave from "./save";
import { CreatePresetTabParamList } from "@/types";
import { BaseButton } from "@/core/Buttons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { PresetParam } from "@/enums/Common";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { usePresetStore, useTrackerStore } from "@/store";
import { UserApi } from "@/infrastructure/services/User";
import { BackendPaths } from "@/enums/Paths";
import { mutate } from "swr";

const Tab = createMaterialTopTabNavigator<CreatePresetTabParamList>();

type TabNavigationProp = MaterialTopTabNavigationProp<CreatePresetTabParamList>;

export default function MyTabs() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TabNavigationProp>();
  const { name, getPreset } = usePresetStore();
  const { setConfig } = useTrackerStore();

  const currentRoute = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.state?.routes[route.state.index as number]?.name;
  }) as keyof CreatePresetTabParamList;

  const { text, onPress } = React.useMemo(() => {
    switch (currentRoute) {
      case PresetParam.Muscle:
        return {
          text: "Confirm Muscle",
          onPress: () => navigation.navigate(PresetParam.Mode),
        };
      case PresetParam.Mode:
        return {
          text: "Confirm Mode",
          onPress: () => navigation.navigate(PresetParam.Optimization),
        };
      case PresetParam.Optimization:
        return {
          text: "Confirm Optimization",
          onPress: () => navigation.navigate("Save"),
        };
      case "Save":
        return {
          text: name ? "Save" : "Continue anyway",
          onPress: async () => {
            const newPreset = getPreset();

            if (newPreset && newPreset.name) {
              const response = await UserApi.presets.createPreset(newPreset);
              mutate(BackendPaths.UserPresets, response.data);
            }

            setConfig(newPreset);

            router.navigate("/(dashboard)/tracker/track");
          },
        };
      default:
        return {
          text: "Confirm Muscle",
          onPress: () => navigation.navigate(PresetParam.Muscle),
        };
    }
  }, [currentRoute, name]);

  return (
    <View className="flex-1 bg-black">
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 12, color: "white" },
          tabBarStyle: {
            backgroundColor: "black",
          },
          tabBarIndicatorStyle: { backgroundColor: "white" },
          tabBarItemStyle: { width: Dimensions.get("window").width / 3 },
        }}
        initialLayout={{ width: Dimensions.get("window").width }}
      >
        <Tab.Screen name="Muscle" component={SetupCreatePresetMuscle} />
        <Tab.Screen name="Mode" component={SetupCreatePresetMode} />
        <Tab.Screen
          name="Optimization"
          component={SetupCreatePresetOptimization}
        />
        <Tab.Screen name="Save" component={SetupCreatePresetSave} />
      </Tab.Navigator>
      <View
        className="absolute bottom-8 w-full flex items-center px-4"
        style={{ marginBottom: insets.bottom }}
      >
        <Pressable
          className="flex flex-row justify-between items-center rounded-xl w-full px-4 border-solid border-[1px] border-gray-500 h-[50] bg-gray-800"
          onPress={onPress}
        >
          <Text className="text-white font-semibold text-lg">{text}</Text>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

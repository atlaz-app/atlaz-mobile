import React from 'react';
import { View, Text, Pressable, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';

import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import useSWR from 'swr';
import clsx from 'clsx';
import { useTrackerStore } from '@/store/trackerStore';
import { BackendPaths, ScreenPath } from '@/enums/Paths';
import { Preset } from '@/types';
import { PresetApi } from '@/infrastructure/services/Preset';

export default function Saved() {
  const router = useRouter();
  const { setConfig, setTracePreset } = useTrackerStore();

  const { data, mutate, isLoading } = useSWR(BackendPaths.Presets, async () => {
    const response = await PresetApi.getPresetList();
    return response.data;
  });

  const pickPreset = async (preset: Preset) => {
    setConfig(preset);
    setTracePreset(preset.id);
    router.navigate(ScreenPath.DashboardTrackerMonitor);
  };

  const deletePreset = async (presetId: number) => {
    const response = await PresetApi.deletePreset(presetId);
    mutate(response.data);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="justify-center w-full h-full bg-black flex items-center gap-16">
        <ActivityIndicator size="small" color="white" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="justify-center w-full h-full bg-black flex items-center gap-16">
      <FlatList
        data={data}
        renderItem={({ item: preset }) => (
          <Pressable onPress={() => pickPreset(preset)}>
            <View
              className={clsx(
                'px-3 py-10 shadow-sm border-b-[0.5px] border-solid border-gray-500 flex gap-6',
                preset.id === data?.[data?.length - 1].id && '!border-black',
              )}>
              <View className="w-full flex flex-row justify-between items-center">
                <Text className="text-lg font-extrabold mb-1 text-white">{preset.name}</Text>
                <Ionicons name="trash-outline" color="white" size={20} onPress={() => deletePreset(preset.id!)} />
              </View>
              <View className="flex flex-row justify-between w-5/6">
                <View className="flex gap-2">
                  <Text className="text-xs text-gray-500 font-medium">Muscle</Text>
                  <Text className="text-sm text-white font-semibold">{preset.muscle}</Text>
                </View>
                <View className="flex gap-2">
                  <Text className="text-xs text-gray-500 font-medium">Mode</Text>
                  <Text className="text-sm text-white font-semibold">{preset.mode}</Text>
                </View>
                <View className="flex gap-2">
                  <Text className="text-xs text-gray-500 font-medium">Visual</Text>
                  <Text className="text-sm text-white font-semibold">{preset.visual}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text className="text-center py-5 text-base text-gray-600">No presets available</Text>}
        className="w-full px-3"
        showsVerticalScrollIndicator={false}
      />
      <Pressable
        onPress={() => router.push(ScreenPath.DashboardTrackerPresetNew)}
        className="bg-white p-4 rounded-full absolute bottom-8 right-8 w-[60px] h-[60px] flex items-center justify-center">
        <Ionicons size={32} color="black" name="add" />
      </Pressable>
    </SafeAreaView>
  );
}

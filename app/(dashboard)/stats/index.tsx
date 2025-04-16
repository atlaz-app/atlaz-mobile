import clsx from 'clsx';
import React from 'react';
import { Text, SafeAreaView, Pressable, View, FlatList, ActivityIndicator } from 'react-native';
import useSWR from 'swr';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { TraceApi } from '@/infrastructure/services/Trace';
import { BackendPaths } from '@/enums/Paths';
import { TrackerVisual } from '@/enums/Common';

export default function Stats() {
  const { data, isLoading } = useSWR(BackendPaths.Traces, async () => {
    const response = await TraceApi.getTraceList();
    return response.data;
  });

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
        renderItem={({ item: trace }) => (
          <Pressable onPress={() => router.navigate(`/(dashboard)/stats/${trace.id}`)}>
            <View
              className={clsx(
                'px-3 py-7 border-b-[0.5px] border-solid border-gray-500 flex gap-6 flex-row justify-between',
                trace.id === data?.[data?.length - 1].id && '!border-black',
              )}>
              <View className="flex gap-4">
                <Text className="text-base font-semibold text-white">{trace.preset.name}</Text>
                <View className="flex flex-row gap-3">
                  {trace.visual === TrackerVisual.On && <Ionicons name="videocam" size={20} color="white" />}
                  {!!trace.notes && <Ionicons name="pencil-sharp" size={18} color="white" />}
                </View>
              </View>
              <View className="flex gap-4 items-end">
                <Text className="text-white/50 text-base font-normal">
                  {new Date(trace.createdAt!).toLocaleString()}
                </Text>
                <Text className="text-white/50 text-base font-normal">{trace.duration} seconds</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text className="text-center py-5 text-base text-gray-600 top-24">No traces recorded</Text>}
        className="w-full px-3"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

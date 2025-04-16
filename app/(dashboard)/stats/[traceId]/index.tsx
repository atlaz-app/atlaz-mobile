import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, SafeAreaView, ActivityIndicator, ScrollView, View, Pressable } from 'react-native';
import useSWR from 'swr';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TraceApi } from '@/infrastructure/services/Trace';
import { BackendPaths } from '@/enums/Paths';

type RepData = {
  repNumber: number;
  startTimestamp: number;
  peakTimestamp: number;
  endTimestamp: number;
  contraction: number;
  extension: number;
  duration: number;
  peakValue: number;
  peakMultiplier: number;
  notes: string;
};

const notesHeight = 80;

export default function StatsInfo() {
  const { traceId } = useLocalSearchParams<{ traceId: string }>();
  const [isNotesOpen, setIsNotesOpen] = React.useState(false);

  const { data, isLoading } = useSWR(BackendPaths.TraceById(traceId), async () => {
    const response = await TraceApi.getTraceById(traceId);
    return response.data;
  });

  const repData = (data?.repData && JSON.parse(data?.repData)) as RepData[];

  if (isLoading) {
    return (
      <SafeAreaView className="justify-center w-full h-full bg-black flex items-center gap-16">
        <ActivityIndicator size="small" color="white" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="justify-between w-full h-full bg-black flex items-center">
      <View className="w-full flex items-center flex-1">
        <Pressable onPress={() => router.push(`/(dashboard)/stats/${traceId}/recording`)}>
          <Text className="text-red-400 text-lg my-4">Recording</Text>
        </Pressable>
        <Text className="text-white text-xl mb-4">Main Info</Text>
      </View>
      <View className="w-full h-[360px]">
        <View className="w-full">
          <Pressable
            className="flex-row justify-between items-center px-4 py-3"
            onPress={() => setIsNotesOpen((prev) => !prev)}>
            <Text className="text-white font-medium text-base">Notes</Text>
            {isNotesOpen ? (
              <Ionicons name="chevron-up" size={20} color="white" />
            ) : (
              <Ionicons name="chevron-down" size={20} color="white" />
            )}
          </Pressable>

          {isNotesOpen && (
            <ScrollView className="mt-3 px-4 space-y-2" style={{ height: notesHeight }}>
              <Text className="text-white text-sm">{data?.notes || 'No notes available.'}</Text>
            </ScrollView>
          )}
        </View>
        <View className="w-full mb-2">
          <Text className="text-white font-medium text-base px-4 py-3">Rep details</Text>
          <ScrollView
            stickyHeaderIndices={[0]}
            contentContainerStyle={{ paddingBottom: isNotesOpen ? notesHeight + 80 : 80 }}
            showsVerticalScrollIndicator={false}>
            <View className="flex-row items-center justify-center border-y border-[#222222] h-11 bg-black px-3">
              <Text className="text-white/50 text-center w-10 font-medium">Rep</Text>
              <Text className="text-white/50 text-center flex-1 font-medium">Extension</Text>
              <Text className="text-white/50 text-center flex-1 font-medium">Contraction</Text>
              <Text className="text-white/50 text-center flex-1 font-medium">Peak</Text>
              <Text className="text-white/50 text-center w-12 font-medium">Result</Text>
            </View>
            {repData.map((rep) => (
              <View
                key={rep.repNumber}
                className="flex-row items-center justify-center border-t border-[#222222] h-11 px-3">
                <Text className="text-white text-center w-10 font-medium">{rep.repNumber}</Text>
                <Text className="text-white text-center flex-1 font-medium">{(rep.extension / 1000).toFixed(2)}s</Text>
                <Text className="text-white text-center flex-1 font-medium">
                  {(rep.contraction / 1000).toFixed(2)}s
                </Text>
                <Text className="text-white text-center flex-1 font-medium">{Math.floor(rep.peakMultiplier)}X</Text>
                <Text className="text-white text-center w-12 font-medium">Yes</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

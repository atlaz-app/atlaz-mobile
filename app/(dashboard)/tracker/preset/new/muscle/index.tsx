import React from 'react';
import { ScrollView, View, Text, Pressable, Dimensions } from 'react-native';

import clsx from 'clsx';
import { TrackerMuscle } from '@/enums/Common';
import { usePresetStore } from '@/store';

export default function SetupCreatePresetMuscle() {
  const { muscle, setMuscle } = usePresetStore();
  const { width } = Dimensions.get('window');
  const MUSCLE_ITEM_SIZE = (width - 32 - 24) / 3;

  return (
    <ScrollView className="w-full h-screen bg-black">
      <View className="w-full bg-black flex gap-4 flex-row p-4 flex-wrap justify-start">
        {Object.values(TrackerMuscle).map((muscleOption) => (
          <Pressable onPress={() => setMuscle(muscleOption)} key={muscleOption}>
            <View
              className={clsx(
                'bg-gray-800 rounded-lg flex items-center justify-center border-solid border-[1px] border-gray-800',
                muscleOption === muscle && '!bg-gray-500 !border-white',
              )}
              style={{
                width: MUSCLE_ITEM_SIZE,
                height: MUSCLE_ITEM_SIZE,
              }}></View>
            <Text className="text-white text-center leading-8">{muscleOption}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

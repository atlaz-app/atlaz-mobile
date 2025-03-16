import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';

import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';
import clsx from 'clsx';
import { TrackerMode } from '@/enums/Common';
import { usePresetStore } from '@/store';
import { CreatePresetTabParamList } from '@/types';

export type SetupCreatePresetModeProps = NativeStackScreenProps<CreatePresetTabParamList, 'Mode'>;

export default function SetupCreatePresetMode({ navigation }: SetupCreatePresetModeProps) {
  const { mode, setMode } = usePresetStore();

  console.log(navigation);

  return (
    <ScrollView className="w-full h-screen bg-black">
      <View className="w-full bg-black flex gap-4 p-4">
        {Object.values(TrackerMode).map((modeOption) => (
          <Pressable onPress={() => setMode(modeOption)} key={modeOption}>
            <View
              className={clsx(
                'bg-gray-800 rounded-lg flex items-left justify-center border-solid border-[1px] border-gray-800 h-14 px-5',
                modeOption === mode && '!bg-gray-500 !border-white',
              )}>
              <Text className="text-white leading-8">{modeOption}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

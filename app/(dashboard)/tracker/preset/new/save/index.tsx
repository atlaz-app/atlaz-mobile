import React from 'react';
import { ScrollView, View, Text, TextInput } from 'react-native';

import { usePresetStore } from '@/store';

export default function SetupCreatePresetSave() {
  const { setName } = usePresetStore();
  const textInputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    textInputRef.current?.focus();
  }, []);

  return (
    <ScrollView className="w-full h-screen bg-black p-4">
      <View className="w-full bg-black flex justify-end gap-4 h-[480px]">
        <Text className="text-white text-lg font-semibold pl-4 text-center">Name your preset</Text>
        <TextInput
          ref={textInputRef}
          className="w-full rounded-xl placeholder:text-white/20 text-white text-center text-3xl font-bold my-8"
          cursorColor="white"
          selectionColor="white"
          onChangeText={(text) => setName(text)}
          textAlign="center"
          onFocus={() => console.log('focused')}
          autoFocus={true}
        />
        <Text className="text-white text-lg font-semibold">
          If you don’t name your preset, it will not be saved to your library
        </Text>
      </View>
    </ScrollView>
  );
}

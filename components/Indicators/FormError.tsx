import React from 'react';
import { View, Text } from 'react-native';

type FormErrorProps = {
  message?: string;
};

export const FormError = ({ message }: FormErrorProps) => {
  return (
    <View className="h-8 items-center justify-center">
      <Text className="text-[#d52855]">{message}</Text>
    </View>
  );
};

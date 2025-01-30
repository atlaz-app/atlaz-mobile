import React from "react";
import {
  StyleSheet,
  Image,
  Platform,
  View,
  Text,
  ScrollView,
  Pressable,
  Button,
  TextInput,
  Keyboard,
} from "react-native";

import clsx from "clsx";

import { Controller } from "react-hook-form";

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

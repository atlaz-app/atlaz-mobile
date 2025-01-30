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

import { Controller } from "react-hook-form";

type FormTextInputProps = {
  name: string;
  placeholder: string;
  control: any;
  autoCorrect?: boolean;
  textContentType?: any;
  keyboardType?: any;
};

export const FormTextInput = ({
  control,
  name,
  placeholder,
  autoCorrect,
  textContentType,
  keyboardType,
}: FormTextInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          className="w-5/6 bg-[#DABAAB] focus:bg-[#ecae91] rounded-xl p-4 placeholder:text-slate-500 placeholder:text-sm h-[50]"
          placeholder={placeholder}
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          autoCorrect={autoCorrect}
          textContentType={textContentType}
          keyboardType={keyboardType}
        />
      )}
    />
  );
};

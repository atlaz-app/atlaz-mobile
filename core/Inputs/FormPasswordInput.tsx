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

import Icon from "@expo/vector-icons/Ionicons";

import { Controller } from "react-hook-form";

import clsx from "clsx";

type FormPasswordInputProps = {
  name: string;
  placeholder: string;
  control: any;
  className?: string;
  autoCorrect?: boolean;
  keyboardType?: any;
};

export const FormPasswordInput = ({
  control,
  name,
  className,
  placeholder,
  autoCorrect,
  keyboardType,
}: FormPasswordInputProps) => {
  const [hidePassword, setHidePassword] = React.useState(true);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <View className="w-5/6 h-[50] relative">
          <TextInput
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            className={clsx(
              "rounded-xl p-4 placeholder:text-slate-500 placeholder:text-sm h-full",
              className
            )}
            textContentType="oneTimeCode"
            secureTextEntry={hidePassword}
            placeholder={placeholder}
            autoCorrect={autoCorrect}
            keyboardType={keyboardType}
          />
          <Pressable
            className="absolute right-0 p-4  top-1/2 transform -translate-y-1/2"
            onPress={() => setHidePassword(!hidePassword)}
          >
            <Icon name={hidePassword ? "eye-off" : "eye"} size={16} />
          </Pressable>
        </View>
      )}
    />
  );
};

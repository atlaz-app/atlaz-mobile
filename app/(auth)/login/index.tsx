import { useAuthStore } from "@/store/authStore";
import { router, useFocusEffect } from "expo-router";
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

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthHelper } from "@/infrastructure/services/Auth";
import { LoginForm, loginSchema } from "@/forms";
import { FormPasswordInput, FormTextInput } from "@/core/Inputs";

export default function LoginScreen() {
  const [submissionErrorMessage, setSubmissionErrorMessage] =
    React.useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const login = handleSubmit(async (data: LoginForm) => {
    const loginSuccess = await AuthHelper.login(data);

    if (!loginSuccess) {
      return setSubmissionErrorMessage("Failed to authenticate. Try again!");
    }
    router.navigate("/(dashboard)/home");
  });

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        reset();
      };
    }, [])
  );

  return (
    <ScrollView
      className="bg-[#181F2a] px-4 pt-[84px] w-full h-full"
      onTouchStart={() => {
        setSubmissionErrorMessage("");
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-[#ecae91] text-[36px] text-center mb-[80px]">
        Login
      </Text>
      <View className="w-full items-center gap-2">
        <FormTextInput
          control={control}
          name="email"
          placeholder="Enter email"
          textContentType="emailAddress"
          autoCorrect={true}
        />
        <FormPasswordInput
          control={control}
          name="password"
          placeholder="Enter password"
        />
        <View className="h-8 items-center justify-center">
          <Text className="text-[#d52855]">
            {submissionErrorMessage || Object.values(errors)?.[0]?.message}
          </Text>
        </View>
        <Pressable
          className="flex justify-center items-center bg-[#FE7899] rounded-xl w-5/6 p-4 h-[50]"
          onPress={login}
        >
          <Text className="text-[slate-950] font-semibold">Sign In</Text>
        </Pressable>
        <Button
          onPress={async () => {
            router.navigate("/(auth)/register");
          }}
          title="Sign Up"
          color="#FE7899"
        ></Button>
      </View>
    </ScrollView>
  );
}

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
  ActivityIndicator,
} from "react-native";

import Icon from "@expo/vector-icons/Ionicons";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthHelper } from "@/infrastructure/services/Auth";
import { LoginForm, loginSchema } from "@/forms";
import { FormPasswordInput, FormTextInput } from "@/core/Inputs";
import { BaseButton } from "@/core/Buttons";
import { FormError } from "@/core/Indicators";

export default function LoginScreen() {
  const [isLoading, setLoading] = React.useState(false);
  const [submissionErrorMessage, setSubmissionErrorMessage] =
    React.useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const login = handleSubmit(async (data: LoginForm) => {
    setLoading(true);
    const loginSuccess = await AuthHelper.login(data);

    if (!loginSuccess) {
      setLoading(false);
      return setSubmissionErrorMessage("Failed to authenticate. Try again!");
    }

    setLoading(false);
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
          className="bg-[#DABAAB] focus:bg-[#ecae91]"
        />
        <FormPasswordInput
          control={control}
          name="password"
          placeholder="Enter password"
          className="bg-[#DABAAB] focus:bg-[#ecae91]"
        />
        <FormError
          message={
            submissionErrorMessage || Object.values(errors)?.[0]?.message
          }
        />
        <BaseButton
          className="bg-[#FE7899]"
          isLoading={isLoading}
          onPress={login}
          content="Sign In"
        />
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

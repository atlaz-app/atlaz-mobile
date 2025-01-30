import { router } from "expo-router";
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

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthHelper } from "@/infrastructure/services/Auth";
import { RegisterForm, registerSchema } from "@/forms";
import { FormPasswordInput, FormTextInput } from "@/core/Inputs";

export default function RegisterScreen() {
  const [submissionErrorMessage, setSubmissionErrorMessage] =
    React.useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const register = handleSubmit(async (data: RegisterForm) => {
    const registerSuccess = await AuthHelper.register(data);

    if (!registerSuccess) {
      return setSubmissionErrorMessage("Failed to authenticate. Try again!");
    }

    router.navigate("/(dashboard)/home");
  });

  return (
    <ScrollView
      className="bg-[#181F2A] px-4 pt-[84px] w-full h-full"
      onTouchStart={() => {
        setSubmissionErrorMessage("");
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-[#ecae91] text-[36px] text-center mb-[80px]">
        Register
      </Text>
      <View className="w-full items-center gap-2">
        <FormTextInput
          control={control}
          name="username"
          placeholder="Enter username"
          autoCorrect={false}
        />
        <FormTextInput
          control={control}
          name="email"
          placeholder="Enter email"
          textContentType="emailAddress"
        />
        <FormTextInput
          control={control}
          name="age"
          placeholder="Enter age"
          keyboardType="numeric"
        />
        <FormTextInput
          control={control}
          name="experienceYears"
          placeholder="Years of experience"
          keyboardType="numeric"
          autoCorrect={false}
        />
        <FormPasswordInput
          control={control}
          name="password"
          placeholder="Create password"
        />
        <FormPasswordInput
          control={control}
          name="confirmPassword"
          placeholder="Confirm password"
        />
        <View className="h-8 items-center justify-center">
          <Text className="text-[#d52855]">
            {submissionErrorMessage || Object.values(errors)?.[0]?.message}
          </Text>
        </View>
        <Pressable
          className="flex justify-center items-center bg-[#FE7899] rounded-xl w-5/6 p-4 h-[50]"
          onPress={register}
        >
          <Text className="text-slate-950 font-semibold">Sign Up</Text>
        </Pressable>
        <Button
          onPress={async () => {
            router.navigate("/(auth)/login");
          }}
          title="Sign In"
          color="#FE7899"
        />
      </View>
    </ScrollView>
  );
}

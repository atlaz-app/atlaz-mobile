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
import { BaseButton } from "@/core/Buttons";
import { FormError } from "@/core/Indicators";

export default function RegisterScreen() {
  const [isLoading, setLoading] = React.useState(false);
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
          className="bg-[#DABAAB] focus:bg-[#ecae91]"
        />
        <FormTextInput
          control={control}
          name="email"
          placeholder="Enter email"
          textContentType="emailAddress"
          className=" bg-[#DABAAB] focus:bg-[#ecae91]"
        />
        <FormTextInput
          control={control}
          name="age"
          placeholder="Enter age"
          keyboardType="numeric"
          className=" bg-[#DABAAB] focus:bg-[#ecae91]"
        />
        <FormTextInput
          control={control}
          name="experienceYears"
          placeholder="Years of experience"
          keyboardType="numeric"
          autoCorrect={false}
          className=" bg-[#DABAAB] focus:bg-[#ecae91]"
        />
        <FormPasswordInput
          control={control}
          name="password"
          placeholder="Create password"
          className=" bg-[#DABAAB] focus:bg-[#ecae91]"
        />
        <FormPasswordInput
          control={control}
          name="confirmPassword"
          placeholder="Confirm password"
          className=" bg-[#DABAAB] focus:bg-[#ecae91"
        />
        <FormError
          message={
            submissionErrorMessage || Object.values(errors)?.[0]?.message
          }
        />
        <BaseButton
          className="bg-[#FE7899]"
          isLoading={isLoading}
          onPress={register}
          content="Sign Up"
        />
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

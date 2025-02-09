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
  KeyboardAvoidingView,
} from "react-native";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthHelper } from "@/infrastructure/services/Auth";
import { RegisterForm, registerSchema } from "@/forms";
import { FormPasswordInput, FormTextInput } from "@/core/Inputs";
import { BaseButton } from "@/core/Buttons";
import { FormError } from "@/core/Indicators";
import { RegisterStep } from "@/enums/Common";

type RegisterStepProps = {
  setEmail: (email: string) => void;
  setRegisterStep: (registerStep: RegisterStep) => void;
};

export default function CreateAccount({
  setEmail,
  setRegisterStep,
}: RegisterStepProps) {
  const [isLoading, setLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const createAccount = handleSubmit(async (data: RegisterForm) => {
    setLoading(true);
    const createdAccountEmail = await AuthHelper.register(data);

    if (!createdAccountEmail) {
      setLoading(false);
      setError(
        "password",
        { message: "Failed to create an account. Try again!" },
        { shouldFocus: false }
      );
      return;
    }

    setEmail(createdAccountEmail);
    setRegisterStep(RegisterStep.VerifyEmail);
    setLoading(false);
  });

  return (
    <View
      className="w-full items-center gap-2"
      onTouchStart={() => {
        clearErrors("password");
      }}
    >
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
      <FormError message={Object.values(errors)?.[0]?.message} />
      <BaseButton
        className="bg-[#FE7899]"
        isLoading={isLoading}
        onPress={createAccount}
        content="Sign Up"
      />
    </View>
  );
}

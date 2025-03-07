import { BaseButton } from "@/core/Buttons";
import { FormError } from "@/core/Indicators";
import { FormTextInput } from "@/core/Inputs";
import { RegisterStep } from "@/enums/Common";
import { AuthHelper } from "@/infrastructure/services/Auth";
import { router } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
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

type RegisterStepProps = {
  email: string;
  setRegisterStep: (registerStep: RegisterStep) => void;
};

export default function VerifyEmail({
  email,
  setRegisterStep,
}: RegisterStepProps) {
  const [isLoading, setLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<{ code: string }>();

  const verifyEmail = handleSubmit(async ({ code }: { code: string }) => {
    setLoading(true);
    const verifyEmailSuccess = await AuthHelper.verifyEmail({ email, code });

    if (!verifyEmailSuccess) {
      setLoading(false);
      setError(
        "code",
        { message: "Failed to verify email. Try again!" },
        { shouldFocus: false }
      );
      return;
    }

    setLoading(false);
    router.replace("/(dashboard)/tracker");
  });

  return (
    <View
      className="w-full items-center gap-2"
      onTouchStart={() => {
        clearErrors("code");
      }}
    >
      <FormTextInput
        control={control}
        name="code"
        placeholder="Enter code"
        autoCorrect={false}
        textContentType="oneTimeCode"
      />
      <FormError message={Object.values(errors)?.[0]?.message} />
      <BaseButton
        isLoading={isLoading}
        onPress={verifyEmail}
        content="Verify Email"
      />
    </View>
  );
}

import { router } from "expo-router";
import React from "react";
import {
  Button,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
  View,
  Pressable,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";

import CreateAccount from "@/components/App/Auth/Register/CreateAccount";
import VerifyEmail from "@/components/App/Auth/Register/VerifyEmail";
import { RegisterStep } from "@/enums/Common";

export default function RegisterScreen() {
  const [email, setEmail] = React.useState<string>();
  const [registerStep, setRegisterStep] = React.useState(
    RegisterStep.CreateAccount
  );

  return (
    <ScrollView
      className="bg-[#181F2A] px-4 pt-[84px] w-full h-full"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <Text className="text-[#ecae91] text-[36px] text-center mb-[80px]">
        {registerStep}
      </Text>
      {registerStep === RegisterStep.CreateAccount && (
        <CreateAccount setEmail={setEmail} setRegisterStep={setRegisterStep} />
      )}
      {registerStep === RegisterStep.VerifyEmail && email && (
        <VerifyEmail email={email} setRegisterStep={setRegisterStep} />
      )}
      <Button
        onPress={async () => {
          router.navigate("/(auth)/login");
        }}
        title="Sign In"
        color="#FE7899"
      />
    </ScrollView>
  );
}

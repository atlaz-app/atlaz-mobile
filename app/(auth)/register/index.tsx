import { router } from 'expo-router';
import React from 'react';

import { Button, ScrollView, Text } from 'react-native';

import { RegisterStep } from '@/enums/Common';
import { CreateAccount, VerifyEmail } from '@/components/App/Auth/Register';

export default function RegisterScreen() {
  const [email, setEmail] = React.useState<string>();
  const [registerStep, setRegisterStep] = React.useState(RegisterStep.CreateAccount);

  return (
    <ScrollView
      className="px-4 pt-[84px] w-full h-full"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets>
      <Text className="text-white text-[36px] text-center mb-[80px]">{registerStep}</Text>
      {registerStep === RegisterStep.CreateAccount && (
        <CreateAccount setEmail={setEmail} setRegisterStep={setRegisterStep} />
      )}
      {registerStep === RegisterStep.VerifyEmail && email && (
        <VerifyEmail email={email} setRegisterStep={setRegisterStep} />
      )}
      <Button
        onPress={async () => {
          router.navigate('/(auth)/login');
        }}
        title="Sign In"
        color="white"
      />
    </ScrollView>
  );
}

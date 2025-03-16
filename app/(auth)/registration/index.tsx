import { router } from 'expo-router';
import React from 'react';

import { Button, ScrollView, Text } from 'react-native';

import { CreateAccount, VerifyEmail } from './_components';
import { RegistrationStep } from '@/enums/Common';
import { ScreenPath } from '@/enums/Paths';

export default function Registration() {
  const [email, setEmail] = React.useState<string>();
  const [registrationStep, setRegistrationStep] = React.useState(RegistrationStep.CreateAccount);

  return (
    <ScrollView
      className="px-4 pt-[84px] w-full h-full"
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets>
      <Text className="text-white text-[36px] text-center mb-[80px]">{registrationStep}</Text>
      {registrationStep === RegistrationStep.CreateAccount && (
        <CreateAccount setEmail={setEmail} setRegistrationStep={setRegistrationStep} />
      )}
      {registrationStep === RegistrationStep.VerifyEmail && email && (
        <VerifyEmail email={email} setRegistrationStep={setRegistrationStep} />
      )}
      <Button
        onPress={async () => {
          router.navigate(ScreenPath.AuthLogin);
        }}
        title="Sign In"
        color="white"
      />
    </ScrollView>
  );
}

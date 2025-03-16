import { router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { BaseButton } from '@/components/Buttons';
import { FormError } from '@/components/Indicators';
import { FormTextInput } from '@/components/Inputs';
import { RegistrationStep } from '@/enums/Common';
import { AuthHelper } from '@/infrastructure/services/Auth';

type RegistrationStepProps = {
  email: string;
  setRegistrationStep: (registrationStep: RegistrationStep) => void;
};

export const VerifyEmail = ({ email }: RegistrationStepProps) => {
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
      setError('code', { message: 'Failed to verify email. Try again!' }, { shouldFocus: false });
      return;
    }

    setLoading(false);
    router.replace('/(dashboard)/tracker');
  });

  return (
    <View
      className="w-full items-center gap-2"
      onTouchStart={() => {
        clearErrors('code');
      }}>
      <FormTextInput
        control={control}
        name="code"
        placeholder="Enter code"
        autoCorrect={false}
        textContentType="oneTimeCode"
      />
      <FormError message={Object.values(errors)?.[0]?.message} />
      <BaseButton isLoading={isLoading} onPress={verifyEmail} content="Verify Email" />
    </View>
  );
};

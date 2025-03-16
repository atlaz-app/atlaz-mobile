import React from 'react';
import { View } from 'react-native';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthHelper } from '@/infrastructure/services/Auth';
import { RegistrationForm, registrationSchema } from '@/forms';
import { FormPasswordInput, FormTextInput } from '@/components/Inputs';
import { BaseButton } from '@/components/Buttons';
import { FormError } from '@/components/Indicators';
import { RegistrationStep } from '@/enums/Common';

type RegistrationStepProps = {
  setEmail: (email: string) => void;
  setRegistrationStep: (registrationStep: RegistrationStep) => void;
};

export const CreateAccount = ({ setEmail, setRegistrationStep }: RegistrationStepProps) => {
  const [isLoading, setLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<RegistrationForm>({ resolver: zodResolver(registrationSchema) });

  const createAccount = handleSubmit(async (data: RegistrationForm) => {
    setLoading(true);
    const createdAccountEmail = await AuthHelper.register(data);

    if (!createdAccountEmail) {
      setLoading(false);
      setError('password', { message: 'Failed to create an account. Try again!' }, { shouldFocus: false });
      return;
    }

    setEmail(createdAccountEmail);
    setRegistrationStep(RegistrationStep.VerifyEmail);
    setLoading(false);
  });

  return (
    <View
      className="w-full items-center gap-2 mb-2"
      onTouchStart={() => {
        clearErrors('password');
      }}>
      <FormTextInput control={control} name="username" placeholder="Enter username" autoCorrect={false} />
      <FormTextInput control={control} name="email" placeholder="Enter email" textContentType="emailAddress" />
      <FormTextInput control={control} name="age" placeholder="Enter age" keyboardType="numeric" />
      <FormTextInput
        control={control}
        name="experienceYears"
        placeholder="Years of experience"
        keyboardType="numeric"
        autoCorrect={false}
      />
      <FormPasswordInput control={control} name="password" placeholder="Create password" />
      <FormPasswordInput control={control} name="confirmPassword" placeholder="Confirm password" />
      <FormError message={Object.values(errors)?.[0]?.message} />
      <BaseButton isLoading={isLoading} onPress={createAccount} content="Sign Up" />
    </View>
  );
};

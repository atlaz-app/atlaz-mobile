import { router, useFocusEffect } from 'expo-router';
import React from 'react';
import { Button, ScrollView, Text, View } from 'react-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { BaseButton } from '@/components/Buttons';
import { FormError } from '@/components/Indicators';
import { FormPasswordInput, FormTextInput } from '@/components/Inputs';
import { LoginForm, loginSchema } from '@/forms';
import { AuthHelper } from '@/infrastructure/services/Auth';

export default function Login() {
  const [isLoading, setLoading] = React.useState(false);
  const [submissionErrorMessage, setSubmissionErrorMessage] = React.useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        reset();
      };
    }, [reset]),
  );

  const login = handleSubmit(async (data: LoginForm) => {
    setLoading(true);
    const loginSuccess = await AuthHelper.login(data);

    if (!loginSuccess) {
      setLoading(false);
      return setSubmissionErrorMessage('Failed to authenticate. Try again!');
    }

    setLoading(false);
    router.navigate('/(dashboard)/tracker');
  });

  return (
    <ScrollView
      className="px-4 pt-[84px] w-full h-full"
      onTouchStart={() => {
        setSubmissionErrorMessage('');
      }}
      keyboardShouldPersistTaps="handled">
      <Text className="text-[#ffffff] text-[36px] text-center mb-[80px]">Login</Text>
      <View className="w-full items-center gap-2">
        <FormTextInput
          control={control}
          name="email"
          placeholder="Enter email"
          textContentType="emailAddress"
          autoCorrect={true}
        />
        <FormPasswordInput control={control} name="password" placeholder="Enter password" />
        <FormError message={submissionErrorMessage || Object.values(errors)?.[0]?.message} />
        <BaseButton isLoading={isLoading} onPress={login} content="Sign In" />
        <Button
          onPress={async () => {
            router.navigate('/(auth)/registration');
          }}
          title="Sign Up"
          color="white"></Button>
      </View>
    </ScrollView>
  );
}

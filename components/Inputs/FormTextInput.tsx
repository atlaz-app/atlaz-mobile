import React from 'react';
import { TextInput } from 'react-native';

import clsx from 'clsx';

import { Controller } from 'react-hook-form';

type FormTextInputProps = {
  name: string;
  className?: string;
  placeholder: string;
  control: any;
  autoCorrect?: boolean;
  textContentType?: any;
  keyboardType?: any;
  autoFocus?: boolean;
};

export const FormTextInput = ({
  control,
  name,
  className,
  placeholder,
  autoCorrect,
  textContentType,
  keyboardType,
  autoFocus,
}: FormTextInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          className={clsx(
            'w-5/6 rounded-xl p-4 placeholder:text-white/50 text-white placeholder:text-sm border-[1px] border-solid border-white h-[50]',
            className,
          )}
          placeholder={placeholder}
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          autoCorrect={autoCorrect}
          textContentType={textContentType}
          keyboardType={keyboardType}
          cursorColor={'white'}
          selectionColor={'white'}
          autoFocus={autoFocus}
        />
      )}
    />
  );
};

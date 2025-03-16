import React from 'react';
import { Text, Pressable, ActivityIndicator } from 'react-native';

import clsx from 'clsx';

type BaseButtonProps = {
  color?: string;
  content: any;
  isLoading?: boolean;
  className?: string;
  onPress: () => void;
};

export const BaseButton = ({ isLoading = false, className, onPress, content, color }: BaseButtonProps) => {
  return (
    <Pressable
      className={clsx(
        'flex justify-center items-center rounded-xl w-5/6 p-2 border-dashed border-[1px] border-white h-[50]',
        className,
      )}
      onPress={onPress}>
      {isLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text className={clsx('text-white font-semibold text-lg', color && `text-${color}`)}>{content}</Text>
      )}
    </Pressable>
  );
};

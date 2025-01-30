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
  ActivityIndicator,
} from "react-native";

import clsx from "clsx";

type BaseButtonProps = {
  content: any;
  isLoading?: boolean;
  className?: string;
  onPress: () => void;
};

export const BaseButton = ({
  isLoading = false,
  className,
  onPress,
  content,
}: BaseButtonProps) => {
  return (
    <Pressable
      className={clsx(
        "flex justify-center items-center rounded-xl w-5/6 p-4 h-[50]",
        className
      )}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#181F2a" />
      ) : (
        <Text className="text-[slate-950] font-semibold">{content}</Text>
      )}
    </Pressable>
  );
};

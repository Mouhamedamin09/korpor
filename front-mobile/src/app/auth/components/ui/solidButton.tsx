import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface SolidButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export default function SolidButton({
  title,
  onPress,
  disabled = false,
}: SolidButtonProps): JSX.Element {
  return (
    <TouchableOpacity
      className={`w-full h-12 rounded-xl justify-center items-center mb-3 ${
        disabled ? "bg-[#3f3f46]" : "bg-[#0ea5e9]"
      }`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className="text-white font-semibold text-base">{title}</Text>
    </TouchableOpacity>
  );
}

import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";

interface EmailInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export default function EmailInput({
  placeholder,
  value,
  onChangeText,
}: EmailInputProps): JSX.Element {
  const [isValid, setIsValid] = useState<boolean>(true);

  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(text === "" || emailRegex.test(text));
  };

  return (
    <View className="w-full">
      <TextInput
        className={`border rounded-xl px-4 h-12 text-base w-full py-3 ${
          isValid
            ? "border-[#27272a] bg-[#f2f2f2] mb-3 text-[#09090b]"
            : "border-red-500 bg-[#f2f2f2] text-[#09090b]"
        }`}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={value}
        onChangeText={(text: string) => {
          onChangeText(text);
          validateEmail(text);
        }}
        onBlur={() => validateEmail(value)}
      />
      {!isValid && (
        <Text className="text-red-500 text-sm mb-1">Invalid email address</Text>
      )}
    </View>
  );
}

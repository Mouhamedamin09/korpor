import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";

interface EmailInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
}

export default function EmailInput({
  placeholder,
  value,
  onChangeText,
  editable = true,
}: EmailInputProps): JSX.Element {
  const [isValid, setIsValid] = useState<boolean>(true);

  const validateEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(text === "" || emailRegex.test(text));
  };

  return (
    <View className="">
      <TextInput
        className={`border rounded-xl px-4 h-12 text-base text-primaryBlack w-full py-3 ${
          isValid
            ? "border-border bg-background mb-3"
            : "border-red-500 bg-background"
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
        editable={editable}
      />
      {!isValid && (
        <Text className="text-red-500 text-sm mb-1">Invalid email address</Text>
      )}
    </View>
  );
}

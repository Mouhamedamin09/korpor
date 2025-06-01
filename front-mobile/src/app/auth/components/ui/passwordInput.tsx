import React, { useState } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PasswordInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
}

export default function PasswordInput({
  placeholder,
  value,
  onChangeText,
  editable = true,
}: PasswordInputProps): JSX.Element {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  return (
    <View className="w-full">
      <View className="border border-border rounded-xl px-4 h-12 flex-row items-center justify-between mb-3">
        <TextInput
          className="flex-1 text-base text-primary bg-background"
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          secureTextEntry={!isPasswordVisible}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          disabled={!editable}
        >
          <Ionicons
            name={isPasswordVisible ? "eye-off" : "eye"}
            size={24}
            color="#A0A0A0"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

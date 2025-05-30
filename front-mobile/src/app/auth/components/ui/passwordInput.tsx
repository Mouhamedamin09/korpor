import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
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
      <View className="relative">
        <TextInput
          className="border border-[#3f3f46] rounded-xl px-4 h-12 text-base text-[#fafafa] w-full py-3 bg-[#09090b] mb-3"
          placeholder={placeholder}
          placeholderTextColor="#A0A0A0"
          secureTextEntry={!isPasswordVisible}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
        />
        <TouchableOpacity
          className="absolute right-4 top-3"
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

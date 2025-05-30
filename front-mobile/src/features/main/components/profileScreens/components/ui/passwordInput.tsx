import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Image } from "react-native";
const blueEye = require("@/assets/blueEye.png");
const grayEye = require("@/assets/grayEye.png");
interface PasswordInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export default function PasswordInput({
  placeholder,
  value,
  onChangeText,
}: PasswordInputProps): JSX.Element {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  return (
    <View className="w-full relative">
      <TextInput
        className="border border-gray-300 rounded-lg px-4 h-12 text-base w-full pr-12 py-3 bg-[#F0F4FA] mb-3"
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        secureTextEntry={!isPasswordVisible}
        value={value}
        onChangeText={onChangeText}
      />

      {/* Eye Icon Button */}
      <TouchableOpacity
        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        className="absolute right-1 transform -translate-y-1/2 flex items-center justify-center"
        style={{ height: 48, width: 40 }}
      >
        <Image
          source={isPasswordVisible ? blueEye : grayEye}
          className="w-5 h-5"
        />
      </TouchableOpacity>
    </View>
  );
}

import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Image } from "react-native";
const blueEye = require("@assets/blueEye.png");
const grayEye = require("@assets/grayEye.png");
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
    <View className="border border-[#3f3f46] rounded-xl px-4 h-12 flex-row mb-3 justify-between">
      <TextInput
        className="text-base text-[#fafafa] bg-[#09090b]"
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        secureTextEntry={!isPasswordVisible}
        value={value}
        onChangeText={onChangeText}
      />

      {/* Eye Icon Button */}
      <TouchableOpacity
        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        className="flex h-12 w-10 justify-center"
      >
        <Image
          source={isPasswordVisible ? blueEye : grayEye}
          className="w-5 h-5 self-end"
        />
      </TouchableOpacity>
    </View>
  );
}

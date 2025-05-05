import { Image, TouchableOpacity, View, Text } from "react-native";
import React from "react";
import { useTheme } from "@shared/providers/themeProvider";

const Bell = require("@assets/bell.png");
type Props = {
  onPress?: () => void;
};

export default function NotificationBell({ onPress }: Props) {
  const { theme, setTheme } = useTheme();
  return (
    <TouchableOpacity onPress={() => setTheme("dark")} activeOpacity={0.8}>
      <Image className="w-6 h-6" source={Bell} />
      <View className="bg-red-500 rounded-xl items-center justify-center w-7 h-5 absolute bottom-4 left-2">
        <Text className="text-white text-sm">99+</Text>
      </View>
    </TouchableOpacity>
  );
}

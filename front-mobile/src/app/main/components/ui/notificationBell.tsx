import { TouchableOpacity, View, Text } from "react-native";
import React from "react";
import Feather from "react-native-vector-icons/Feather";
import { useTheme } from "@shared/providers/themeProvider";
import { router } from "expo-router";

type Props = {
  onPress?: () => void;
};

export default function NotificationBell({ onPress }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => router.push("main/screens/notificationsMenu")}
      activeOpacity={0.8}
    >
      <Feather name="bell" size={24} color="#000" />
      <View className="bg-red-500 rounded-xl items-center justify-center w-7 h-5 absolute bottom-4 left-2">
        <Text className="text-white text-sm">3+</Text>
      </View>
    </TouchableOpacity>
  );
}

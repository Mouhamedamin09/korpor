import { TouchableOpacity, View, Text } from "react-native";
import React from "react";
import Feather from "react-native-vector-icons/Feather";
import { router } from "expo-router";

type Props = {
  onPress?: () => void;
};

export default function ShoppingCart({ onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={() => router.push("main/screens/cartScreen")}
      activeOpacity={0.8}
    >
      <Feather name="shopping-cart" size={24} color="#000" />
      <View className="bg-red-500 rounded-xl items-center justify-center w-6 h-5 absolute bottom-4 left-2">
        <Text className="text-white text-sm">4</Text>
      </View>
    </TouchableOpacity>
  );
}

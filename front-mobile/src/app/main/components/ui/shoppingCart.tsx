import { Image, TouchableOpacity, View, Text } from "react-native";
import React from "react";

const Cart = require("@assets/shopping-cart.png");
type Props = {
  onPress?: () => void;
};

export default function ShoppingCart({ onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Image className="w-6 h-6" source={Cart} />
      <View className="bg-red-500 rounded-xl items-center justify-center w-6 h-5 absolute bottom-4 left-2">
        <Text className="text-white text-sm">4</Text>
      </View>
    </TouchableOpacity>
  );
}

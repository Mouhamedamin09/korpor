import { router } from "expo-router";
import { View, Text, Image, TouchableOpacity } from "react-native";
const Back = require("@assets/angle-left.png");
import { NotificationDropdownMenu } from "@main/components/ui/index";

export default function CartHeader() {
  return (
    <View className="flex">
      <View className="h-14 items-center flex-row px-1 pr-2 bg-background">
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          className=""
        >
          <Image source={Back} className="w-8 h-8" />
        </TouchableOpacity>
        <Text className="mx-auto text-foreground pr-8 font-semibold text-xl">
          Cart
        </Text>
      </View>
      <View className="w-full h-0.5 bg-[#f1f1f3]" />
    </View>
  );
}

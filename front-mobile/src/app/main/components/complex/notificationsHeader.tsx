import { router } from "expo-router";
import { View, Text, Image, TouchableOpacity } from "react-native";
const Back = require("@assets/angle-left.png");
import { NotificationDropdownMenu } from "@main/components/ui/index";

interface Props {
  selectedCategory: any;
  onChangeCategory: (c: any) => void;
}

export default function AdjustableHeader({
  selectedCategory,
  onChangeCategory,
}: Props) {
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
        <Text className="mx-auto text-foreground pl-16 font-semibold text-xl">
          Notifications
        </Text>
        <NotificationDropdownMenu
          selected={selectedCategory}
          onChange={onChangeCategory}
        />
      </View>
      <View className="w-full h-0.5 bg-[#f1f1f3]" />
    </View>
  );
}

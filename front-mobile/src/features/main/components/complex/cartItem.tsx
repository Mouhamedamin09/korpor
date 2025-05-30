import { View, Text, Image } from "react-native";
import { Stepper } from "@main/components/complex/index";
const Pic =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR132TBAD0-GhGhN8_2Xr-3obkFd4NzFbk6Hg&s";
const Bed = require("@assets/bed-empty.png");
const Marker = require("@assets/marker.png");
const Profit = require("@assets/chat-arrow-grow.png");

export default function CartItem() {
  return (
    <View className="self-center bg-background w-[90%] p-4 rounded-xl border border-border">
      <View className="flex-row gap-4 items-start">
        <View className="flex-1">
          <Image source={{ uri: Pic }} className="w-36 h-28 rounded-xl" />
          <Stepper />
        </View>

        <View className="flex-1">
          <Text className="text-lg font-semibold text-text">
            Modern villa with pool and garage
          </Text>
          <View className="flex-row">
            <View className="flex-1">
              <View className="flex-row items-center">
                <Image source={Marker} className="w-4 h-4" />
                <Text className="">: Monastir</Text>
              </View>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Image source={Profit} className="w-3 h-3" />
                <Text className="">: 7.9% yearly</Text>
              </View>
            </View>
          </View>
          <View className="flex-row">
            <View className="flex-1">
              <View className="flex-row items-center">
                <Image source={Bed} className="w-4 h-4" />
                <Text className="">: 4</Text>
              </View>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="font-bold text-textGray text-[16px]">%</Text>
                <Text className="">: 70% done</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

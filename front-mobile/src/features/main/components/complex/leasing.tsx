import { View, Text, Image, Pressable } from "react-native";
import { BorderContainer, TimeLine } from "@main/components/ui/index";
const Rent = require("@assets/rent.png");
const Status = require("@assets/clipboard-black.png");
const Tags = require("@assets/tags-black.png");
type LeasingProps = {
  type: string;
  status: string;
  fee: number;
};
export default function Leasing({ type, status, fee }: LeasingProps) {
  return (
    <View>
      <Text className="text-2xl font-medium mb-2">Leasing Strategy:</Text>
      <View className="mx-2">
        <View className="flex-row items-center">
          <Image source={Rent} className="w-4 h-4" />
          <View className="w-2" />
          <Text className="text-lg font-medium">{type}</Text>
        </View>
        <Text className="text-sm text-gray-600">
          This property's leasing strategy is to generate consistent monthly
          income through annual contracts with long term tenants.
        </Text>
        <Pressable
          onPress={() => {
            console.log("pressable pressed");
          }}
        >
          <Text className="text-sm text-gray-600 underline mb-2">
            A manager will be assigned for this property.
          </Text>
        </Pressable>
        <View className="flex-row items-center">
          <Image source={Status} className="w-4 h-4" />
          <View className="w-2" />
          <Text className="text-lg font-medium">Property status: </Text>
          <Text className="text-lg font-medium text-[#1b9c7c]">{status}</Text>
        </View>
        <Text className="text-sm text-gray-600 mb-2">
          This property is rented and will soon start paying rent.
        </Text>
        <View className="flex-row items-center">
          <Image source={Tags} className="w-4 h-4" />
          <View className="w-2" />
          <Text className="text-lg font-medium">Yearly rental fee: </Text>
          <Text className="text-lg font-medium text-[#1b9c7c]">{fee} TND</Text>
        </View>
        <View className="flex-row items-center mb-4">
          <Text className="text-sm text-gray-600">First payment on: </Text>
          <Text className="text-text text-sm underline">June 1, 2025</Text>
        </View>
      </View>
    </View>
  );
}

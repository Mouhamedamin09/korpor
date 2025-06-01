import { View, Text, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const GREEN = "#34D37D";

export default function ExitStrategiesCard() {
  return (
    <View className="rounded-2xl overflow-hidden border border-gray-200 bg-[#F9FAFB] shadow-sm">
      {/* Top Ribbon */}
      <View
        style={{ backgroundColor: GREEN }}
        className="flex-row items-center justify-between px-4 py-2"
      >
        <View className="flex-row items-center">
          <Feather name="log-out" size={20} color="#000" />
          <Text className="ml-2 text-base font-medium text-gray-900">
            Exit Strategies
          </Text>
        </View>
        <Text className="text-base font-medium text-gray-900">5 mins</Text>
      </View>

      {/* Bottom Content */}
      <View className="flex-row items-center p-4">
        {/* Speaker Avatar */}
        <View className="w-20 h-20 rounded-full bg-[#10B981] items-center justify-center overflow-hidden mr-4">
          <Image
            source={require("@assets/Ahmed.png")}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Title + Subtitle */}
        <View className="flex-1 pr-2">
          <Text className="text-lg font-semibold text-gray-900 mb-1">
            How to exit smartly
          </Text>
          <Text className="text-sm text-gray-600">
            Ahmed shares best practices
          </Text>
        </View>

        {/* Play Button */}
        <TouchableOpacity className="w-10 h-10 rounded-full bg-black items-center justify-center">
          <Feather name="play" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

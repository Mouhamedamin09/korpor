import { View, Text, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

const GREEN = "#10B981";

export default function QuickstartCard() {
  return (
    <View className="mx-4 mt-4 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
      {/* Top Ribbon */}
      <View className="bg-[#000000] px-4 py-2 rounded-t-2xl">
        <View className="flex-row items-center">
          <Feather name="zap" size={16} color={GREEN} />
          <Text className="ml-2 text-sm font-medium text-white">
            Get started
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="flex-row items-center px-4 py-4">
        {/* Illustration */}
        <View className="w-16 h-16 bg-gray-100 rounded-xl items-center justify-center mr-4">
          <Image
            source={require("@assets/quickstart-icon.png")} // Replace with your actual image file
            style={{ width: 40, height: 40 }}
            resizeMode="contain"
          />
        </View>

        {/* Text */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 mb-1">
            Quickstart your investment journey
          </Text>
          <Text className="text-sm text-gray-600">
            Our quickstart tool helps get you started with your first investment
          </Text>
        </View>
      </View>

      {/* CTA */}
      <TouchableOpacity className="flex-row items-center justify-between border-t border-gray-200 px-4 py-3">
        <Text className="text-base font-semibold text-green-700">
          Quickstart your investment journey
        </Text>
        <Feather name="arrow-right" size={20} color={GREEN} />
      </TouchableOpacity>
    </View>
  );
}

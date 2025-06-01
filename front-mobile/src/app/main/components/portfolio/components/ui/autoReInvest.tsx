import { router } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Feather from "react-native-vector-icons/Feather";

interface Props {
  isSetup?: boolean;
}

const AutoReinvest: React.FC<Props> = ({ isSetup = false }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        router.push("main/components/wallet/walletscreens/AutoReInvestScreen");
      }}
      activeOpacity={0.85}
      className="mx-4 mt-4 rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex-row items-start"
    >
      {/* Circling arrow icon on the left */}
      <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
        <Feather name="rotate-ccw" size={24} color="#10B981" />
      </View>

      {/* Right content (title + tag + arrow + description) */}
      <View className="flex-1">
        {/* Title row */}
        <View className="flex-row items-center mb-1">
          <Text className="text-lg font-semibold text-gray-900">
            Auto Reinvest
          </Text>

          <View className="flex-1" />

          <View
            className={`px-2 py-0.5 rounded-full h-5 justify-center mr-2 ${
              isSetup ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                isSetup ? "text-green-700" : "text-gray-500"
              }`}
            >
              {isSetup ? "Setup" : "Not Setup"}
            </Text>
          </View>

          <Feather name="chevron-right" size={20} color="#000" />
        </View>

        {/* Description row */}
        <Text className="text-xs text-gray-500 font-semibold">
          Automatically reinvest your rental income into new opportunities to
          maximize growth.
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default AutoReinvest;

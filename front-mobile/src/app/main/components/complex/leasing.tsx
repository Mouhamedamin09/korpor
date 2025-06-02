import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import Feather from "react-native-vector-icons/Feather";

type LeasingProps = {
  type: string;
  status: string;
  fee: number;
};

export default function Leasing({ type, status, fee }: LeasingProps) {
  // ───────── detail rows (icon + text) ─────────
  const infoRows = [
    { icon: "clipboard", text: `Property status: ${status}` },
    { icon: "tag", text: `Yearly rental fee: ${fee.toLocaleString()} TND` },
    { icon: "calendar", text: "First payment expected on June 1, 2025" },
  ];

  return (
    <View>
      {/* ───── header ───── */}
      <View className="flex-row items-center mb-4">
        <View className="w-16 h-16 rounded-2xl bg-green-100 items-center justify-center mr-4">
          <Feather name={"key"} size={30} color="#000" />
        </View>

        <View className="flex-1">
          <Text className="font-semibold text-lg text-gray-900">
            Leasing Strategy: {type}
          </Text>
          <Text className="text-sm text-gray-600">
            This property aims to generate consistent monthly income through
            long-term tenant contracts.
          </Text>
        </View>
      </View>

      {/* ───── details ───── */}
      {infoRows.map(({ icon, text }) => (
        <View key={text} className="flex-row items-center mb-3">
          <Feather name={icon as any} size={20} color="#10B981" />
          <Text className="ml-3 text-base text-gray-900">{text}</Text>
        </View>
      ))}

      {/* ───── divider ───── */}
      <View className="h-px bg-gray-200 mb-4" />
    </View>
  );
}

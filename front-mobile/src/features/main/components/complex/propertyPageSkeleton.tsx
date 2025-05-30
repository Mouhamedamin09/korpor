import React from "react";
import { View, Text } from "react-native";
import { MotiView } from "moti";

import { ViewStyle } from "react-native";

interface PulseBlockProps {
  height?: ViewStyle["height"];
  width?: ViewStyle["width"];
  className?: string;
}

const PulseBlock = ({
  height = 20,
  width = "100%",
  className = "",
}: PulseBlockProps) => (
  <MotiView
    from={{ opacity: 0.3 }}
    animate={{ opacity: 1 }}
    transition={{ loop: true, type: "timing", duration: 700 }}
    className={`bg-zinc-300 rounded-md ${className}`}
    style={{ height, width }}
  />
);

export default function PropertyPageSkeleton() {
  return (
    <View className="bg-white flex-1">
      <View className="h-12 bg-white border-b border-gray-200" />
      <View className="h-64 bg-gray-200" />

      <View className="px-4 mt-4 space-y-4">
        <PulseBlock height={32} width="70%" />
        <View className="flex-row space-x-3">
          <PulseBlock height={16} width={40} className="flex-1" />
          <PulseBlock height={16} width={40} className="flex-1" />
          <PulseBlock height={16} width={40} className="flex-1" />
          <PulseBlock height={16} width={40} className="flex-1" />
        </View>

        <PulseBlock height={16} width="80%" />
        <PulseBlock height={16} width="60%" />
        <PulseBlock height={16} width="70%" />

        <View className="bg-zinc-100 p-4 rounded-xl space-y-3 mt-6">
          <PulseBlock height={16} width="100%" />
          <PulseBlock height={16} width="90%" />
          <PulseBlock height={16} width="80%" />
          <PulseBlock height={16} width="100%" />

          <PulseBlock height={8} width="100%" className="mt-3" />
        </View>

        <PulseBlock height={44} width="100%" />
        <PulseBlock height={44} width="100%" />
        <PulseBlock height={44} width="100%" />
        <PulseBlock height={44} width="100%" />

        <View className="h-40" />
      </View>
    </View>
  );
}

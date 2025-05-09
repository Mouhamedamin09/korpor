// components/complex/NotificationSkeleton.tsx
import React from "react";
import { View } from "react-native";
import { MotiView } from "moti";

export default function NotificationSkeleton() {
  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{ loop: true, duration: 700, type: "timing" }}
      className="bg-card w-[90%] self-center border border-border flex-row py-3 px-4 items-center mb-3 rounded-xl"
    >
      <View className="flex-1">
        <View className="flex-row items-center mb-2">
          <View className="w-5 h-5 bg-gray-300 rounded-full" />
          <View className="w-2" />
          <View className="w-[80%] h-4 bg-gray-300 rounded-full" />
        </View>
        <View className="flex-row items-center">
          <View className="w-8" />
          <View className="h-3 w-[70%] bg-gray-300 rounded-full" />
        </View>
      </View>
    </MotiView>
  );
}

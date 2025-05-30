// components/complex/PropertyCardSkeleton.tsx
import React from "react";
import { View } from "react-native";
import { MotiView } from "moti";

export default function PropertyCardSkeleton() {
  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{
        type: "timing",
        duration: 800,
        loop: true,
      }}
      className="bg-card rounded-xl p-4 my-2 mx-4"
    >
      <View className="h-40 bg-gray-300 rounded-md mb-3" />
      <View className="h-4 bg-gray-300 rounded-full w-3/4 mb-2" />
      <View className="h-4 bg-gray-300 rounded-full w-1/2" />
    </MotiView>
  );
}

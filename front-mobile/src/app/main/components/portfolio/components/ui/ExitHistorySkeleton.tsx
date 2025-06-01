// components/ui/ExitHistorySkeleton.tsx
import React from "react";
import { View } from "react-native";
import { MotiView } from "moti";

const ExitHistorySkeleton: React.FC = () => {
  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{ loop: true, duration: 700, type: "timing" }}
      className="bg-white border border-gray-200 rounded-xl px-4 py-4 mb-4 w-[90%] self-center"
    >
      <View className="flex-row items-start">
        {/* Icon circle */}
        <View className="w-10 h-10 rounded-full bg-gray-300 mr-4" />

        {/* Content block */}
        <View className="flex-1">
          <View className="h-4 bg-gray-300 rounded-full w-[60%] mb-2" />
          <View className="h-3 bg-gray-300 rounded-full w-[50%] mb-2" />
          <View className="h-3 bg-gray-300 rounded-full w-[70%] mb-2" />
          <View className="h-3 bg-gray-300 rounded-full w-[40%]" />
        </View>
      </View>
    </MotiView>
  );
};

export default ExitHistorySkeleton;

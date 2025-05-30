import React from "react";
import { View } from "react-native";
import { MotiView } from "moti";

const WindowPerformanceSkeleton: React.FC = () => {
  return (
    <MotiView
      from={{ opacity: 0.3 }}
      animate={{ opacity: 1 }}
      transition={{ loop: true, duration: 700, type: "timing" }}
      className="bg-white w-[48%] rounded-xl py-5 px-3 mb-4 items-center shadow-md"
    >
      <View className="w-8 h-8 rounded-full bg-gray-200 mb-4" />
      <View className="w-16 h-4 bg-gray-300 rounded-full mb-2" />
      <View className="w-[80%] h-3 bg-gray-200 rounded-full" />
    </MotiView>
  );
};

export default WindowPerformanceSkeleton;

import React from "react";
import { View, Text } from "react-native";

interface Props {
  title: string;
}
const SectionTitle: React.FC<Props> = ({ title }) => (
  <View className="flex-row items-center mb-3">
    <View className="h-[1px] flex-1 bg-gray-200" />
    <Text className="mx-3 text-xs tracking-wider font-medium text-gray-400">
      {title.toUpperCase()}
    </Text>
    <View className="h-[1px] flex-1 bg-gray-200" />
  </View>
);

export default SectionTitle;

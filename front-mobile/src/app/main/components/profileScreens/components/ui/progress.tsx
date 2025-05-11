import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";

export const Progress = ({
  value = 0,
  className = "",
  ...props
}: {
  value: number;
  className?: string;
  [key: string]: any;
}) => {
  return (
    <View
      className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}
      {...props}
    >
      <View
        className="h-full bg-emerald-500 rounded-full"
        style={{ width: `${value}%` }}
      />
    </View>
  );
};

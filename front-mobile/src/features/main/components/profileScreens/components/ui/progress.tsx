// @main/components/profileScreens/components/ui/Progress.tsx
import React from "react";
import { View } from "react-native";

export const Progress = ({
  value = 0,
  className = "",
  ...props
}: {
  value: number; // expected 0.0–1.0
  className?: string;
  [key: string]: any;
}) => {
  // clamp between 0 and 1, convert to percent
  const pct = Math.min(Math.max(value, 0), 1) * 100;

  return (
    <View
      className={`w-full bg-gray-200 rounded-full overflow-hidden ${className}`}
      {...props}
    >
      <View className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
    </View>
  );
};

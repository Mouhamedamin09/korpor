import { ReactNode } from "react";
import { View } from "react-native";
import React from "react";

type GrayContainerProps = {
  children: ReactNode;
};

export default function GrayContainer({ children }: GrayContainerProps) {
  return (
    <View className="border border-zinc-200 mb-4 bg-[#f8f4f4] p-2 px-4 rounded-xl">
      {children}
    </View>
  );
}

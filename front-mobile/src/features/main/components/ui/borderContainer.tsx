import { ReactNode } from "react";
import { View } from "react-native";
import React from "react";

type BorderContainerProps = {
  children: ReactNode;
};

export default function BorderContainer({ children }: BorderContainerProps) {
  return (
    <View className="border border-zinc-200 self-center rounded-xl py-2 w-[100%] px-4 mb-4">
      {children}
    </View>
  );
}

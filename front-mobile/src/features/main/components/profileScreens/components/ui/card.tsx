// @main/components/profileScreens/components/ui/Card.tsx
import React from "react";
import { View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  extraStyle?: string;
}

const Card: React.FC<CardProps> = ({ children, extraStyle = "" }) => {
  return (
    <View
      className={`rounded-xl border border-gray-200 bg-white p-4 mb-4 ${extraStyle}`}
    >
      {children}
    </View>
  );
};

export default Card;

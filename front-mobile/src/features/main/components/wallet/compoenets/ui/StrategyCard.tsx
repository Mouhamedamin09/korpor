import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Color from "color";

export interface StrategyCardProps {
  title: string;
  description: string;
  icon?: any;
  colors: [string, string];
  onPress?: () => void;
}

export default function StrategyCard({
  title,
  description,
  icon,
  colors,
  onPress,
}: StrategyCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="mx-4 mb-5 rounded-xl overflow-hidden shadow-3xl"
    >
      <LinearGradient
        colors={[colors[0], colors[0] + "80", colors[1], "#FFFFFF"]}
        locations={[0, 0.2, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex-row items-center py-7 px-5"
      >
        <View className="flex-1 pr-4">
          <Text className="text-xl font-bold text-[#0A0E23] mb-1">{title}</Text>
          <Text className="text-lg text-[#4B5563] leading-snug">
            {description}
          </Text>
        </View>

        {/* icon inside a circle background */}
        <View
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{ backgroundColor: Color(colors[0]).darken(0.19).hex() }}
        >
          {icon ? (
            <Image source={icon} className="w-14 h-14" resizeMode="contain" />
          ) : (
            <View className="w-6 h-6 rounded-full bg-white/50" />
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

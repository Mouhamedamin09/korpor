/* -----------------------------------------------------------
   🔹  ThemeCard — 40 % white → fade → 60 % accent
       • Displays a single "group badge" image (top-right)
   ----------------------------------------------------------- */

import React from "react";
import { Pressable, View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";
export type ThemeKey = "diversified" | "growth" | "income";

interface Props {
  id: ThemeKey;
  title: string;
  desc: string;
  selected: boolean;
  onSelect: (id: ThemeKey) => void;
  accentColor: string;

  /** single combined badge image exported from Figma */
  groupSrc: any; // e.g. require("@assets/group1.png")

  icon?: React.ReactNode;
  iconName?: string; // fallback Feather icon name
  amount?: number; // amount to pass to ThemeDetails
}

const ThemeCard: React.FC<Props> = ({
  id,
  title,
  desc,
  selected,
  onSelect,
  accentColor,
  groupSrc,
  icon,
  iconName,
  amount,
}) => {
  const fadeTint = accentColor + "33"; // 20 % alpha tint

  return (
    <TouchableOpacity
      onPress={() => onSelect(id)}
      className={`rounded-2xl mb-4 overflow-hidden ${
        selected ? "border-2 border-[#10B981]" : "border border-gray-200"
      }`}
    >
      {/* ───── gradient background ───── */}
      <LinearGradient
        colors={["#FFFFFF", "#FFFFFF", fadeTint, accentColor]}
        locations={[0, 0.4, 0.6, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        className="p-5"
      >
        {/* grouped badge image */}
        <Image
          source={groupSrc}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 64,
            height: 34,
          }}
          resizeMode="contain"
        />

        {/* main icon */}
        <View className="mb-4">
          {icon ?? (
            <Feather name={iconName || "star"} size={40} color={accentColor} />
          )}
        </View>

        {/* text */}
        <Text className="text-xl font-extrabold text-[#0A0E23] mb-2">
          {title}
        </Text>
        <Text className="text-base text-gray-500 mb-6">{desc}</Text>

        {/* CTA */}
        <Text className="text-base font-semibold text-[#10B981]">
          Learn more
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default ThemeCard;

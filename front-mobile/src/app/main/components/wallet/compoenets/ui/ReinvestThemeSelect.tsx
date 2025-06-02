// ReinvestThemeSelect.tsx

import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import ThemeCard, { ThemeKey } from "./ThemeCard";

const GREEN = "#10B981";

// Reuse the same group images (or replace with your own assets)
const group1 = require("@assets/Group1.png");
const group2 = require("@assets/Group2.png");
const group3 = require("@assets/group3.png");

interface ReinvestThemeSelectProps {
  selectedTheme: ThemeKey | null;
  onSelectTheme: (theme: ThemeKey) => void;
  percentage: number;
}

const themes: Record<
  ThemeKey,
  {
    title: string;
    desc: string;
    accent: string;
    groupSrc: any;
    iconName?: string;
  }
> = {
  growth: {
    title: "Growth Focus",
    desc: "Focus on properties with strong potential for capital appreciation. Ideal for building long-term wealth through property value increases.",
    accent: "#059669",
    groupSrc: group2,
    iconName: "trending-up",
  },
  income: {
    title: "Income Focus",
    desc: "Prioritize properties that generate consistent rental income. Perfect for steady cash flow from your reinvested capital.",
    accent: "#DC2626",
    groupSrc: group3,
    iconName: "dollar-sign",
  },
  diversified: {
    title: "Diversified",
    desc: "Spread investments across different property types and locations for optimal risk management and balanced returns.",
    accent: "#7C3AED",
    groupSrc: group1,
    iconName: "pie-chart",
  },
};

const ReinvestThemeSelect: React.FC<ReinvestThemeSelectProps> = ({
  selectedTheme,
  onSelectTheme,
  percentage,
}) => {
  const router = useRouter();

  const handleThemeCardPress = (themeKey: ThemeKey) => {
    // Navigate to ThemeDetails with the theme and indicate this is for AutoReinvest
    console.log("ReinvestThemeSelect: Navigating with parameters:", {
      theme: themeKey,
      percentage,
      isReinvest: "true",
    });

    // Use router.push with proper pathname and params
    router.push({
      pathname: "/main/components/wallet/walletscreens/ThemeDetails",
      params: {
        theme: themeKey,
        percentage: percentage.toString(),
        isReinvest: "true",
      },
    });
  };

  return (
    <ScrollView
      className="flex-1 px-6"
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text className="text-2xl font-bold text-[#0A0E23] mt-8 mb-2">
        Investment Theme
      </Text>
      <Text className="text-sm text-gray-500 mb-4 leading-5">
        Choose how to reinvest your {percentage}% rental income
      </Text>

      {/* Learn-about link */}
      <TouchableOpacity
        className="flex-row items-center mb-6"
        onPress={() => {
          router.push("/main/components/wallet/walletscreens/InvestmentThemes");
        }}
        activeOpacity={0.7}
      >
        <Feather name="book-open" size={18} color={GREEN} />
        <Text className="ml-2 text-lg font-semibold text-[#10B981]">
          Learn about themes
        </Text>
      </TouchableOpacity>

      {/* Theme cards */}
      {(Object.keys(themes) as ThemeKey[]).map((key) => {
        const { title, desc, accent, groupSrc, iconName } = themes[key];
        return (
          <ThemeCard
            key={key}
            id={key}
            title={title}
            desc={desc}
            accentColor={accent}
            groupSrc={groupSrc}
            selected={selectedTheme === key}
            onSelect={() => handleThemeCardPress(key)}
            iconName={iconName}
          />
        );
      })}
    </ScrollView>
  );
};

export default ReinvestThemeSelect;

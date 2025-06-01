/* -----------------------------------------------------------
   🔹  ThemeSetupSelect — component for selecting theme in StartAutoInvest
   ----------------------------------------------------------- */

import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import ThemeCard, { ThemeKey } from "./ThemeCard";

const GREEN = "#10B981";

// paths to your Figma‐exported badge groups
const group1 = require("@assets/Group1.png");
const group2 = require("@assets/Group2.png");
const group3 = require("@assets/group3.png");

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
  diversified: {
    title: "Diversified theme",
    desc: "Properties in prestigious, stable neighborhoods ensure high demand and long-term value.",
    accent: "#FFE38D",
    groupSrc: group1,
    iconName: "pie-chart",
  },
  growth: {
    title: "Growth Focused theme",
    desc: "Focused on properties that offer high growth potential, designed to maximise capital appreciation.",
    accent: "#10B981",
    groupSrc: group2,
    iconName: "trending-up",
  },
  income: {
    title: "Income Focused theme",
    desc: "Focused on properties that offer attractive rental yields, designed to maximise income potential.",
    accent: "#74a1d6",
    groupSrc: group3,
    iconName: "dollar-sign",
  },
};

interface Props {
  selectedTheme: ThemeKey | null;
  onSelectTheme: (theme: ThemeKey) => void;
  amount?: number;
}

const ThemeSetupSelect: React.FC<Props> = ({
  selectedTheme,
  onSelectTheme,
  amount,
}) => {
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 px-6"
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* heading */}
      <Text className="text-2xl font-bold mb-2 text-[#0A0E23] mt-8">
        Select a theme to get started
      </Text>
      <Text className="text-sm text-gray-500 mb-4 leading-5">
        Your monthly deposit will be automatically invested throughout the month
        according to your selected AutoInvest theme
      </Text>

      {/* learn-about link */}
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

      {/* theme cards: select theme */}
      {(Object.keys(themes) as ThemeKey[]).map((key) => {
        const { title, desc, accent, groupSrc } = themes[key];
        return (
          <ThemeCard
            key={key}
            id={key}
            title={title}
            desc={desc}
            accentColor={accent}
            groupSrc={groupSrc}
            selected={selectedTheme === key}
            onSelect={onSelectTheme}
            iconName={themes[key].iconName}
            amount={amount}
          />
        );
      })}
    </ScrollView>
  );
};

export default ThemeSetupSelect;

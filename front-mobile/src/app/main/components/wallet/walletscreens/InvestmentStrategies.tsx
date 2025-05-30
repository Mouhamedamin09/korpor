/* --------------------------------------------------------------------------
   🔹  InvestmentStrategies.tsx — full-screen list (fixed safe‐area)
   -------------------------------------------------------------------------- */

import React from "react";
import { ScrollView, View, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import StrategyCard from "../compoenets/ui/StrategyCard";
/* ------------------------------------------------------------------ */
/*  data                                                              */
/* ------------------------------------------------------------------ */

type StrategyKey =
  | "Capital Growth"
  | "High Yield"
  | "Balanced"
  | "Fix n’ Flip"
  | "Fix n’ Lease";

interface Strategy {
  title: StrategyKey;
  desc: string;
  colors: [string, string]; // gradient start → end
  icon?: any; // require(...) | undefined = placeholder
}

const STRATEGIES: Strategy[] = [
  {
    title: "Capital Growth",
    desc: "High appreciation potential due to market trends, upcoming infrastructure, or prime locations.",
    colors: ["#D2F5DD", "#E8FCE9"],
    icon: require("@assets/plantP.png"),
  },
  {
    title: "High Yield",
    desc: "Properties that offer higher than average rental yields, designed to maximise rental income.",
    colors: ["#DCEAFE", "#EDF4FF"],
    icon: require("@assets/coinsP.png"),
  },
  {
    title: "Balanced",
    desc: "A safe strategy blending consistent income, strong appreciation and capital protection.",
    colors: ["#FFF5D8", "#FFFAEB"],
    icon: require("@assets/libraP.png"),
  },
  {
    title: "Fix n’ Flip",
    desc: "Purchase a market-undervalued property, renovate it, and quickly resell at a higher value.",
    colors: ["#F2E8FF", "#FBF4FF"],
    icon: require("@assets/Hammer0.png"),
  },
  {
    title: "Fix n’ Lease",
    desc: "Purchase a market-undervalued property, renovate it, and lease it out for rent at a higher value.",
    colors: ["#DDE2E7", "#EDEFF2"],
    icon: require("@assets/key0.png"),
  },
];

/* ------------------------------------------------------------------ */

export default function InvestmentStrategies() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TopBar title="Investment Strategies" onBackPress={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* intro copy */}
        <View className="px-4 pt-4">
          <Text className="text-2xl font-bold text-[#0A0E23] mb-2">
            What are Investment Strategies?
          </Text>
          <Text className="text-base leading-6 text-[#4B5563] mb-8">
            Each property on Korpor is categorized under a specific investment
            strategy—Balanced, Capital Growth, High Yield, Fix n’ Flip, or Fix
            n’ Lease. These strategies define the core characteristics and
            objectives of each property investment.
          </Text>
        </View>

        {/* sub-heading */}
        <Text className="mt-6 mb-3 px-4 font-semibold text-[#0A0E23] text-xl">
          Investment strategies
        </Text>

        {/* cards */}
        {STRATEGIES.map((s) => (
          <StrategyCard
            key={s.title}
            title={s.title}
            description={s.desc}
            icon={s.icon}
            colors={s.colors}
            onPress={() => {
              /* handle tap if needed */
            }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

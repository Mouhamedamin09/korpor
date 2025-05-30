/* --------------------------------------------------------------------------
   🔹  ThemeDetails — Tailwind version with full-width top gradient
   -------------------------------------------------------------------------- */

import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";
import { useRouter, useLocalSearchParams } from "expo-router";

/* ------------------------------------------------------------------ */
/*  theme data                                                        */
/* ------------------------------------------------------------------ */

type ThemeKey = "diversified" | "growth" | "income";

const THEMES: Record<
  ThemeKey,
  {
    accent: string;
    title: string;
    description: string;
    propsPerMonth: number;
    strategies: { label: string; count: number; icon: string }[];
  }
> = {
  diversified: {
    accent: "#fcedbd",
    title: "Diversified theme",
    description:
      "The Diversified Theme combines Balanced, Capital Growth, and High Yield properties, aiming to reduce risk while pursuing consistent returns.",
    propsPerMonth: 4,
    strategies: [
      { label: "Balanced", count: 2, icon: "activity" },
      { label: "Capital Growth", count: 1, icon: "trending-up" },
      { label: "High Yield", count: 1, icon: "dollar-sign" },
    ],
  },
  growth: {
    accent: "#4bdbab",
    title: "Growth Focused theme",
    description:
      "The Growth Focused Theme includes Capital Growth and Balanced properties, aiming for higher returns with moderate risk.",
    propsPerMonth: 3,
    strategies: [
      { label: "Capital Growth", count: 2, icon: "trending-up" },
      { label: "Balanced", count: 1, icon: "activity" },
    ],
  },
  income: {
    accent: "#93b4db",
    title: "Income Focused theme",
    description:
      "The Income Focused theme combines High Yield and Balanced properties, targeting higher returns while maintaining diversification.",
    propsPerMonth: 3,
    strategies: [
      { label: "High Yield", count: 2, icon: "dollar-sign" },
      { label: "Balanced", count: 1, icon: "activity" },
    ],
  },
};

const strategyIcons: Record<"Balanced" | "Capital Growth" | "High Yield", any> =
  {
    Balanced: require("@assets/libraP.png"),
    "Capital Growth": require("@assets/plantP.png"),
    "High Yield": require("@assets/coinsP.png"),
  };

/* themed icon that goes inside the circle */
const themeIcons: Record<ThemeKey, any> = {
  diversified: require("@assets/star0.png"),
  growth: require("@assets/plant0.png"),
  income: require("@assets/flash0.png"),
};

/* helper to build the 0 → 60 → 100 % fade */
const buildGradient = (hex: string) => [
  hex, // 0 %
  hex + "66", // 60 %
  "#FFFFFF", // 100 %
];

export default function ThemeDetails() {
  const router = useRouter();
  const { theme = "diversified" } = useLocalSearchParams<{
    theme?: ThemeKey;
  }>();
  const data = THEMES[theme as ThemeKey] ?? THEMES.diversified;

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <View className="flex-1 bg-gray-50">
        {/* TOP GRADIENT — reaches down past the first card */}
        <LinearGradient
          colors={buildGradient(data.accent)}
          className="absolute top-0 left-0 right-0 h-64"
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* CONTENT */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* back button & icon circle */}
          <View className="pt-14 px-4">
            <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
              <Feather name="chevron-left" size={30} color="#0A0E23" />
            </TouchableOpacity>

            {/* circular icon */}
            <View
              className="w-14 h-14 rounded-full bg-white border-2 mt-6 items-center justify-center"
              style={{ borderColor: data.accent }}
            >
              <Image
                source={themeIcons[theme as ThemeKey]}
                className="w-14 h-14 mt-1"
                resizeMode="contain"
              />
            </View>
          </View>

          {/* copy */}
          <View className="px-4 mt-4">
            <Text className="text-[24px] font-bold text-[#0A0E23] mb-6">
              {data.title}
            </Text>
            <Text className="text-base leading-6 text-[#4B5563] mb-8">
              {data.description}
            </Text>
          </View>

          {/* properties-per-month card */}
          <View className="mx-4 mt-6 bg-white/50 border border-[#E5E7EB] rounded-2xl p-4 flex-row justify-between items-center">
            <View className="flex-row items-center space-x-2">
              <Image
                source={require("@assets/home.png")}
                className="w-10 h-10"
                resizeMode="contain"
              />
              <Text className="font-semibold text-[#0A0E23]">
                {data.propsPerMonth} Properties
              </Text>
            </View>
            <Text className="text-[14px] text-[#6B7280]">Per Month</Text>
          </View>

          {/* strategies card */}
          <View className="mx-4 mt-4 bg-white/50 border border-[#E5E7EB] rounded-2xl">
            <Text className="px-4 pt-3 pb-2 font-semibold text-[#0A0E23]">
              Strategies
            </Text>

            {/* list */}
            {data.strategies.map((s, i) => (
              <View key={s.label}>
                <View className="flex-row items-center px-4 py-3">
                  <Image
                    source={
                      strategyIcons[
                        s.label as "Balanced" | "Capital Growth" | "High Yield"
                      ]
                    }
                    className="w-10 h-10 mr-3"
                    resizeMode="contain"
                  />
                  <Text className="flex-1 text-[#0A0E23]">{s.label}</Text>
                  <Text className="text-[12px] text-[#6B7280]">
                    {s.count} propert{s.count > 1 ? "ies" : "y"}
                  </Text>
                </View>
                {i < data.strategies.length - 1 && (
                  <View className="h-px bg-[#E5E7EB] mx-4" />
                )}
              </View>
            ))}

            {/* learn link */}
            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/main/components/wallet/walletscreens/InvestmentThemes"
                )
              }
              className="flex-row items-center px-4 py-3"
              activeOpacity={0.7}
            >
              <Feather name="book-open" size={16} color="#10B981" />
              <Text className="ml-2 font-semibold text-[#10B981]">
                Learn about strategies
              </Text>
              <Feather
                name="chevron-right"
                size={16}
                color="#10B981"
                className="ml-auto"
              />
            </TouchableOpacity>
          </View>

          {/* CTAs */}
          <TouchableOpacity
            className="mx-4 mt-6 h-14 rounded-xl bg-[#000000] items-center justify-center"
            onPress={() => {
              /* confirm */
            }}
          >
            <Text className="text-white font-bold">Select this theme</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="mx-4 mt-3 h-14 rounded-xl border border-[#E5E7EB] items-center justify-center"
            onPress={() => router.back()}
          >
            <Text className="font-semibold text-[#0A0E23]">
              Pick a different theme
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

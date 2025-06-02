/* --------------------------------------------------------------------------
   🔹  ThemeDetails — Tailwind version with full-width gradient
       • "Select this theme" sends to StartAutoInvest?step=3&theme=…
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
    strategies: { label: string; count: number }[];
  }
> = {
  diversified: {
    accent: "#fcedbd",
    title: "Diversified theme",
    description:
      "The Diversified Theme combines Balanced, Capital Growth, and High Yield properties, aiming to reduce risk while pursuing consistent returns.",
    propsPerMonth: 4,
    strategies: [
      { label: "Balanced", count: 2 },
      { label: "Capital Growth", count: 1 },
      { label: "High Yield", count: 1 },
    ],
  },
  growth: {
    accent: "#4bdbab",
    title: "Growth Focused theme",
    description:
      "The Growth Focused Theme includes Capital Growth and Balanced properties, aiming for higher returns with moderate risk.",
    propsPerMonth: 3,
    strategies: [
      { label: "Capital Growth", count: 2 },
      { label: "Balanced", count: 1 },
    ],
  },
  income: {
    accent: "#93b4db",
    title: "Income Focused theme",
    description:
      "The Income Focused theme combines High Yield and Balanced properties, targeting higher returns while maintaining diversification.",
    propsPerMonth: 3,
    strategies: [
      { label: "High Yield", count: 2 },
      { label: "Balanced", count: 1 },
    ],
  },
};

/* themed circle-icon */
const themeIcons: Record<ThemeKey, any> = {
  diversified: require("@assets/star0.png"),
  growth: require("@assets/plant0.png"),
  income: require("@assets/flash0.png"),
};

/* icons for each strategy row */
const strategyIcons: Record<"Balanced" | "Capital Growth" | "High Yield", any> =
  {
    Balanced: require("@assets/libraP.png"),
    "Capital Growth": require("@assets/plantP.png"),
    "High Yield": require("@assets/coinsP.png"),
  };

/* helper to build gradient */
const buildGradient = (hex: string): [string, string, string] => [
  hex,
  hex + "66",
  "#FFFFFF",
];

export default function ThemeDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    theme?: ThemeKey;
    amount?: string;
    percentage?: string;
    isReinvest?: string;
  }>();

  // Extract and debug all parameters
  const { theme = "diversified", amount, percentage, isReinvest } = params;

  const data = THEMES[theme as ThemeKey];

  // Check if this is for AutoReinvest flow
  const isAutoReinvest = isReinvest === "true";

  // Debug logging with more detail
  console.log("ThemeDetails: Raw params object:", params);
  console.log("ThemeDetails: Extracted values:", {
    theme,
    amount,
    percentage,
    isReinvest,
  });
  console.log("ThemeDetails: isAutoReinvest boolean:", isAutoReinvest);
  console.log("ThemeDetails: typeof isReinvest:", typeof isReinvest);
  console.log("ThemeDetails: isReinvest value:", isReinvest);

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <View className="flex-1 bg-gray-50">
        {/* top gradient */}
        <LinearGradient
          colors={buildGradient(data.accent)}
          className="absolute top-0 left-0 right-0 h-64"
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* back + circular icon */}
          <View className="pt-14 px-4">
            <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
              <Feather name="chevron-left" size={30} color="#0A0E23" />
            </TouchableOpacity>
            <View
              className="w-14 h-14 rounded-full bg-white border-2 mt-6 items-center justify-center"
              style={{ borderColor: data.accent }}
            >
              <Image
                source={themeIcons[theme as ThemeKey]}
                className="w-10 h-10"
                resizeMode="contain"
              />
            </View>
          </View>

          {/* title & description */}
          <View className="px-4 mt-4">
            <Text className="text-[24px] font-bold text-[#0A0E23] mb-6">
              {data.title}
            </Text>
            <Text className="text-base leading-6 text-[#4B5563] mb-8">
              {data.description}
            </Text>
          </View>

          {/* properties card */}
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

            {data.strategies.map((s, i) => {
              const iconSrc =
                strategyIcons[
                  s.label as "Balanced" | "Capital Growth" | "High Yield"
                ];

              return (
                <View key={s.label}>
                  <View className="flex-row items-center px-4 py-3">
                    {iconSrc ? (
                      <Image
                        source={iconSrc}
                        className="w-10 h-10 mr-3"
                        resizeMode="contain"
                      />
                    ) : (
                      <View className="w-10 h-10 rounded-full bg-white/50 mr-3" />
                    )}

                    <Text className="flex-1 text-[#0A0E23]">{s.label}</Text>
                    <Text className="text-[12px] text-[#6B7280]">
                      {s.count} propert{s.count > 1 ? "ies" : "y"}
                    </Text>
                  </View>

                  {i < data.strategies.length - 1 && (
                    <View className="h-px bg-[#E5E7EB] mx-4" />
                  )}
                </View>
              );
            })}

            {/* learn link */}
            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/main/components/wallet/walletscreens/InvestmentStrategies"
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

          {/* CTA buttons */}
          <TouchableOpacity
            className="mx-4 mt-6 h-14 rounded-xl bg-[#000] items-center justify-center"
            onPress={() => {
              console.log("Button clicked. isAutoReinvest:", isAutoReinvest);
              console.log("Parameters:", {
                theme,
                amount,
                percentage,
                isReinvest,
              });

              if (isAutoReinvest) {
                console.log("Navigating to StartAutoReinvest");
                // Navigate back to StartAutoReinvest with the selected theme
                const params = new URLSearchParams({
                  step: "3",
                  theme: theme as string,
                });
                if (percentage) {
                  params.append("percentage", percentage);
                }
                const url = `/main/components/wallet/walletscreens/StartAutoReinvest?${params.toString()}`;
                console.log("AutoReinvest URL:", url);
                router.replace(url);
              } else {
                console.log("Navigating to StartAutoInvest");
                // Original AutoInvest flow
                const params = new URLSearchParams({
                  step: "3",
                  theme: theme as string,
                });
                if (amount) {
                  params.append("amount", amount);
                }
                const url = `/main/components/wallet/walletscreens/StartAutoInvest?${params.toString()}`;
                console.log("AutoInvest URL:", url);
                router.replace(url);
              }
            }}
          >
            <Text className="text-white font-bold">
              {isAutoReinvest ? "Select for AutoReinvest" : "Select this theme"}
            </Text>
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

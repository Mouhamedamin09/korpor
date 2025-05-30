import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";
import SetupCard from "../compoenets/ui/SetupCard";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import HowItWorks from "../compoenets/ui/HowItWorks";

const { width } = Dimensions.get("window");

// ───────────────────────────────────────── helpers ──────
const BenefitRow = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <View className="flex-row mb-6">
    <View className="w-10 h-10 rounded-lg bg-[#F9FAFB] items-center justify-center mr-3">
      {icon}
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-900">{title}</Text>
      <Text className="text-sm text-gray-500">{subtitle}</Text>
    </View>
  </View>
);



// ───────────────────────────────────────── component ─────
const AutoInvestScreen: React.FC = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      {/* ░░ top-bar ░░ */}
      <TopBar title="Auto Invest" onBackPress={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, paddingTop: 16 }}
      >
        <SetupCard />
        {/* ░░ benefits ░░ */}
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Benefits
        </Text>
        <BenefitRow
          icon={<Feather name="check-circle" size={20} color="#10B981" />}
          title="Set it and forget it"
          subtitle="Stay accountable to your financial goals while your money grows on autopilot each month"
        />
        <BenefitRow
          icon={<Feather name="search" size={20} color="#10B981" />}
          title="No more guesswork"
          subtitle="Choose a theme curated by our experts and AutoInvest will automatically allocate your funds as new properties become available"
        />
        <BenefitRow
          icon={<Feather name="shuffle" size={20} color="#10B981" />}
          title="Diversify on autopilot"
          subtitle="AutoInvest minimizes your risk by spreading your investments across several properties each month according to the theme of your choice"
        />
        <HowItWorks />
      </ScrollView>
    </View>
  );
};

export default AutoInvestScreen;

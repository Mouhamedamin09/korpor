import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import Feather from "react-native-vector-icons/Feather";
import SetupCard from "../compoenets/ui/SetupCard";
import SetupCardLocked from "../compoenets/ui/SetupCardLocked";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import HowItWorks from "../compoenets/ui/HowItWorks";

const { width } = Dimensions.get("window");

// Mocked invested value — replace this with real data later
const totalInvested = 1350; // 👈 just change this to test

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
const AutoReinvestScreen: React.FC = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <TopBar title="Auto Reinvest" onBackPress={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 32,
          paddingTop: 16,
        }}
      >
        {totalInvested >= 2000 ? (
          <SetupCard type="reinvest" />
        ) : (
          <SetupCardLocked totalInvested={totalInvested} />
        )}

        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Benefits
        </Text>

        <BenefitRow
          icon={<Feather name="repeat" size={20} color="#10B981" />}
          title="Grow your wealth automatically"
          subtitle="Reinvest your rental income seamlessly into new opportunities to keep your money working for you."
        />
        <BenefitRow
          icon={<Feather name="clock" size={20} color="#10B981" />}
          title="Save time and effort"
          subtitle="No need to manually reinvest every month — Auto Reinvest takes care of it automatically."
        />
        <BenefitRow
          icon={<Feather name="pie-chart" size={20} color="#10B981" />}
          title="Build consistent growth"
          subtitle="Ensure your rental returns are always reinvested toward your long-term financial strategy."
        />

        <HowItWorks type="reinvest" />
      </ScrollView>
    </View>
  );
};

export default AutoReinvestScreen;

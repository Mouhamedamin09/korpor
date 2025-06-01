import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
// @ts-ignore
import Feather from "react-native-vector-icons/Feather";
import SetupCard from "../compoenets/ui/SetupCard";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import BottomSheet from "@main/components/profileScreens/components/ui/SheetIndicator";
import HowItWorks from "../compoenets/ui/HowItWorks";
import {
  fetchAutoInvestPlan,
  fetchAutoInvestStats,
  AutoInvestPlan,
  AutoInvestStats,
} from "../../../services/autoInvest";
import { fetchWalletBalance, WalletBalance } from "../../../services/wallet";
import { fetchAccountData, AccountData } from "../../../services/account";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<AutoInvestPlan | null>(null);
  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [stats, setStats] = useState<AutoInvestStats | null>(null);

  // Bottom sheet states
  const [errorSheetVisible, setErrorSheetVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Debug: Check authentication status
      const token = await AsyncStorage.getItem("accessToken");
      const userData = await AsyncStorage.getItem("userData");
      console.log("🔍 AutoInvest Screen - Auth Debug:");
      console.log("- Token exists:", !!token);
      console.log(
        "- Token preview:",
        token ? `${token.substring(0, 20)}...` : "none"
      );
      console.log("- User data exists:", !!userData);

      // Load all data in parallel
      const [planData, wallet, account] = await Promise.all([
        fetchAutoInvestPlan().catch((error) => {
          console.error("Error fetching AutoInvest plan:", error);
          return null;
        }),
        fetchWalletBalance().catch((error) => {
          console.error("Error fetching wallet balance:", error);
          return null;
        }),
        fetchAccountData().catch((error) => {
          console.error("Error fetching account data:", error);
          return null;
        }),
      ]);

      setPlan(planData);
      setWalletData(wallet);
      setAccountData(account);

      // Load stats if plan exists
      if (planData) {
        try {
          const statsData = await fetchAutoInvestStats();
          setStats(statsData);
        } catch (error) {
          console.error("Error fetching AutoInvest stats:", error);
        }
      }
    } catch (error) {
      console.error("Error loading AutoInvest data:", error);

      // Show user-friendly error message
      setErrorMessage(
        "Unable to load your AutoInvest data. Please check your connection and try again."
      );
      setErrorSheetVisible(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRetry = () => {
    setErrorSheetVisible(false);
    loadData();
  };

  const handleContinue = () => {
    setErrorSheetVisible(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <TopBar title="Auto Invest" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-gray-500 mt-4">
            Loading your investment data...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* ░░ top-bar ░░ */}
      <TopBar title="Auto Invest" onBackPress={() => router.back()} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 32,
          paddingTop: 16,
        }}
      >
        <SetupCard type="invest" />
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
        <HowItWorks type="invest" />
      </ScrollView>

      {/* Connection Error Bottom Sheet */}
      <BottomSheet
        visible={errorSheetVisible}
        onClose={() => setErrorSheetVisible(false)}
      >
        <View className="items-center pb-6">
          <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-4">
            <Feather name="wifi-off" size={28} color="#EF4444" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Connection Error
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-6">
            {errorMessage}
          </Text>
          <TouchableOpacity
            onPress={handleRetry}
            className="bg-blue-600 rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleContinue}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-gray-600">Continue</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default AutoInvestScreen;

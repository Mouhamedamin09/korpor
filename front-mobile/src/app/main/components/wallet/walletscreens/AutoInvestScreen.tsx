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
import * as SecureStore from "expo-secure-store";
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
import { authStore } from "@auth/services/authStore";

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

const StepCard = ({
  idx,
  title,
  subtitle,
}: {
  idx: number;
  title: string;
  subtitle: string;
}) => (
  <Card extraStyle="flex-1 p-5 bg-white rounded-2xl shadow-sm">
    <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mb-4">
      <Text className="text-green-600 font-semibold">
        {String(idx).padStart(2, "0")}
      </Text>
    </View>
    <Text className="text-base font-semibold text-gray-900 mb-1">{title}</Text>
    <Text className="text-sm text-gray-500">{subtitle}</Text>
  </Card>
);

// ───────────────────────────────────────── AutoInvest Dashboard ──────
const AutoInvestDashboard = ({
  plan,
  walletData,
  accountData,
}: {
  plan: AutoInvestPlan;
  walletData: WalletBalance | null;
  accountData: AccountData | null;
}) => {
  const capitalize = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  const formatNumber = (num: number) =>
    num != null ? num.toLocaleString("en-US") : "—";
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "paused":
        return "text-yellow-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 border-green-200";
      case "paused":
        return "bg-yellow-50 border-yellow-200";
      case "cancelled":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const nextDepositDate = plan.nextDepositDate
    ? new Date(plan.nextDepositDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  const isAccountVerified = accountData?.isVerified || false;

  return (
    <View>
      {/* AutoInvest Plan Card */}
      <Card extraStyle="p-6 mb-6 shadow-lg">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-lg font-bold text-gray-900">
              AutoInvest Plan
            </Text>
            <Text className="text-sm text-gray-500">
              {capitalize(plan.theme)} Theme
            </Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full border border-opacity-50 ${getStatusBg(
              plan.status
            )}`}
            accessible
            accessibilityLabel={`Status: ${plan.status}`}
          >
            <Text
              className={`text-xs font-semibold uppercase ${getStatusColor(
                plan.status
              )}`}
            >
              {plan.status}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900">
            {plan.currency} {formatNumber(plan.monthlyAmount)}
          </Text>
          <Text className="text-sm text-gray-500">Monthly investment</Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row justify-between mb-6 space-x-4">
          <View className="flex-1 p-4 bg-white rounded-lg shadow-sm">
            <Text className="text-sm text-gray-500">Total Deposited</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {plan.currency} {formatNumber(plan.totalDeposited)}
            </Text>
          </View>
          <View className="flex-1 p-4 bg-white rounded-lg shadow-sm">
            <Text className="text-sm text-gray-500">Total Invested</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {plan.currency} {formatNumber(plan.totalInvested)}
            </Text>
          </View>
        </View>

        {/* Next Deposit */}
        <View className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
          <View className="flex-row items-center">
            <Feather name="calendar" size={18} color="#6B7280" />
            <Text className="text-sm text-gray-500 ml-2">Next Deposit</Text>
          </View>
          <Text className="text-base font-semibold text-gray-900 mt-1">
            {nextDepositDate || "—"}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row space-x-3">
          <TouchableOpacity
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={
              plan.status === "active"
                ? "Pause AutoInvest"
                : "Resume AutoInvest"
            }
            className={`flex-1 py-3 px-4 rounded-lg ${
              plan.status === "active"
                ? "bg-yellow-50 border border-yellow-200"
                : "bg-green-50 border border-green-200"
            }`}
            onPress={() =>
              router.push(
                "/main/components/wallet/walletscreens/ManageAutoInvest"
              )
            }
          >
            <Text
              className={`text-center font-semibold ${
                plan.status === "active" ? "text-gray-700" : "text-green-700"
              }`}
            >
              {plan.status === "active" ? "Pause" : "Resume"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Manage AutoInvest"
            className="flex-1 py-3 ml-2 px-4 rounded-lg bg-gray-50 border border-gray-200"
            onPress={() =>
              router.push(
                "/main/components/wallet/walletscreens/ManageAutoInvest"
              )
            }
          >
            <Text className="text-center font-semibold text-gray-700">
              Manage
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Wallet Overview Card */}
      {walletData && (
        <Card extraStyle="p-6 mb-6 shadow-lg">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
              <Feather name="shopping-cart" size={20} color="#166534" />
            </View>
            <Text className="text-lg font-semibold text-gray-900">
              Wallet Overview
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-1">
              <Text className="text-sm text-gray-500">Total Balance</Text>
              <Text className="text-xl font-bold text-gray-900">
                {walletData.currency} {formatNumber(walletData.totalBalance)}
              </Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-sm text-gray-500">Available Cash</Text>
              <Text className="text-lg font-semibold text-gray-900">
                {walletData.currency} {formatNumber(walletData.cashBalance)}
              </Text>
            </View>
          </View>

          {walletData.rewardsBalance > 0 && (
            <View className="p-3 bg-green-50 rounded-lg">
              <Text className="text-sm text-green-800">
                Rewards Balance: {walletData.currency}{" "}
                {formatNumber(walletData.rewardsBalance)}
              </Text>
            </View>
          )}

          {/* Payment Methods Notice */}
          <View className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
            <View className="flex-row items-center">
              <Feather name="credit-card" size={16} color="#10B981" />
              <Text className="ml-2 text-sm font-medium text-green-800">
                Multiple payment options available
              </Text>
            </View>
            <Text className="text-xs text-green-700 mt-1">
              Pay with wallet, card, or PayMe account
            </Text>
          </View>
        </Card>
      )}
    </View>
  );
};

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
      const token = authStore.getState().accessToken;
      const userData = await SecureStore.getItemAsync("userData");
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Show Dashboard if user has plan, otherwise show SetupCard */}
        {plan ? (
          <AutoInvestDashboard
            plan={plan}
            walletData={walletData}
            accountData={accountData}
          />
        ) : (
          <SetupCard type="invest" />
        )}

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
            <Feather name="wifi-off" size={28} color="#000000" />
          </View>
          <Text className="text-xl font-semibold text-black mb-4">
            Connection Error
          </Text>
          <Text className="text-sm text-black text-center mb-6">
            {errorMessage}
          </Text>
          <TouchableOpacity
            onPress={handleRetry}
            className="bg-black rounded-lg p-4 w-full items-center mb-3"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleContinue}
            className="p-4 w-full items-center"
            activeOpacity={0.8}
          >
            <Text className="text-black font-semibold">Continue</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default AutoInvestScreen;

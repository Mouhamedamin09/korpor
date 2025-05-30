// screens/main/components/wallet/ConfirmAutoInvest.tsx
/* --------------------------------------------------------------------------
   🔹  ConfirmAutoInvest — step-4 review & launch screen
   -------------------------------------------------------------------------- */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "react-native-vector-icons/Feather";
import Card from "@main/components/profileScreens/components/ui/card";
import { ThemeKey } from "./ThemeCard";
import { fetchAccountData, AccountData } from "@main/services/account";
import { fetchWalletBalance, WalletBalance } from "@main/services/wallet";

export type DepositData = {
  startDate: string;
  frequency: string;
  paymentMethod: string;
  verification: "Verified" | "Pending";
};

interface Props {
  amount: number;
  theme: ThemeKey;
  deposit: DepositData;
  onBack: () => void;
  onLaunch: () => void;
}

const ConfirmAutoInvest: React.FC<Props> = ({
  amount = 0,
  theme,
  deposit,
  onBack,
  onLaunch,
}) => {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const [account, wallet] = await Promise.all([
          fetchAccountData(),
          fetchWalletBalance(),
        ]);
        setAccountData(account);
        setWalletData(wallet);
      } catch (error) {
        Alert.alert(
          "Notice",
          "Unable to load account details. You can still proceed with creating your AutoInvest plan.",
          [{ text: "Continue" }]
        );
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const formatThemeName = (themeKey: ThemeKey): string => {
    switch (themeKey) {
      case "growth":
        return "Growth";
      case "income":
        return "Income";
      case "diversified":
        return "Diversified";
      default:
        return "Balanced";
    }
  };

  const currency = walletData?.currency || "TND";
  const isAccountVerified = accountData?.isVerified ?? false;
  const actualVerificationStatus = isAccountVerified ? "Verified" : "Pending";
  const availableBalance = walletData?.cashBalance ?? 0;
  const hasSufficientFunds = availableBalance >= amount;

  if (loading) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{
          flex: 1,
          backgroundColor: "#F9FAFB",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ marginTop: 16, color: "#6B7280" }}>
          Loading account details...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 24,
        }}
      >
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-gray-900">
            Confirm & Launch
          </Text>
          <Text className="text-sm text-gray-500">
            Review your AutoInvest plan details before launching
          </Text>
        </View>

        {/* Summary Card */}
        <Card extraStyle="p-6 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-3">
              <Feather name="check" size={20} color="#10B981" />
            </View>
            <Text className="text-lg font-semibold text-gray-900">
              Your AutoInvest Plan
            </Text>
          </View>

          {/* Amount */}
          <View className="bg-gray-50 rounded-lg p-4 mb-4">
            <Text className="text-sm text-gray-500 mb-1">
              Monthly Investment
            </Text>
            <Text className="text-2xl font-bold text-gray-900">
              {currency} {amount.toLocaleString()}
            </Text>
          </View>

          {[
            ["Investment Theme", formatThemeName(theme)],
            ["Start Date", deposit.startDate],
            ["Frequency", deposit.frequency],
            [
              "Payment Method",
              deposit.paymentMethod || "Default Payment Method",
            ],
          ].map(([label, value], idx) => (
            <View
              key={label}
              className={`flex-row justify-between py-2 ${
                idx < 3 ? "border-b border-gray-100" : ""
              }`}
            >
              <Text className="text-gray-500">{label}</Text>
              <Text className="font-semibold capitalize text-gray-900">
                {value}
              </Text>
            </View>
          ))}

          <View className="flex-row justify-between py-2">
            <Text className="text-gray-500">Account Status</Text>
            <View className="flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-2 ${
                  actualVerificationStatus === "Verified"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              />
              <Text
                className={`font-semibold ${
                  actualVerificationStatus === "Verified"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {actualVerificationStatus}
              </Text>
            </View>
          </View>
        </Card>

        <View className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <View className="flex-row items-start">
            <Feather
              name="info"
              size={16}
              color="#6B7280"
              style={{ marginTop: 2, marginRight: 8 }}
            />
            <Text className="text-sm text-gray-600 flex-1">
              By launching AutoInvest, you agree to our terms. Your first
              deposit will be processed on the selected date, and future
              deposits will occur monthly. Ensure you have sufficient funds in
              your account.
            </Text>
          </View>
        </View>

        {!isAccountVerified && (
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <View className="flex-row items-start">
              <Feather
                name="alert-triangle"
                size={16}
                color="#F59E0B"
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <Text className="text-sm text-yellow-800 flex-1">
                Your account verification is pending. AutoInvest will activate
                once your account is fully verified.
              </Text>
            </View>
          </View>
        )}

        {!hasSufficientFunds && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <View className="flex-row items-start">
              <Feather
                name="alert-circle"
                size={16}
                color="#EF4444"
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <Text className="text-sm text-red-800 flex-1">
                Insufficient funds for the first monthly investment. Please
                deposit at least {currency} {amount.toLocaleString()} to your
                wallet.
              </Text>
            </View>
          </View>
        )}

        <View className="mb-2">
          <TouchableOpacity
            onPress={onLaunch}
            className="bg-black rounded-lg p-4 items-center mb-3 flex-row justify-center"
            disabled={!isAccountVerified || !hasSufficientFunds}
            style={{
              opacity: isAccountVerified && hasSufficientFunds ? 1 : 0.6,
            }}
          >
            <Text className="text-white font-semibold text-base mr-2">
              {!isAccountVerified
                ? "Pending Verification"
                : !hasSufficientFunds
                ? "Insufficient Funds"
                : "Launch AutoInvest"}
            </Text>
            <Feather name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onBack}
            className="items-center py-3 border border-gray-200 rounded-lg"
            activeOpacity={0.7}
          >
            <Text className="text-gray-700 font-medium">Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConfirmAutoInvest;

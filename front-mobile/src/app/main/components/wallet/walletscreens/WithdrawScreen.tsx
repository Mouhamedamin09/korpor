// screens/main/components/wallet/WithdrawScreen.tsx

import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import AvailableToWithdraw from "../compoenets/ui/AvailableToWithdraw";
import AmountInputCard from "../compoenets/ui/AmountInputCard";
import {
  fetchWalletBalance,
  withdrawFunds,
  getCurrencySymbol,
  convertCurrency,
  type WalletBalance,
  type WithdrawRequest,
} from "../../../services/wallet";

const MIN_WITHDRAW = 10.0;

type Method = {
  id: string;
  label: string;
  processingTime: string;
  fee: number;
};

const METHODS: Method[] = [
  {
    id: "bank",
    label: "Bank Transfer ••••1234",
    processingTime: "1–3 business days",
    fee: 0.0,
  },
  {
    id: "wallet",
    label: "Mobile Wallet ••••5678",
    processingTime: "Instant",
    fee: 2.5,
  },
  {
    id: "card",
    label: "Debit Card ••••9012",
    processingTime: "Instant",
    fee: 1.0,
  },
];

const WithdrawScreen: React.FC = () => {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>(METHODS[0].id);
  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string>("");

  // Load wallet data on component mount
  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchWalletBalance();
      setWalletData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load wallet data"
      );
      console.error("Error loading wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedMethodData =
    METHODS.find((m) => m.id === selectedMethod) || METHODS[0];
  const numAmount = parseFloat(amount) || 0;
  const availableBalance = walletData?.cashBalance || 0;
  const totalWithFee = numAmount + selectedMethodData.fee;

  const valid =
    numAmount >= MIN_WITHDRAW &&
    totalWithFee <= availableBalance &&
    selectedMethod &&
    !withdrawing;

  const handleWithdraw = async () => {
    if (!valid || !walletData) return;

    try {
      setWithdrawing(true);

      // Prepare withdrawal data
      const withdrawData: WithdrawRequest = {
        amount: numAmount,
        description: `Withdrawal via ${selectedMethodData.label}`,
        reference: `WTH_${Date.now()}_${selectedMethod.toUpperCase()}`,
      };

      // Show confirmation dialog and process withdrawal directly
      Alert.alert(
        "Confirm Withdrawal",
        `Withdraw ${getCurrencySymbol(walletData.currency)} ${numAmount.toFixed(
          2
        )} to ${selectedMethodData.label}?\n\nProcessing time: ${
          selectedMethodData.processingTime
        }\nFee: ${getCurrencySymbol(
          walletData.currency
        )} ${selectedMethodData.fee.toFixed(2)}`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setWithdrawing(false),
          },
          {
            text: "Confirm",
            style: "default",
            onPress: () => processWithdrawal(withdrawData),
          },
        ]
      );
    } catch (err) {
      setWithdrawing(false);
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    }
  };

  const processWithdrawal = async (withdrawData: WithdrawRequest) => {
    try {
      await withdrawFunds(withdrawData);

      Alert.alert(
        "Withdrawal Successful",
        `Your withdrawal of ${numAmount.toFixed(2)} ${
          walletData?.currency
        } has been processed successfully.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form and go back
              setAmount("");
              setSelectedMethod(METHODS[0].id);
              router.back();
            },
          },
        ]
      );
    } catch (withdrawError) {
      Alert.alert(
        "Withdrawal Failed",
        withdrawError instanceof Error
          ? withdrawError.message
          : "An error occurred during withdrawal"
      );
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <TopBar title="Withdraw" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="mt-4 text-gray-600">Loading wallet data...</Text>
        </View>
      </View>
    );
  }

  if (error && !walletData) {
    return (
      <View className="flex-1 bg-background">
        <TopBar title="Withdraw" onBackPress={() => router.back()} />
        <View className="flex-1 justify-center items-center px-6">
          <Feather name="alert-circle" size={48} color="#EF4444" />
          <Text className="mt-4 text-lg font-medium text-gray-900 text-center">
            Unable to Load Wallet
          </Text>
          <Text className="mt-2 text-gray-600 text-center">{error}</Text>
          <TouchableOpacity
            onPress={loadWalletData}
            className="mt-6 bg-green-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* ── Top Bar ───────────────────────────────────────────── */}
      <TopBar title="Withdraw" onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        >
          {/* ── Available Balance ──────────────────────────────── */}
          <AvailableToWithdraw
            balance={availableBalance}
            currencySymbol={getCurrencySymbol(walletData?.currency || "TND")}
          />

          {/* ── Amount Input ──────────────────────────────────── */}
          <AmountInputCard
            amount={amount}
            onChangeAmount={setAmount}
            onMaxPress={() =>
              setAmount((availableBalance - selectedMethodData.fee).toString())
            }
            minAmount={MIN_WITHDRAW}
          />

          {/* ── Method Selection ──────────────────────────────── */}
          <Card extraStyle="p-4 bg-white rounded-2xl shadow-sm mx-4 mb-4">
            <Text className="text-base font-medium text-gray-900 mb-3">
              Withdrawal Method
            </Text>

            {METHODS.map(({ id, label, processingTime }) => {
              const isSelected = selectedMethod === id;

              return (
                <Pressable
                  key={id}
                  onPress={() => setSelectedMethod(id)}
                  android_ripple={{ color: "#d1fae5", borderless: false }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  className={`flex-row items-center p-3 rounded-xl mb-2 ${
                    isSelected
                      ? "border-2 border-green-600 bg-green-50"
                      : "border border-gray-200"
                  }`}
                >
                  <Feather
                    name={isSelected ? "check-circle" : "circle"}
                    size={22}
                    color={isSelected ? "#10B981" : "#9CA3AF"}
                    className="mr-3"
                  />

                  <View className="flex-1">
                    <Text className="text-base text-gray-900">{label}</Text>
                    <Text className="text-xs text-gray-500">
                      {processingTime}
                    </Text>
                  </View>

                  {isSelected && (
                    <Feather name="chevron-right" size={18} color="#10B981" />
                  )}
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => router.push("addWithdrawalMethod")}
              android_ripple={{ color: "#e5e7eb", borderless: false }}
              className="flex-row items-center pt-3 mt-1 border-t border-gray-100"
            >
              <Feather name="plus-circle" size={20} color="#374151" />
              <Text className="ml-2 text-sm font-medium text-gray-700">
                Add new method
              </Text>
            </Pressable>
          </Card>

          {/* ── Processing Time & Fees ────────────────────────── */}
          <Card extraStyle="p-4 bg-white rounded-2xl shadow-sm mx-4 mb-4">
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">Estimated time</Text>
              <Text className="text-sm font-medium text-gray-900">
                {selectedMethodData.processingTime}
              </Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">Processing fee</Text>
              <Text className="text-sm font-medium text-gray-900">
                {getCurrencySymbol(walletData?.currency || "TND")}{" "}
                {selectedMethodData.fee.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-gray-100">
              <Text className="text-sm font-medium text-gray-900">
                Total to withdraw
              </Text>
              <Text className="text-sm font-medium text-gray-900">
                {getCurrencySymbol(walletData?.currency || "TND")}{" "}
                {totalWithFee.toFixed(2)}
              </Text>
            </View>
          </Card>

          {/* ── Validation Messages ─────────────────────────────── */}
          {numAmount > 0 && numAmount < MIN_WITHDRAW && (
            <View className="mx-4 mb-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
              <Text className="text-sm text-yellow-800">
                Minimum withdrawal amount is{" "}
                {getCurrencySymbol(walletData?.currency || "TND")}{" "}
                {MIN_WITHDRAW.toFixed(2)}
              </Text>
            </View>
          )}

          {totalWithFee > availableBalance && numAmount >= MIN_WITHDRAW && (
            <View className="mx-4 mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
              <Text className="text-sm text-red-800">
                Insufficient funds. Available:{" "}
                {getCurrencySymbol(walletData?.currency || "TND")}{" "}
                {availableBalance.toFixed(2)}
              </Text>
            </View>
          )}

          {/* ── Security Reminder ─────────────────────────────── */}
          <View className="px-6 mb-4 flex-row items-center">
            <Feather name="shield" size={20} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-600">
              Secure withdrawal - Only withdraw to accounts in your name.
            </Text>
          </View>

          {/* ── Confirm Button ────────────────────────────────── */}
          <TouchableOpacity
            onPress={handleWithdraw}
            disabled={!valid}
            className={`mx-4 rounded-2xl py-4 items-center ${
              valid ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            {withdrawing ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="white" />
                <Text className="ml-2 text-base font-semibold text-white">
                  Processing...
                </Text>
              </View>
            ) : (
              <Text
                className={`text-base font-semibold ${
                  valid ? "text-white" : "text-gray-600"
                }`}
              >
                Confirm Withdrawal
              </Text>
            )}
          </TouchableOpacity>

          {/* ── View History Link ────────────────────────────── */}
          <TouchableOpacity
            onPress={() => router.push("transactions?filter=withdrawals")}
            className="mt-6 mb-8 flex-row items-center justify-center"
          >
            <Feather name="clock" size={16} color="#374151" />
            <Text className="ml-2 text-sm font-medium text-gray-900">
              View withdrawal history
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default WithdrawScreen;

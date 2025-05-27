// screens/main/components/wallet/WithdrawScreen.tsx

import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useRouter } from "expo-router";
import TopBar from "@main/components/profileScreens/components/ui/TopBar";
import Card from "@main/components/profileScreens/components/ui/card";
import AvailableToWithdraw from "../compoenets/ui/AvailableToWithdraw";
import AmountInputCard from "../compoenets/ui/AmountInputCard";
import DestinationSelector from "../compoenets/ui/DestinationSelector";

const DUMMY_BALANCE = 1250.0;
const MIN_WITHDRAW = 10.0;

type Method = {
  id: string;
  label: string;
};
const METHODS: Method[] = [
  { id: "bank", label: "Bank Transfer ••••1234" },
  { id: "wallet", label: "Mobile Wallet ••••5678" },
];

const WithdrawScreen: React.FC = () => {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>(METHODS[0].id);

  const numAmount = parseFloat(amount) || 0;
  const valid =
    numAmount >= MIN_WITHDRAW && numAmount <= DUMMY_BALANCE && selectedMethod;

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
          <AvailableToWithdraw balance={DUMMY_BALANCE} currencySymbol="$" />

          {/* ── Amount Input ──────────────────────────────────── */}
          <AmountInputCard
            amount={amount}
            onChangeAmount={setAmount}
            onMaxPress={() => setAmount(DUMMY_BALANCE.toString())}
            minAmount={MIN_WITHDRAW}
          />

          {/* ── Method Selection ──────────────────────────────── */}
          <Card extraStyle="p-4 bg-white rounded-2xl shadow-sm mx-4 mb-4">
            <Text className="text-base font-medium text-gray-900 mb-3">
              Destination
            </Text>

            {METHODS.map(({ id, label }) => {
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
                      {id === "bank"
                        ? "Arrives in 1–3 business days"
                        : "Instant"}
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
                1–3 business days
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-600">Fees</Text>
              <Text className="text-sm font-medium text-gray-900">$ 0.00</Text>
            </View>
          </Card>

          {/* ── Security Reminder ─────────────────────────────── */}
          <View className="px-6 mb-4 flex-row items-center">
            <Feather name="lock" size={20} color="#6B7280" />
            <Text className="ml-2 text-sm text-gray-600">
              Only withdraw to accounts in your name.
            </Text>
          </View>

          {/* ── Confirm Button ────────────────────────────────── */}
          <TouchableOpacity
            onPress={() =>
              valid &&
              router.push("confirmWithdraw", {
                amount,
                method: selectedMethod,
              })
            }
            disabled={!valid}
            className={`mx-4 rounded-2xl py-4 items-center ${
              valid ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                valid ? "text-white" : "text-gray-600"
              }`}
            >
              Confirm Withdrawal
            </Text>
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
